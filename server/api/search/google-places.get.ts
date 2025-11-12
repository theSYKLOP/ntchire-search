import { searchGooglePlaces, mapGooglePlaceToCompany } from '../../utils/google'
import { extractCompanyInfo } from '../../utils/huggingface'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Types d'activités connues au Gabon
const ACTIVITY_TYPES = [
  'restaurant', 'resto', 'manger', 'cuisine', 'gastronomie',
  'coiffure', 'salon', 'coiffeur', 'barber', 'barbier',
  'hotel', 'hôtel', 'hébergement', 'auberge',
  'boutique', 'magasin', 'shop', 'commerce',
  'bar', 'pub', 'night', 'boite', 'discothèque',
  'spa', 'massage', 'beauté', 'esthétique',
  'pharmacie', 'santé', 'clinique', 'hopital',
  'école', 'formation', 'education', 'université',
  'banque', 'finance', 'assurance',
  'garage', 'mécanique', 'auto', 'voiture'
]

// Localisations au Gabon
const GABON_LOCATIONS = [
  'libreville', 'lalala', 'akanda', 'owendo', 'ntoum',
  'port-gentil', 'franceville', 'oyem', 'moanda',
  'tchibanga', 'mouila', 'lambaréné', 'koulamoutou',
  'makokou', 'bitam', 'mitzic', 'minvoul',
  'vieux port', 'nombakele', 'glass', 'louis', 'montagne sainte',
  'oloumi', 'okala', 'nzeng ayong', 'pk', 'sotega'
]

/**
 * Filtre les résultats Google Places selon leur pertinence par rapport à la requête
 */
function filterRelevantPlaces(places: any[], searchQuery: string): any[] {
  const query = searchQuery.toLowerCase().trim()
  const queryWords = query.split(/\s+/)
  
  // Extraire le type d'activité et la localisation de la requête
  const activityType = ACTIVITY_TYPES.find(type => query.includes(type))
  const location = GABON_LOCATIONS.find(loc => query.includes(loc))
  
  console.log('🔍 Filtrage:', { activityType, location, queryWords })
  
  return places.filter(place => {
    const placeName = (place.name || '').toLowerCase()
    const placeAddress = (place.formatted_address || '').toLowerCase()
    const placeTypes = (place.types || []).map((t: string) => t.toLowerCase())
    
    // 🚨 FILTRE GÉOGRAPHIQUE STRICT: SEULEMENT LE GABON
    const isInGabon = placeAddress.includes('gabon') || 
                      placeAddress.includes('libreville') || 
                      placeAddress.includes('port-gentil') ||
                      placeAddress.includes('franceville') ||
                      GABON_LOCATIONS.some(loc => placeAddress.includes(loc))
    
    if (!isInGabon) {
      console.log(`❌ HORS GABON: ${place.name} - ${placeAddress}`)
      return false // Exclure TOUT ce qui n'est pas au Gabon
    }
    
    let score = 0
    
    // 1. Vérifier la correspondance du type d'activité
    if (activityType) {
      // Vérifier dans le nom
      if (placeName.includes(activityType)) score += 10
      
      // Vérifier dans les types Google
      const activityMatches = placeTypes.some((type: string) => 
        type.includes(activityType) || activityType.includes(type)
      )
      if (activityMatches) score += 10
      
      // Si aucune correspondance, pénaliser fortement
      if (score === 0) score -= 50
    }
    
    // 2. Vérifier la correspondance de la localisation spécifique
    if (location) {
      // Vérifier dans le nom
      if (placeName.includes(location)) score += 15
      
      // Vérifier dans l'adresse
      if (placeAddress.includes(location)) score += 15
      
      // Si aucune correspondance, pénaliser
      if (!placeName.includes(location) && !placeAddress.includes(location)) {
        score -= 30
      }
    }
    
    // 3. Vérifier la présence d'autres mots-clés de la requête
    queryWords.forEach(word => {
      if (word.length > 2) { // Ignorer les mots trop courts
        if (placeName.includes(word)) score += 5
        if (placeAddress.includes(word)) score += 3
      }
    })
    
    // 4. Bonus pour les places avec beaucoup d'informations
    if (place.rating && place.rating >= 4) score += 2
    if (place.user_ratings_total && place.user_ratings_total > 10) score += 2
    if (place.opening_hours) score += 1
    
    console.log(`📊 ${place.name} (Gabon: ✅): score=${score}`, { 
      activityMatch: activityType && (placeName.includes(activityType) || placeTypes.some((t: string) => t.includes(activityType))),
      locationMatch: location && (placeName.includes(location) || placeAddress.includes(location))
    })
    
    // Retourner seulement les places avec un score positif
    return score > 0
  }).sort((a, b) => {
    // Trier par pertinence (calculer à nouveau le score pour le tri)
    const scoreA = calculateRelevanceScore(a, activityType, location, queryWords)
    const scoreB = calculateRelevanceScore(b, activityType, location, queryWords)
    return scoreB - scoreA
  })
}

/**
 * Calcule le score de pertinence d'une place
 */
function calculateRelevanceScore(place: any, activityType?: string, location?: string, queryWords?: string[]): number {
  let score = 0
  const placeName = (place.name || '').toLowerCase()
  const placeAddress = (place.formatted_address || '').toLowerCase()
  const placeTypes = (place.types || []).map((t: string) => t.toLowerCase())
  
  if (activityType) {
    if (placeName.includes(activityType)) score += 10
    if (placeTypes.some((t: string) => t.includes(activityType) || activityType.includes(t))) score += 10
  }
  
  if (location) {
    if (placeName.includes(location)) score += 15
    if (placeAddress.includes(location)) score += 15
  }
  
  if (queryWords) {
    queryWords.forEach(word => {
      if (word.length > 2) {
        if (placeName.includes(word)) score += 5
        if (placeAddress.includes(word)) score += 3
      }
    })
  }
  
  if (place.rating && place.rating >= 4) score += 2
  if (place.user_ratings_total && place.user_ratings_total > 10) score += 2
  if (place.opening_hours) score += 1
  
  return score
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const searchTerm = (query.q as string) || ''
    const limitParam = parseInt(query.limit as string) || 20
    const upsertParam = query.upsert === 'true'
    
    console.log('🏢 Recherche Google Places pour:', searchTerm)
    
    if (!searchTerm.trim()) {
      return { 
        success: true, 
        companies: [],
        source: 'google_places',
        message: 'Terme de recherche requis'
      }
    }
    
    // 1. Rechercher sur Google Places avec filtrage intelligent
    const places = await searchGooglePlaces(searchTerm, 'Gabon', limitParam * 2) // Chercher plus pour filtrer ensuite
    console.log('🏢 Places brutes trouvées:', places.length)
    
    // 2. Filtrer les résultats selon la pertinence de la recherche
    const filteredPlaces = filterRelevantPlaces(places, searchTerm)
    console.log('🏢 Places filtrées pertinentes:', filteredPlaces.length)
    
    // Si Google Places ne retourne rien (API non activée), utiliser Custom Search en fallback
    if (places.length === 0) {
      console.warn('⚠️ Google Places vide - Utilisation de Custom Search en fallback')
      
      try {
        const { searchGabonCompanies, mapGoogleResultToCompany } = await import('../../utils/google')
        const searchResults = await searchGabonCompanies(searchTerm, limitParam)
        
        if (searchResults && searchResults.length > 0) {
          console.log(`🔍 Custom Search: ${searchResults.length} résultats trouvés`)
          
          const companies = []
          for (const result of searchResults) {
            try {
              // Déterminer la plateforme du résultat
              let platform = 'google'
              if (result.link.includes('facebook.com')) platform = 'facebook'
              else if (result.link.includes('instagram.com')) platform = 'instagram'
              else if (result.link.includes('tiktok.com')) platform = 'tiktok'
              
              const companyData = mapGoogleResultToCompany(result, platform)
              
              if (companyData.gabonScore >= 30) {
                if (upsertParam) {
                  try {
                    const existingCompany = await prisma.gabonCompany.findUnique({
                      where: { profileUrl: companyData.profileUrl }
                    })
                    
                    if (existingCompany) {
                      const updatedCompany = await prisma.gabonCompany.update({
                        where: { id: existingCompany.id },
                        data: {
                          ...companyData,
                          id: existingCompany.id,
                          createdAt: existingCompany.createdAt,
                          updatedAt: new Date()
                        }
                      })
                      companies.push(updatedCompany)
                    } else {
                      const newCompany = await prisma.gabonCompany.create({
                        data: {
                          ...companyData,
                          id: undefined,
                          lastPostDate: new Date(companyData.lastPostDate),
                          lastScraped: new Date()
                        }
                      })
                      companies.push(newCompany)
                    }
                  } catch (dbError) {
                    console.error('❌ Erreur DB:', dbError)
                    companies.push(companyData)
                  }
                } else {
                  companies.push(companyData)
                }
              }
            } catch (parseError) {
              console.error('❌ Erreur parsing:', parseError)
            }
          }
          
          return {
            success: true,
            companies: companies,
            source: 'google_custom_search',
            total: companies.length,
            upserted: upsertParam,
            message: `${companies.length} entreprise(s) via Custom Search (Places API non disponible)`,
            warning: 'Google Places API non activée - Activez-la dans Google Cloud Console pour de meilleurs résultats'
          }
        }
      } catch (fallbackError) {
        console.error('❌ Erreur fallback Custom Search:', fallbackError)
      }
      
      return { 
        success: true, 
        companies: [],
        source: 'google_places',
        message: 'Aucune entreprise trouvée',
        error: 'Google Places API non activée - Consultez CONFIGURATION_GOOGLE_PLACES.md'
      }
    }
    
    // 2. Convertir les places en entreprises
    const companies = []
    
    for (const place of filteredPlaces.slice(0, limitParam)) { // Limiter après filtrage
      try {
        const companyData = mapGooglePlaceToCompany(place, 'google')
        
        // Vérifier si c'est une entreprise gabonaise
        if (companyData.gabonScore >= 30) {
          
          // 3. Si upsert demandé, sauvegarder en base
          if (upsertParam) {
            try {
              const existingCompany = await prisma.gabonCompany.findUnique({
                where: { profileUrl: companyData.profileUrl }
              })
              
              if (existingCompany) {
                // Mettre à jour les informations existantes
                const updatedCompany = await prisma.gabonCompany.update({
                  where: { id: existingCompany.id },
                  data: {
                    ...companyData,
                    id: existingCompany.id, // Garder l'ID existant
                    createdAt: existingCompany.createdAt, // Garder la date de création
                    updatedAt: new Date()
                  }
                })
                companies.push(updatedCompany)
                console.log(`✅ Entreprise mise à jour: ${companyData.name}`)
              } else {
                // Créer une nouvelle entreprise
                const newCompany = await prisma.gabonCompany.create({
                  data: {
                    ...companyData,
                    id: undefined, // Laisser Prisma générer l'ID
                    lastPostDate: companyData.lastPostDate ? new Date(companyData.lastPostDate) : new Date(),
                    lastScraped: new Date(),
                    openingHours: companyData.openingHours ? JSON.stringify(companyData.openingHours) : null
                  }
                })
                companies.push(newCompany)
                console.log(`🆕 Nouvelle entreprise créée: ${companyData.name}`)
              }
            } catch (dbError) {
              console.error('❌ Erreur base de données pour:', companyData.name, dbError)
              // Ajouter sans sauvegarder si erreur DB
              companies.push(companyData)
            }
          } else {
            // Simplement ajouter sans sauvegarder
            companies.push(companyData)
          }
        } else {
          console.log(`⚠️ Entreprise non gabonaise ignorée: ${companyData.name} (score: ${companyData.gabonScore})`)
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing place:', place.name, parseError)
      }
    }
    
    console.log(`✅ Google Places: ${companies.length} entreprises gabonaises trouvées`)
    
    return {
      success: true,
      companies: companies,
      source: 'google_places',
      total: companies.length,
      upserted: upsertParam,
      message: `${companies.length} entreprise(s) trouvée(s) sur Google Places`
    }
    
  } catch (error) {
    console.error('❌ Erreur API Google Places:', error)
    
    return {
      success: false,
      companies: [],
      source: 'google_places',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Erreur lors de la recherche Google Places'
    }
  }
})
