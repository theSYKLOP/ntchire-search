import prisma from '../utils/prisma'
import { analyzeGabonCompany } from '../../utils/huggingface'
import { FacebookApiError, mapFacebookPageToCompany, searchPages } from '../../utils/facebook'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    if (getMethod(event) !== 'POST') {
      throw createError({ statusCode: 405, statusMessage: 'Méthode non autorisée' })
    }

    const body = await readBody<{
      q: string
      limit?: number
      after?: string
    }>(event)

    const q = (body?.q || '').trim()
    if (!q) {
      throw createError({ statusCode: 400, statusMessage: 'Paramètre q requis' })
    }

    const limit = Math.min(Math.max(body?.limit || 25, 1), 100)
    const after = body?.after

    // Recherche Facebook Pages
    const fb = await searchPages(q, limit, after)

    const results = [] as Array<{ id: string; action: 'created' | 'updated' | 'skipped'; name: string }>

    for (const page of fb.data) {
      const mapped = mapFacebookPageToCompany(page)

      // Analyse gabonaise
      const analysis = analyzeGabonCompany(mapped.bio, mapped.bio, mapped.hashtags)
      if (!analysis.isGabonCompany) {
        results.push({ id: page.id, action: 'skipped', name: mapped.name })
        continue
      }

      const data = {
        name: mapped.name,
        bio: mapped.bio,
        profileImage: mapped.profileImage,
        platform: 'facebook' as const,
        profileUrl: mapped.profileUrl,
        activityDomain: analysis.activityDomain,
        location: mapped.location || analysis.locationIndicators.join(', ') || 'Gabon',
        followers: mapped.followers,
        verified: false,
        gabonScore: analysis.gabonScore,
        hashtags: mapped.hashtags,
        lastPostDate: new Date(),
        contactInfo: {}
      }

      // Upsert par profileUrl (unique)
      const existing = await prisma.gabonCompany.findUnique({ where: { profileUrl: data.profileUrl } })
      if (existing) {
        await prisma.gabonCompany.update({ where: { id: existing.id }, data })
        results.push({ id: existing.id, action: 'updated', name: data.name })
      } else {
        const created = await prisma.gabonCompany.create({ data })
        results.push({ id: created.id, action: 'created', name: data.name })
      }
    }

    return { success: true, results, paging: fb.paging }
  } catch (e: any) {
    if (e instanceof FacebookApiError) {
      throw createError({ statusCode: e.status || 502, statusMessage: e.message })
    }
    console.error('Erreur ingestion Facebook:', e)
    throw createError({ statusCode: 500, statusMessage: 'Erreur ingestion Facebook' })
  }
})


