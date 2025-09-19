import { PrismaClient } from '@prisma/client'
import { searchPages, mapFacebookPageToCompany, FacebookApiError } from '../../utils/facebook'
import { analyzeGabonCompany } from '../../utils/huggingface'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { q = '', limit = '25', after = '', upsert = 'false' } = getQuery(event) as Record<string, string>
    const query = (q || '').trim()
    if (!query) {
      return { success: true, companies: [], paging: null, warning: 'empty_query' }
    }

    const lim = Math.min(Math.max(parseInt(String(limit), 10) || 25, 1), 100)
    const fb = await searchPages(query, lim, after || undefined)

    const companies = [] as any[]
    const shouldUpsert = String(upsert).toLowerCase() === 'true'

    for (const page of fb.data) {
      const mapped = mapFacebookPageToCompany(page)
      const analysis = analyzeGabonCompany(mapped.bio, mapped.bio, mapped.hashtags)
      const item = {
        ...mapped,
        activityDomain: analysis.activityDomain,
        location: mapped.location || analysis.locationIndicators.join(', ') || 'Gabon',
        gabonScore: analysis.gabonScore
      }
      companies.push(item)

      if (shouldUpsert && analysis.isGabonCompany) {
        const data = {
          name: item.name,
          bio: item.bio,
          profileImage: item.profileImage,
          platform: 'facebook' as const,
          profileUrl: item.profileUrl,
          activityDomain: item.activityDomain,
          location: item.location,
          followers: item.followers,
          verified: false,
          gabonScore: item.gabonScore,
          hashtags: item.hashtags,
          lastPostDate: new Date(),
          contactInfo: {}
        }
        const existing = await prisma.gabonCompany.findUnique({ where: { profileUrl: data.profileUrl } })
        if (existing) {
          await prisma.gabonCompany.update({ where: { id: existing.id }, data })
        } else {
          await prisma.gabonCompany.create({ data })
        }
      }
    }

    return { success: true, companies, paging: fb.paging }
  } catch (e: any) {
    if (e instanceof FacebookApiError) {
      // Retour résilient au lieu de 4xx/5xx levés jusqu'au client
      return { success: false, companies: [], paging: null, error: 'facebook_error', code: e.status, message: e.message }
    }
    console.error('Erreur recherche Facebook:', e)
    return { success: false, companies: [], paging: null, error: 'server_error', message: 'Erreur recherche Facebook' }
  }
})


