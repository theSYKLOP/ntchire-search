import { PrismaClient } from '@prisma/client'
import { analyzeGabonCompany } from '../../utils/huggingface'

const prisma = new PrismaClient()

// Données mock réalistes d'entreprises gabonaises
const mockGabonCompanies = [
  {
    id: 'mock-1',
    name: 'Restaurant Le Gabonais',
    bio: 'Restaurant traditionnel gabonais à Libreville. Spécialités locales, poissons frais, plantain et manioc. #Gabon #Libreville #RestaurantGabonais #MadeInGabon',
    profileImage: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=RG',
    platform: 'facebook' as const,
    profileUrl: 'https://facebook.com/restaurant-legabonais',
    activityDomain: 'restauration',
    location: 'Libreville, Gabon',
    followers: 1250,
    verified: false,
    gabonScore: 85,
    hashtags: ['#Gabon', '#Libreville', '#RestaurantGabonais', '#MadeInGabon'],
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '+241 01 23 45 67',
      email: 'contact@legabonais.ga'
    }
  },
  {
    id: 'mock-2',
    name: 'Tech Gabon Solutions',
    bio: 'Solutions technologiques pour les entreprises gabonaises. Développement web, applications mobiles, digitalisation. 100% gabonais ! #GabonTech #InnovationGabon #PortGentil',
    profileImage: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=TGS',
    platform: 'facebook' as const,
    profileUrl: 'https://facebook.com/techgabonsolutions',
    activityDomain: 'technologie',
    location: 'Port-Gentil, Gabon',
    followers: 890,
    verified: false,
    gabonScore: 92,
    hashtags: ['#GabonTech', '#InnovationGabon', '#MadeInGabon', '#PortGentil'],
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '+241 01 98 76 54',
      email: 'info@techgabon.ga'
    }
  },
  {
    id: 'mock-3',
    name: 'Mode Gabonaise Authentique',
    bio: 'Créations de mode inspirées de la culture gabonaise. Vêtements traditionnels et modernes. Entreprise 100% gabonaise basée à Franceville. #ModeGabonaise #CultureGabon #Franceville',
    profileImage: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=MGA',
    platform: 'facebook' as const,
    profileUrl: 'https://facebook.com/modegabonaise',
    activityDomain: 'mode',
    location: 'Franceville, Gabon',
    followers: 2100,
    verified: false,
    gabonScore: 88,
    hashtags: ['#ModeGabonaise', '#CultureGabon', '#Franceville', '#MadeInGabon'],
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '+241 01 55 44 33',
      email: 'contact@modegabonaise.ga'
    }
  },
  {
    id: 'mock-4',
    name: 'Immobilier Gabon Pro',
    bio: 'Agence immobilière spécialisée dans l\'immobilier gabonais. Ventes, locations, investissements à Libreville et Port-Gentil. #ImmobilierGabon #Libreville #PortGentil',
    profileImage: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=IGP',
    platform: 'facebook' as const,
    profileUrl: 'https://facebook.com/immobiliergabonpro',
    activityDomain: 'immobilier',
    location: 'Libreville, Gabon',
    followers: 3200,
    verified: false,
    gabonScore: 90,
    hashtags: ['#ImmobilierGabon', '#Libreville', '#PortGentil', '#MadeInGabon'],
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '+241 01 77 88 99',
      email: 'contact@immobiliergabon.ga'
    }
  },
  {
    id: 'mock-5',
    name: 'Formation Gabon Excellence',
    bio: 'Centre de formation professionnelle au Gabon. Cours de langues, informatique, management. Certifications reconnues. #FormationGabon #Education #Libreville',
    profileImage: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=FGE',
    platform: 'facebook' as const,
    profileUrl: 'https://facebook.com/formationgabonexcellence',
    activityDomain: 'formation',
    location: 'Libreville, Gabon',
    followers: 1800,
    verified: false,
    gabonScore: 87,
    hashtags: ['#FormationGabon', '#Education', '#Libreville', '#MadeInGabon'],
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '+241 01 33 44 55',
      email: 'info@formationgabon.ga'
    }
  }
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
