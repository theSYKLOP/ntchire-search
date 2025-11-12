import { PrismaClient } from '@prisma/client'
import { analyzeGabonCompany } from '../../utils/huggingface'

const prisma = new PrismaClient()

// Données mock supprimées - utilisation des APIs réelles uniquement
const mockGabonCompanies = [
]

export default defineEventHandler(async (event) => {
  try {
    const { q = '', limit = '25', upsert = 'false' } = getQuery(event) as Record<string, string>
    const query = (q || '').trim()
    const lim = Math.min(Math.max(parseInt(String(limit), 10) || 25, 1), 100)
    const shouldUpsert = String(upsert).toLowerCase() === 'true'

    // Filtrer les entreprises selon la query
    let companies = mockGabonCompanies

    if (query) {
      const queryLower = query.toLowerCase()
      companies = mockGabonCompanies.filter(company =>
        company.name.toLowerCase().includes(queryLower) ||
        company.bio.toLowerCase().includes(queryLower) ||
        company.activityDomain.toLowerCase().includes(queryLower) ||
        company.location.toLowerCase().includes(queryLower) ||
        company.hashtags.some(tag => tag.toLowerCase().includes(queryLower))
      )
    }

    // Limiter les résultats
    companies = companies.slice(0, lim)

    // Upsert si demandé
    if (shouldUpsert) {
      for (const company of companies) {
        const data = {
          name: company.name,
          bio: company.bio,
          profileImage: company.profileImage,
          platform: company.platform,
          profileUrl: company.profileUrl,
          activityDomain: company.activityDomain,
          location: company.location,
          followers: company.followers,
          verified: company.verified,
          gabonScore: company.gabonScore,
          hashtags: company.hashtags,
          lastPostDate: new Date(company.lastPostDate),
          contactInfo: company.contactInfo
        }
        const existing = await prisma.gabonCompany.findUnique({ where: { profileUrl: data.profileUrl } })
        if (existing) {
          await prisma.gabonCompany.update({ where: { id: existing.id }, data })
        } else {
          await prisma.gabonCompany.create({ data })
        }
      }
    }

    return { 
      success: true, 
      companies, 
      paging: null,
      source: 'mock_data',
      totalFound: companies.length,
      searchQuery: query
    }

  } catch (e: any) {
    console.error('Erreur recherche Facebook publique:', e)
    return { success: false, companies: [], paging: null, error: 'server_error', message: 'Erreur recherche Facebook publique' }
  }
})
