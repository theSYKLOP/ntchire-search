import { searchGabonCompanies, mapGoogleResultToCompany } from './google'
import { searchInstagramProfiles, mapInstagramProfileToCompany } from './instagram'
import { searchTikTokProfiles, mapTikTokProfileToCompany } from './tiktok'
import { analyzeHashtags } from './hashtag-analyzer'
import { searchPagesAdvanced, mapFacebookPageToCompany } from './facebook'
import type { FallbackSearchResult } from './types'

export interface Company {
  externalId: string
  name: string
  bio: string
  profileImage: string
  platform: string
  profileUrl: string
  activityDomain: string
  location: string
  followers: number
  verified: boolean
  gabonScore: number
  hashtags: string[]
  lastPostDate: string
  suggestedHashtags?: string[]
  contactInfo: {
    phone: string
    email: string
    website?: string
  }
}

// Interface locale pour les options de fallback (différente de SearchOptions du cache)
export interface FallbackOptions {
  query: string
  limit: number
  platforms: ('facebook' | 'instagram' | 'tiktok' | 'google')[]
  useFallback: boolean
}

export async function performFallbackSearch(options: FallbackOptions): Promise<FallbackSearchResult> {
  const { query, limit, platforms, useFallback } = options
  const companies: Company[] = []
  const sources: string[] = []
  const errors: string[] = []
  
  console.log(`🔍 Recherche fallback pour: "${query}" sur ${platforms.join(', ')}`)
  
  // 1. Recherche Facebook (priorité haute)
  if (platforms.includes('facebook')) {
    try {
      console.log('📘 Recherche Facebook...')
      const facebookResults = await searchPagesAdvanced(query, Math.ceil(limit * 0.4))
      
      for (const page of facebookResults.data) {
        try {
          const mapped = mapFacebookPageToCompany(page)
          const hashtagAnalysis = analyzeHashtags({
            bio: mapped.bio,
            name: mapped.name,
            hashtags: mapped.hashtags,
            platform: 'facebook'
          })
          
          if (hashtagAnalysis.isGabonCompany) {
            const company: Company = {
              ...mapped,
              activityDomain: hashtagAnalysis.industryHashtags.length > 0 ? 
                detectIndustryFromHashtags(hashtagAnalysis.industryHashtags) : 'non spécifié',
              gabonScore: hashtagAnalysis.gabonScore,
              verified: false,
              hashtags: hashtagAnalysis.gabonHashtags.concat(hashtagAnalysis.businessHashtags),
              lastPostDate: new Date().toISOString(),
              suggestedHashtags: hashtagAnalysis.suggestedHashtags,
              contactInfo: {
                phone: '',
                email: '',
                website: ''
              }
            }
            companies.push(company)
          }
        } catch (e: unknown) {
          console.warn('Erreur traitement page Facebook:', e)
        }
      }
      
      if (facebookResults.data.length > 0) {
        sources.push('facebook')
        console.log(`✅ Facebook: ${companies.length} entreprises trouvées`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      errors.push(`Facebook: ${errorMessage}`)
      console.warn('❌ Erreur Facebook:', errorMessage)
    }
  }
  
  // 2. Recherche Instagram
  if (platforms.includes('instagram') && companies.length < limit) {
    try {
      console.log('📷 Recherche Instagram...')
      const instagramResults = await searchInstagramProfiles(query, Math.ceil(limit * 0.3))
      
      for (const profile of instagramResults) {
        try {
          const mapped = mapInstagramProfileToCompany(profile)
          const hashtagAnalysis = analyzeHashtags({
            bio: mapped.bio,
            name: mapped.name,
            hashtags: mapped.hashtags,
            platform: 'instagram'
          })
          
          if (hashtagAnalysis.isGabonCompany && hashtagAnalysis.isBusinessAccount) {
            const company = {
              ...mapped,
              activityDomain: hashtagAnalysis.industryHashtags.length > 0 ? 
                detectIndustryFromHashtags(hashtagAnalysis.industryHashtags) : 'non spécifié',
              gabonScore: hashtagAnalysis.gabonScore,
              verified: profile.is_verified,
              hashtags: hashtagAnalysis.gabonHashtags.concat(hashtagAnalysis.businessHashtags),
              lastPostDate: new Date().toISOString(),
              suggestedHashtags: hashtagAnalysis.suggestedHashtags
            }
            companies.push(company)
          }
        } catch (e: unknown) {
          console.warn('Erreur traitement profil Instagram:', e)
        }
      }
      
      if (instagramResults.length > 0) {
        sources.push('instagram')
        console.log(`✅ Instagram: ${instagramResults.length} profils trouvés`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      errors.push(`Instagram: ${errorMessage}`)
      console.warn('❌ Erreur Instagram:', errorMessage)
    }
  }
  
  // 3. Recherche TikTok
  if (platforms.includes('tiktok') && companies.length < limit) {
    try {
      console.log('🎵 Recherche TikTok...')
      const tiktokResults = await searchTikTokProfiles(query, Math.ceil(limit * 0.2))
      
      for (const profile of tiktokResults) {
        try {
          const mapped = mapTikTokProfileToCompany(profile)
          const hashtagAnalysis = analyzeHashtags({
            bio: mapped.bio,
            name: mapped.name,
            hashtags: mapped.hashtags,
            platform: 'tiktok'
          })
          
          if (hashtagAnalysis.isGabonCompany && hashtagAnalysis.isBusinessAccount) {
            const company = {
              ...mapped,
              activityDomain: hashtagAnalysis.industryHashtags.length > 0 ? 
                detectIndustryFromHashtags(hashtagAnalysis.industryHashtags) : 'non spécifié',
              gabonScore: hashtagAnalysis.gabonScore,
              verified: profile.verified,
              hashtags: hashtagAnalysis.gabonHashtags.concat(hashtagAnalysis.businessHashtags),
              lastPostDate: new Date().toISOString(),
              suggestedHashtags: hashtagAnalysis.suggestedHashtags
            }
            companies.push(company)
          }
        } catch (e: unknown) {
          console.warn('Erreur traitement profil TikTok:', e)
        }
      }
      
      if (tiktokResults.length > 0) {
        sources.push('tiktok')
        console.log(`✅ TikTok: ${tiktokResults.length} profils trouvés`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      errors.push(`TikTok: ${errorMessage}`)
      console.warn('❌ Erreur TikTok:', errorMessage)
    }
  }
  
  // 4. Recherche Google (fallback final)
  if (platforms.includes('google') && companies.length < limit && useFallback) {
    try {
      console.log('🔍 Recherche Google...')
      const googleResults = await searchGabonCompanies(query, Math.ceil(limit * 0.3))
      
      for (const result of googleResults) {
        try {
          // Déterminer la plateforme basée sur l'URL
          const platform = result.link.includes('facebook.com') ? 'facebook' :
                          result.link.includes('instagram.com') ? 'instagram' :
                          result.link.includes('tiktok.com') ? 'tiktok' : 'google'
          
          const mapped = mapGoogleResultToCompany(result, platform)
          const hashtagAnalysis = analyzeHashtags({
            bio: mapped.bio,
            name: mapped.name,
            hashtags: mapped.hashtags,
            platform: platform
          })
          
          if (hashtagAnalysis.isGabonCompany) {
            const company: Company = {
              ...mapped,
              activityDomain: hashtagAnalysis.industryHashtags.length > 0 ? 
                detectIndustryFromHashtags(hashtagAnalysis.industryHashtags) : 'non spécifié',
              gabonScore: hashtagAnalysis.gabonScore,
              verified: false,
              hashtags: hashtagAnalysis.gabonHashtags.concat(hashtagAnalysis.businessHashtags),
              lastPostDate: new Date().toISOString(),
              suggestedHashtags: hashtagAnalysis.suggestedHashtags,
              contactInfo: {
                phone: '',
                email: '',
                website: ''
              }
            }
            companies.push(company)
          }
        } catch (e: unknown) {
          console.warn('Erreur traitement résultat Google:', e)
        }
      }
      
      if (googleResults.length > 0) {
        sources.push('google')
        console.log(`✅ Google: ${googleResults.length} résultats trouvés`)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      errors.push(`Google: ${errorMessage}`)
      console.warn('❌ Erreur Google:', errorMessage)
    }
  }
  
  // Dédupliquer les résultats basés sur l'URL du profil
  const uniqueCompanies = companies.filter((company, index, self) => 
    index === self.findIndex(c => c.profileUrl === company.profileUrl)
  )
  
  return {
    companies: uniqueCompanies.slice(0, limit),
    sources,
    totalResults: uniqueCompanies.length,
    errors
  }
}

function detectIndustryFromHashtags(industryHashtags: string[]): string {
  const industryMap: { [key: string]: string } = {
    'restaurant': 'restauration',
    'food': 'restauration',
    'cuisine': 'restauration',
    'tech': 'technologie',
    'technology': 'technologie',
    'digital': 'technologie',
    'mode': 'mode',
    'fashion': 'mode',
    'style': 'mode',
    'immobilier': 'immobilier',
    'realestate': 'immobilier',
    'property': 'immobilier',
    'formation': 'formation',
    'education': 'formation',
    'training': 'formation',
    'transport': 'transport',
    'logistics': 'transport',
    'santé': 'santé',
    'health': 'santé',
    'medical': 'santé',
    'événement': 'événementiel',
    'event': 'événementiel',
    'organisation': 'événementiel',
    'commerce': 'commerce',
    'business': 'commerce',
    'shop': 'commerce',
    'tourisme': 'tourisme',
    'tourism': 'tourisme',
    'voyage': 'tourisme'
  }
  
  for (const hashtag of industryHashtags) {
    const cleanTag = hashtag.replace('#', '').toLowerCase()
    for (const [keyword, industry] of Object.entries(industryMap)) {
      if (cleanTag.includes(keyword)) {
        return industry
      }
    }
  }
  
  return 'non spécifié'
}

export async function searchByHashtag(hashtag: string, limit = 20): Promise<FallbackSearchResult> {
  const companies: Company[] = []
  const sources: string[] = []
  const errors: string[] = []
  
  console.log(`🏷️ Recherche par hashtag: "${hashtag}"`)
  
  // Recherche sur Instagram par hashtag
  try {
    const instagramResults = await searchInstagramProfiles(hashtag, Math.ceil(limit * 0.4))
    for (const profile of instagramResults) {
      const mapped = mapInstagramProfileToCompany(profile)
      const hashtagAnalysis = analyzeHashtags({
        bio: mapped.bio,
        name: mapped.name,
        hashtags: mapped.hashtags,
        platform: 'instagram'
      })
      
      if (hashtagAnalysis.isGabonCompany) {
        companies.push({
          ...mapped,
          activityDomain: detectIndustryFromHashtags(hashtagAnalysis.industryHashtags),
          gabonScore: hashtagAnalysis.gabonScore,
          verified: profile.is_verified,
          hashtags: hashtagAnalysis.gabonHashtags.concat(hashtagAnalysis.businessHashtags),
          lastPostDate: new Date().toISOString(),
          suggestedHashtags: hashtagAnalysis.suggestedHashtags
        })
      }
    }
    if (instagramResults.length > 0) sources.push('instagram')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    errors.push(`Instagram hashtag: ${errorMessage}`)
  }
  
  // Recherche sur TikTok par hashtag
  try {
    const tiktokResults = await searchTikTokProfiles(hashtag, Math.ceil(limit * 0.4))
    for (const profile of tiktokResults) {
      const mapped = mapTikTokProfileToCompany(profile)
      const hashtagAnalysis = analyzeHashtags({
        bio: mapped.bio,
        name: mapped.name,
        hashtags: mapped.hashtags,
        platform: 'tiktok'
      })
      
      if (hashtagAnalysis.isGabonCompany) {
        companies.push({
          ...mapped,
          activityDomain: detectIndustryFromHashtags(hashtagAnalysis.industryHashtags),
          gabonScore: hashtagAnalysis.gabonScore,
          verified: profile.verified,
          hashtags: hashtagAnalysis.gabonHashtags.concat(hashtagAnalysis.businessHashtags),
          lastPostDate: new Date().toISOString(),
          suggestedHashtags: hashtagAnalysis.suggestedHashtags
        })
      }
    }
    if (tiktokResults.length > 0) sources.push('tiktok')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    errors.push(`TikTok hashtag: ${errorMessage}`)
  }
  
  return {
    companies: companies.slice(0, limit),
    sources,
    totalFound: companies.length,
    success: errors.length === 0
  }
}
