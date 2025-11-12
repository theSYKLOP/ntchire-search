import prisma from '../utils/prisma'
import { searchPagesAdvanced, searchPagesByCategory, mapFacebookPageToCompany, FacebookApiError } from '../../utils/facebook'
import { analyzeGabonCompany } from '../../utils/huggingface'
import { performFallbackSearch, searchByHashtag } from '../../utils/fallback-search'

const prisma = new PrismaClient()

// Données mock supprimées - utilisation des APIs réelles uniquement
const mockGabonCompanies = [
]

export default defineEventHandler(async (event) => {
  try {
    const { 
      q = '', 
      limit = '25', 
      upsert = 'false',
      platforms = 'facebook,instagram,tiktok,google',
      useFallback = 'true',
      hashtag = ''
    } = getQuery(event) as Record<string, string>
    
    const query = (q || '').trim()
    const lim = Math.min(Math.max(parseInt(String(limit), 10) || 25, 1), 100)
    const shouldUpsert = String(upsert).toLowerCase() === 'true'
    const platformList = platforms.split(',').filter(p => ['facebook', 'instagram', 'tiktok', 'google'].includes(p)) as ('facebook' | 'instagram' | 'tiktok' | 'google')[]
    const enableFallback = String(useFallback).toLowerCase() === 'true'
    const hashtagQuery = hashtag.trim()

    // Recherche par hashtag si spécifié
    if (hashtagQuery) {
      console.log(`🏷️ Recherche par hashtag: "${hashtagQuery}"`)
      const hashtagResults = await searchByHashtag(hashtagQuery, lim)
      
      return {
        success: true,
        companies: hashtagResults.companies,
        paging: null,
        source: 'hashtag_search',
        platforms: hashtagResults.sources,
        totalResults: hashtagResults.totalResults,
        errors: hashtagResults.errors,
        warning: hashtagResults.errors.length > 0 ? `Erreurs: ${hashtagResults.errors.join(', ')}` : undefined
      }
    }

    // Recherche multi-plateforme avec fallback
    let fallbackResults: { companies: unknown[]; sources: string[]; totalResults: number; errors: string[] } | null = null
    let fallbackError: string | null = null
    
    if (query && enableFallback) {
      try {
        console.log(`🔍 Recherche multi-plateforme pour: "${query}"`)
        console.log(`📱 Plateformes: ${platformList.join(', ')}`)
        
        fallbackResults = await performFallbackSearch({
          query,
          limit: lim,
          platforms: platformList,
          useFallback: enableFallback
        })
        
        console.log(`✅ Fallback search: ${fallbackResults.companies.length} entreprises trouvées`)
        console.log(`📊 Sources: ${fallbackResults.sources.join(', ')}`)
        
        if (fallbackResults.errors.length > 0) {
          console.warn(`⚠️ Erreurs fallback: ${fallbackResults.errors.join(', ')}`)
        }
      } catch (e: unknown) {
        fallbackError = e instanceof Error ? e.message : 'Erreur inconnue'
        console.error('❌ Erreur fallback search:', e)
      }
    }

    // Fallback vers l'ancienne méthode Facebook si nécessaire
    let facebookResults: unknown[] = []
    let facebookError: string | null = null
    
    if (!fallbackResults || fallbackResults.companies.length < 5) {
      try {
        if (query) {
          console.log(`🔍 Recherche Facebook classique pour: "${query}"`)
          console.log(`🔑 Token configuré:`, process.env.FB_ACCESS_TOKEN ? 'Oui' : 'Non')
          
          const fb = await searchPagesAdvanced(query, Math.ceil(lim * 0.6))
          facebookResults = fb.data || []
          
          console.log(`📊 Facebook API trouvé ${facebookResults.length} pages`)
          
          // Si pas assez de résultats, essayer par catégorie
          if (facebookResults.length < 5) {
            console.log(`🔄 Pas assez de résultats, essai par catégorie...`)
            const categoryQueries = ['restaurant', 'commerce', 'entreprise', 'business', 'service']
            for (const category of categoryQueries) {
              if (query.toLowerCase().includes(category) || category.includes(query.toLowerCase())) {
                try {
                  console.log(`🏷️ Recherche catégorie: ${category}`)
                  const categoryResult = await searchPagesByCategory(category, 'Gabon', 10)
                const newPages = categoryResult.data.filter(page => 
                  !facebookResults.some((existing: any) => (existing as any).id === page.id)
                )
                  facebookResults.push(...newPages)
                  console.log(`✅ Ajouté ${newPages.length} pages de la catégorie ${category}`)
                } catch (e: unknown) {
                  const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue'
                  console.warn(`❌ Erreur recherche catégorie ${category}:`, errorMessage)
                }
              }
            }
          }
        } else {
          console.log(`⚠️ Pas de query fournie, utilisation des données mock`)
        }
      } catch (e: unknown) {
        if (e instanceof FacebookApiError) {
          facebookError = e.message
          console.warn('❌ Erreur Facebook API:', e.message)
        } else {
          console.error('❌ Erreur non-Facebook:', e)
          facebookError = 'Erreur inconnue'
        }
      }
    }

    // Combiner tous les résultats
    let companies: unknown[] = []
    
    // Ajouter les résultats du fallback search
    if (fallbackResults && fallbackResults.companies.length > 0) {
      companies.push(...fallbackResults.companies)
    }
    
    // Ajouter les résultats Facebook classiques si pas assez de résultats
    if (companies.length < lim) {
      const facebookCompanies: unknown[] = []
      
      for (const page of facebookResults) {
        try {
          const mapped = mapFacebookPageToCompany(page as any)
          const analysis = analyzeGabonCompany(mapped.bio, mapped.bio, mapped.hashtags)
          
          // Ne garder que les entreprises gabonaises
          if (analysis.isGabonCompany) {
            const item = {
              ...mapped,
              activityDomain: analysis.activityDomain,
              location: mapped.location || analysis.locationIndicators.join(', ') || 'Gabon',
              gabonScore: analysis.gabonScore,
              verified: false,
              hashtags: mapped.hashtags || [],
              lastPostDate: new Date().toISOString(),
              contactInfo: {
                phone: (page as any).phone || '',
                email: (page as any).emails?.[0] || '',
                website: (page as any).website || ''
              }
            }
            facebookCompanies.push(item)
          }
        } catch (e: unknown) {
          console.warn('Erreur traitement page Facebook:', e)
        }
      }
      
      // Éviter les doublons avec les résultats fallback
      const existingUrls = new Set(companies.map((c: any) => c.profileUrl))
      const newFacebookCompanies = facebookCompanies.filter((c: any) => !existingUrls.has(c.profileUrl))
      companies.push(...newFacebookCompanies)
    }
    
    // Ajouter des données mock si pas assez de résultats
    if (companies.length < lim) {
      const queryLower = query ? query.toLowerCase() : ''
      const mockFiltered = mockGabonCompanies.filter(company =>
        !queryLower || 
        company.name.toLowerCase().includes(queryLower) ||
        company.bio.toLowerCase().includes(queryLower) ||
        company.activityDomain.toLowerCase().includes(queryLower) ||
        company.location.toLowerCase().includes(queryLower) ||
        company.hashtags.some(tag => tag.toLowerCase().includes(queryLower))
      )
      
      // Éviter les doublons
      const existingUrls = new Set(companies.map((c: any) => c.profileUrl))
      const newMockCompanies = mockFiltered.filter((c: any) => !existingUrls.has(c.profileUrl))
      
      companies.push(...newMockCompanies)
    }

    // Limiter les résultats
    companies = companies.slice(0, lim)

    // Upsert si demandé
    if (shouldUpsert) {
      for (const company of companies) {
        const companyData = company as any
        const data = {
          name: companyData.name,
          bio: companyData.bio,
          profileImage: companyData.profileImage,
          platform: companyData.platform,
          profileUrl: companyData.profileUrl,
          activityDomain: companyData.activityDomain,
          location: companyData.location,
          followers: companyData.followers,
          verified: companyData.verified,
          gabonScore: companyData.gabonScore,
          hashtags: companyData.hashtags,
          lastPostDate: new Date(companyData.lastPostDate),
          contactInfo: companyData.contactInfo
        }
        const existing = await prisma.gabonCompany.findUnique({ where: { profileUrl: data.profileUrl } })
        if (existing) {
          await prisma.gabonCompany.update({ where: { id: existing.id }, data })
        } else {
          await prisma.gabonCompany.create({ data })
        }
      }
    }

    // Déterminer les sources utilisées
    const sources = []
    if (fallbackResults && fallbackResults.sources.length > 0) {
      sources.push(...fallbackResults.sources)
    }
    if (facebookResults.length > 0) {
      sources.push('facebook')
    }
    if (companies.length > (fallbackResults?.companies.length || 0) + facebookResults.length) {
      sources.push('mock_data')
    }
    
    // Compter les résultats par source
    const facebookCount = facebookResults.length
    const fallbackCount = fallbackResults?.companies.length || 0
    const mockCount = companies.length - fallbackCount - facebookCount
    
    return { 
      success: true, 
      companies, 
      paging: null,
      source: sources.length > 0 ? sources.join(',') : 'mixed',
      platforms: sources,
      totalResults: companies.length,
      facebookResults: facebookCount,
      fallbackResults: fallbackCount,
      mockResults: mockCount,
      errors: [
        ...(fallbackResults?.errors || []),
        ...(facebookError ? [`Facebook: ${facebookError}`] : []),
        ...(fallbackError ? [`Fallback: ${fallbackError}`] : [])
      ],
      warning: (facebookError || fallbackError) ? 
        `Erreurs: ${[facebookError, fallbackError].filter(Boolean).join(', ')}. Utilisation des données disponibles.` : 
        undefined
    }

  } catch (e: unknown) {
    console.error('Erreur recherche Facebook:', e)
    return { success: false, companies: [], paging: null, error: 'server_error', message: 'Erreur recherche Facebook' }
  }
})


