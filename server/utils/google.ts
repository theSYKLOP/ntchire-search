import axios, { AxiosError } from 'axios'
import type { GabonCompany } from '@prisma/client'
import { isGabonRelated, calculateGabonScore } from './types'
import { extractPhoneNumber, extractEmail, extractWebsite, extractOpeningHours, extractSocialNetworks, extractServices } from './huggingface'

export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
}

export interface GooglePlaceResult {
  place_id: string
  name: string
  formatted_address?: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  url?: string
  vicinity?: string
  rating?: number
  user_ratings_total?: number
  price_level?: number
  opening_hours?: {
    open_now?: boolean
    periods?: Array<{
      open: { day: number, time: string }
      close?: { day: number, time: string }
    }>
    weekday_text?: string[]
  }
  photos?: Array<{
    photo_reference: string
    width: number
    height: number
  }>
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
  types?: string[]
  business_status?: string
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
  searchInformation?: {
    totalResults: string
  }
}

export interface ReferencePage {
  id: string
  name: string
  platform: 'facebook' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter'
  url: string
  description?: string
  isActive: boolean
}

// Tableau configurable des pages de référence
export const REFERENCE_PAGES: ReferencePage[] = [
  {
    id: 'neryw-tv-facebook',
    name: "Nery'w TV",
    platform: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=61554197278426',
    description: 'Chaîne TV gabonaise - Actualités et divertissement',
    isActive: true
  },
  // Possibilité d'ajouter d'autres pages de référence
  // {
  //   id: 'example-instagram',
  //   name: 'Exemple Instagram',
  //   platform: 'instagram',
  //   url: 'instagram.com/exemple',
  //   description: 'Description de la page',
  //   isActive: true
  // }
]

export class GoogleSearchError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GoogleSearchError'
    this.status = status
  }
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || ''
const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1'
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place'

function ensureConfigured() {
  if (!GOOGLE_API_KEY) {
    throw new GoogleSearchError('GOOGLE_API_KEY manquant dans .env', 401)
  }
  // Custom Search Engine ID n'est plus obligatoire si on utilise seulement Places API
  // if (!GOOGLE_SEARCH_ENGINE_ID) {
  //   throw new GoogleSearchError('GOOGLE_SEARCH_ENGINE_ID manquant dans .env', 401)
  // }
}

export async function searchGabonCompanies(query: string, limit = 20, useReferencePages = false): Promise<GoogleSearchResult[]> {
  ensureConfigured()
  
  // Si demandé, inclure les pages de référence dans la recherche
  if (useReferencePages) {
    const referenceResults = await searchInReferencePages(query, [], Math.ceil(limit / 2))
    const generalResults = await searchGabonCompaniesGeneral(query, Math.floor(limit / 2))
    
    // Fusionner et dédupliquer les résultats
    const allResults = [...referenceResults, ...generalResults]
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.link === result.link)
    )
    
    return uniqueResults.slice(0, limit)
  }
  
  return searchGabonCompaniesGeneral(query, limit)
}

async function searchGabonCompaniesGeneral(query: string, limit = 20): Promise<GoogleSearchResult[]> {
  // Construire la requête optimisée pour les entreprises gabonaises
  const gabonQuery = `${query} site:facebook.com OR site:instagram.com OR site:tiktok.com "Gabon" OR "Libreville" OR "Port-Gentil" OR "Franceville"`
  
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_SEARCH_ENGINE_ID,
    q: gabonQuery,
    num: Math.min(limit, 10), // Google Custom Search limite à 10 par requête
    safe: 'off',
    fields: 'items(title,link,snippet,displayLink),searchInformation(totalResults)'
  }

  try {
    const { data } = await axios.get(GOOGLE_SEARCH_URL, { 
      params, 
      timeout: 15000 
    })
    
    return data.items || []
  } catch (err: unknown) {
    const error = err as { response?: { status?: number; data?: { error?: { message?: string } } }; message?: string }
    const status = error?.response?.status
    const msg = error?.response?.data?.error?.message || error?.message || 'Erreur Google Search API'
    throw new GoogleSearchError(msg, status)
  }
}

export async function searchSocialMediaProfiles(query: string, platform: 'facebook' | 'instagram' | 'tiktok', limit = 20): Promise<GoogleSearchResult[]> {
  ensureConfigured()
  
  const siteFilter = platform === 'facebook' ? 'site:facebook.com' : 
                    platform === 'instagram' ? 'site:instagram.com' : 
                    'site:tiktok.com'
  
  const gabonQuery = `${query} ${siteFilter} "Gabon" OR "Libreville" OR "Port-Gentil" OR "Franceville" "#Gabon" OR "#Libreville"`
  
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_SEARCH_ENGINE_ID,
    q: gabonQuery,
    num: Math.min(limit, 10),
    safe: 'off',
    fields: 'items(title,link,snippet,displayLink),searchInformation(totalResults)'
  }

  try {
    const { data } = await axios.get(GOOGLE_SEARCH_URL, { 
      params, 
      timeout: 15000 
    })
    
    return data.items || []
  } catch (err: unknown) {
    const error = err as { response?: { status?: number; data?: { error?: { message?: string } } }; message?: string }
    const status = error?.response?.status
    const msg = error?.response?.data?.error?.message || error?.message || 'Erreur Google Search API'
    throw new GoogleSearchError(msg, status)
  }
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u00c0-\u017f\u0100-\u017f\u0180-\u024f\u1e00-\u1eff]+/gi
  return text.match(hashtagRegex) || []
}

// isGabonRelated est maintenant importé depuis ./types
// export function isGabonRelated() { ... } <- SUPPRIMÉ

// Fonction pour rechercher dans des pages de référence spécifiques
export async function searchInReferencePages(query: string, pageIds: string[] = [], limit = 10): Promise<GoogleSearchResult[]> {
  ensureConfigured()
  
  const selectedPages = pageIds.length > 0 
    ? REFERENCE_PAGES.filter(page => pageIds.includes(page.id) && page.isActive)
    : REFERENCE_PAGES.filter(page => page.isActive)
  
  if (selectedPages.length === 0) {
    throw new GoogleSearchError('Aucune page de référence active trouvée')
  }
  
  const results: GoogleSearchResult[] = []
  
  for (const page of selectedPages) {
    const siteQuery = `${query} site:${page.url} OR "${page.name}"`
    
    const params = {
      key: GOOGLE_API_KEY,
      cx: GOOGLE_SEARCH_ENGINE_ID,
      q: siteQuery,
      num: Math.min(limit, 10),
      safe: 'off',
      fields: 'items(title,link,snippet,displayLink),searchInformation(totalResults)'
    }

    try {
      const { data } = await axios.get(GOOGLE_SEARCH_URL, { 
        params, 
        timeout: 15000 
      })
      
      if (data.items) {
        // Ajouter les métadonnées de la page de référence
        const enrichedResults = data.items.map((item: GoogleSearchResult) => ({
          ...item,
          referencePage: {
            id: page.id,
            name: page.name,
            platform: page.platform
          }
        }))
        results.push(...enrichedResults)
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.warn(`Erreur lors de la recherche dans ${page.name}:`, error.message || 'Erreur inconnue')
      // Continue avec les autres pages même si une échoue
    }
  }
  
  return results
}

// Fonction pour obtenir les pages de référence actives
export function getActiveReferencePages(): ReferencePage[] {
  return REFERENCE_PAGES.filter(page => page.isActive)
}

// Fonction pour obtenir une page de référence par ID
export function getReferencePageById(id: string): ReferencePage | undefined {
  return REFERENCE_PAGES.find(page => page.id === id)
}

// Fonction pour ajouter/modifier une page de référence
export function updateReferencePage(page: Partial<ReferencePage> & { id: string }): boolean {
  const index = REFERENCE_PAGES.findIndex(p => p.id === page.id)
  
  if (index !== -1) {
    // Mise à jour de la page existante
    REFERENCE_PAGES[index] = { ...REFERENCE_PAGES[index], ...page }
    return true
  } else if (page.name && page.platform && page.url) {
    // Ajout d'une nouvelle page
    REFERENCE_PAGES.push({
      id: page.id,
      name: page.name,
      platform: page.platform,
      url: page.url,
      description: page.description || '',
      isActive: page.isActive ?? true
    })
    return true
  }
  
  return false
}

// Fonction pour rechercher des entreprises sur Google Places
export async function searchGooglePlaces(query: string, location = 'Gabon', limit = 20): Promise<GooglePlaceResult[]> {
  ensureConfigured()
  
  console.log('🔍 Recherche Google Places avec:', { query, location, limit })
  
  // Utiliser Text Search au lieu de Find Place (plus de résultats)
  const params = {
    key: GOOGLE_API_KEY,
    query: `${query} ${location}`,
    location: '0.3901,9.4673', // Coordonnées de Libreville
    radius: 50000, // 50km de rayon
    type: 'establishment',
    language: 'fr'
  }

  try {
    console.log('📡 Appel Google Places Text Search avec params:', JSON.stringify(params, null, 2))
    
    const { data } = await axios.get(`${GOOGLE_PLACES_URL}/textsearch/json`, { 
      params, 
      timeout: 15000 
    })
    
    console.log('📥 Réponse Google Places:', {
      status: data.status,
      resultsCount: data.results?.length || 0,
      error: data.error_message
    })
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('❌ Google Places API: Requête refusée -', data.error_message)
      console.error('💡 Vérifiez que l\'API Places est activée dans Google Cloud Console')
      return []
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.warn('⚠️ Google Places: Aucun résultat trouvé pour la requête')
      return []
    }
    
    if (data.results && data.results.length > 0) {
      console.log(`✅ ${data.results.length} places trouvées, récupération des détails...`)
      
      // Obtenir les détails pour chaque place trouvée
      const detailedPlaces = []
      for (const place of data.results.slice(0, limit)) {
        console.log(`🔎 Récupération détails pour: ${place.name} (${place.place_id})`)
        const details = await getPlaceDetails(place.place_id)
        if (details) {
          detailedPlaces.push(details)
        } else {
          // Si les détails échouent, utiliser les données de base
          console.warn(`⚠️ Utilisation des données de base pour: ${place.name}`)
          detailedPlaces.push(place as GooglePlaceResult)
        }
      }
      
      console.log(`✅ ${detailedPlaces.length} places avec détails récupérés`)
      return detailedPlaces
    }
    
    console.warn('⚠️ Aucun résultat Google Places')
    return []
  } catch (err: unknown) {
    const error = err as { response?: { status?: number; data?: { error_message?: string, status?: string } }; message?: string }
    const status = error?.response?.status
    const apiStatus = error?.response?.data?.status
    const msg = error?.response?.data?.error_message || error?.message || 'Erreur Google Places API'
    
    console.error('❌ Erreur Google Places:', {
      httpStatus: status,
      apiStatus: apiStatus,
      message: msg,
      url: `${GOOGLE_PLACES_URL}/textsearch/json`
    })
    
    if (apiStatus === 'REQUEST_DENIED') {
      console.error('💡 Solution: Activez l\'API Places dans Google Cloud Console')
      console.error('💡 URL: https://console.cloud.google.com/apis/library/places-backend.googleapis.com')
    }
    
    return []
  }
}

// Fonction pour obtenir les détails d'un lieu Google Places
export async function getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
  ensureConfigured()
  
  const params = {
    key: GOOGLE_API_KEY,
    place_id: placeId,
    fields: 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,url,vicinity,rating,user_ratings_total,price_level,opening_hours,photos,geometry,types,business_status',
    language: 'fr'
  }

  try {
    const { data } = await axios.get(`${GOOGLE_PLACES_URL}/details/json`, { 
      params, 
      timeout: 10000 
    })
    
    if (data.status === 'OK' && data.result) {
      return data.result
    } else {
      console.warn(`⚠️ Détails place ${placeId}: ${data.status}`, data.error_message || '')
      return null
    }
  } catch (err: unknown) {
    const error = err as { message?: string }
    console.warn('❌ Erreur obtention détails place:', placeId, error.message || 'Erreur inconnue')
    return null
  }
}

// Fonction pour convertir les horaires Google Places en format lisible
export function formatGooglePlaceHours(openingHours?: GooglePlaceResult['opening_hours']): Record<string, string> | null {
  if (!openingHours || !openingHours.weekday_text) {
    return null
  }
  
  const daysMap: Record<string, string> = {
    'Monday': 'lundi',
    'Tuesday': 'mardi', 
    'Wednesday': 'mercredi',
    'Thursday': 'jeudi',
    'Friday': 'vendredi',
    'Saturday': 'samedi',
    'Sunday': 'dimanche'
  }
  
  const hours: Record<string, string> = {}
  
  for (const dayText of openingHours.weekday_text) {
    const parts = dayText.split(': ')
    if (parts.length === 2) {
      const dayEn = parts[0]
      const hoursText = parts[1]
      const dayFr = daysMap[dayEn]
      if (dayFr) {
        hours[dayFr] = hoursText === 'Closed' ? 'Fermé' : hoursText
      }
    }
  }
  
  return Object.keys(hours).length > 0 ? hours : null
}

// Fonction pour mapper un résultat Google Places vers une entreprise
export function mapGooglePlaceToCompany(place: GooglePlaceResult, platform = 'google'): any {
  const bio = `${place.name} - ${place.vicinity || place.formatted_address || ''}`
  const hashtags = extractHashtags(bio)
  const isGabon = isGabonRelated(bio + ' ' + (place.formatted_address || ''))
  
  // Extraire informations supplémentaires du texte
  const fullText = `${place.name} ${bio} ${place.formatted_address || ''}`
  const extractedPhone = extractPhoneNumber(fullText)
  const extractedEmail = extractEmail(fullText)
  const extractedWebsite = extractWebsite(fullText)
  const extractedSocial = extractSocialNetworks(fullText, bio)
  const extractedServices = extractServices(fullText, bio)
  
  // Déterminer la catégorie d'activité à partir des types Google
  const activityDomain = mapGoogleTypesToActivity(place.types || [])
  
  // Déterminer la ville
  const city = extractCityFromAddress(place.formatted_address || place.vicinity || '')
  
  return {
    id: place.place_id,
    name: place.name,
    bio: bio,
    description: bio,
    profileImage: place.photos && place.photos.length > 0 ? 
      `${GOOGLE_PLACES_URL}/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}` : '',
    platform: platform,
    profileUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    activityDomain: activityDomain,
    category: activityDomain,
    location: place.formatted_address || place.vicinity || 'Gabon',
    city: city,
    address: place.formatted_address,
    followers: 0,
    verified: false,
    gabonScore: isGabon ? 95 : 40,
    hashtags: hashtags,
    lastPostDate: new Date().toISOString(),
    
    // Informations de contact
    phone: place.formatted_phone_number || place.international_phone_number || extractedPhone,
    email: extractedEmail,
    website: place.website || extractedWebsite,
    whatsapp: place.formatted_phone_number || extractedPhone,
    
    // Horaires d'ouverture
    openingHours: formatGooglePlaceHours(place.opening_hours),
    
    // Réseaux sociaux extraits
    ...extractedSocial,
    
    // Services
    services: extractedServices,
    
    // Géolocalisation
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    
    // Informations métier
    reviewCount: place.user_ratings_total,
    averageRating: place.rating,
    priceRange: mapPriceLevel(place.price_level),
    
    // Métadonnées
    dataSource: 'google_places',
    dataQuality: calculateGooglePlaceQuality(place),
    lastScraped: new Date().toISOString()
  }
}

// Fonction pour mapper les types Google vers les domaines d'activité
function mapGoogleTypesToActivity(types: string[]): string {
  const typeMap: Record<string, string> = {
    'restaurant': 'restauration',
    'food': 'restauration',
    'lodging': 'hôtellerie',
    'store': 'commerce',
    'clothing_store': 'mode',
    'electronics_store': 'technologie',
    'beauty_salon': 'beauté',
    'hair_care': 'beauté',
    'hospital': 'santé',
    'doctor': 'santé',
    'school': 'éducation',
    'university': 'éducation',
    'bank': 'finance',
    'real_estate_agency': 'immobilier',
    'car_dealer': 'automobile',
    'gas_station': 'énergie',
    'tourist_attraction': 'tourisme',
    'travel_agency': 'tourisme',
    'gym': 'sport',
    'lawyer': 'juridique',
    'accounting': 'comptabilité'
  }
  
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type]
    }
  }
  
  return 'non spécifié'
}

// Fonction pour extraire la ville de l'adresse
function extractCityFromAddress(address: string): string | null {
  const gabonCities = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Lambaréné', 'Koulamoutou', 'Makokou', 'Bitam']
  
  for (const city of gabonCities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city
    }
  }
  
  return null
}

// Fonction pour mapper le niveau de prix
function mapPriceLevel(priceLevel?: number): string {
  switch (priceLevel) {
    case 0: return 'Gratuit'
    case 1: return 'Économique'
    case 2: return 'Modéré'
    case 3: return 'Cher'
    case 4: return 'Très cher'
    default: return 'Non spécifié'
  }
}

// Fonction pour calculer la qualité des données Google Places
function calculateGooglePlaceQuality(place: GooglePlaceResult): number {
  let score = 0
  
  if (place.formatted_phone_number) score += 25
  if (place.website) score += 20
  if (place.formatted_address) score += 15
  if (place.opening_hours) score += 15
  if (place.rating && place.user_ratings_total) score += 10
  if (place.photos && place.photos.length > 0) score += 10
  if (place.business_status === 'OPERATIONAL') score += 5
  
  return Math.min(score, 100)
}

export function mapGoogleResultToCompany(result: GoogleSearchResult, platform: string) {
  const hashtags = extractHashtags(result.snippet)
  const isGabon = isGabonRelated(result.snippet + ' ' + result.title)
  
  // Extraire le nom de l'entreprise du titre
  let name = result.title
  if (platform === 'facebook' && name.includes('|')) {
    name = name.split('|')[0].trim()
  }
  if (platform === 'instagram' && name.includes('@')) {
    name = name.split('@')[1] || name
  }
  
  // Extraire des informations supplémentaires du snippet
  const fullText = result.snippet + ' ' + result.title
  const phone = extractPhoneNumber(fullText)
  const email = extractEmail(fullText)
  const website = extractWebsite(fullText)
  const socialNetworks = extractSocialNetworks(fullText, result.snippet)
  const services = extractServices(fullText, result.snippet)
  
  return {
    externalId: result.link.split('/').pop() || result.link,
    name: name,
    bio: result.snippet,
    profileImage: '', // Google Search ne fournit pas d'images
    platform: platform,
    profileUrl: result.link,
    activityDomain: 'non spécifié',
    location: 'Gabon',
    followers: 0,
    verified: false,
    gabonScore: isGabon ? 85 : 30,
    hashtags: hashtags,
    lastPostDate: new Date().toISOString(),
    
    // Informations de contact extraites
    phone: phone,
    email: email,
    website: website || result.displayLink,
    whatsapp: phone,
    
    // Réseaux sociaux extraits
    ...socialNetworks,
    
    // Services extraits
    services: services,
    
    // Métadonnées
    dataSource: 'google_search',
    dataQuality: calculateDataQuality({
      phone,
      email,
      website: website || result.displayLink,
      bio: result.snippet,
      services,
      socialNetworks
    }),
    lastScraped: new Date().toISOString()
  }
}

// Fonction pour calculer la qualité des données (réutilisation de la fonction HuggingFace)
function calculateDataQuality(data: any): number {
  let score = 0
  
  if (data.phone) score += 20
  if (data.email) score += 15
  if (data.website) score += 15
  if (data.bio && data.bio.length > 50) score += 15
  if (data.services && data.services.length > 0) score += 10
  if (Object.keys(data.socialNetworks || {}).length > 0) score += 10
  
  return Math.min(score, 100)
}
