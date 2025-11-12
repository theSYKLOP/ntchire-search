export interface HashtagAnalysis {
  gabonHashtags: string[]
  businessHashtags: string[]
  locationHashtags: string[]
  industryHashtags: string[]
  gabonScore: number
  businessScore: number
  isGabonCompany: boolean
  isBusinessAccount: boolean
  suggestedHashtags: string[]
}

// Importer depuis ./types pour éviter les duplications
import { isGabonRelated } from './types'

interface CompanyProfile {
  bio: string
  name: string
  hashtags: string[]
  platform: string
}

interface ActivityDomain {
  bio: string
  name: string
  hashtags: string[]
  platform: string
}

// Hashtags spécifiques au Gabon
const GABON_HASHTAGS = [
  '#gabon', '#libreville', '#portgentil', '#port-gentil', '#franceville',
  '#oyem', '#moanda', '#lambaréné', '#lambarene', '#koulamoutou',
  '#makokou', '#bitam', '#omboué', '#omboue', '#madeingabon',
  '#madeingabon', '#entreprisgabonaise', '#businessgabon', '#gabontech',
  '#gabonais', '#gabonaise', '#librevillegabon', '#portgentilgabon'
]

// Hashtags de localisation
const LOCATION_HASHTAGS = [
  '#libreville', '#portgentil', '#port-gentil', '#franceville', '#oyem',
  '#moanda', '#lambaréné', '#lambarene', '#koulamoutou', '#makokou',
  '#bitam', '#omboué', '#omboue', '#gabon', '#afrique'
]

// Hashtags d'industrie/secteur d'activité
const INDUSTRY_HASHTAGS = {
  'restauration': ['#restaurant', '#food', '#cuisine', '#gastronomie', '#restauration', '#foodgabon', '#cuisinegabonaise'],
  'technologie': ['#tech', '#technology', '#digital', '#innovation', '#gabontech', '#techgabon', '#digitalgabon'],
  'mode': ['#mode', '#fashion', '#style', '#modegabonaise', '#fashiongabon', '#stylegabon'],
  'immobilier': ['#immobilier', '#realestate', '#property', '#immobiliergabon', '#realestategabon'],
  'formation': ['#formation', '#education', '#training', '#formationgabon', '#educationgabon'],
  'transport': ['#transport', '#transportgabon', '#logistics', '#logistique'],
  'santé': ['#santé', '#health', '#medical', '#santegabon', '#medicalgabon'],
  'événementiel': ['#événement', '#event', '#organisation', '#evenementgabon', '#eventgabon'],
  'commerce': ['#commerce', '#business', '#shop', '#commergabon', '#businessgabon'],
  'tourisme': ['#tourisme', '#tourism', '#voyage', '#tourismegabon', '#voyagegabon']
}

// Hashtags business génériques
const BUSINESS_HASHTAGS = [
  '#business', '#entreprise', '#company', '#startup', '#entrepreneur',
  '#entrepreneuriat', '#innovation', '#digital', '#marketing', '#vente',
  '#service', '#client', '#customer', '#professional', '#pro'
]

export function analyzeHashtags(profile: CompanyProfile): HashtagAnalysis {
  const allText = `${profile.bio} ${profile.name} ${profile.hashtags.join(' ')}`.toLowerCase()
  const allHashtags = profile.hashtags.map((tag: string) => tag.toLowerCase())
  
  // Analyser les hashtags Gabon
  const gabonHashtags = allHashtags.filter((tag: string) => 
    GABON_HASHTAGS.some(gabonTag => tag.includes(gabonTag.replace('#', '')))
  )
  
  // Analyser les hashtags de localisation
  const locationHashtags = allHashtags.filter((tag: string) => 
    LOCATION_HASHTAGS.some(locTag => tag.includes(locTag.replace('#', '')))
  )
  
  // Analyser les hashtags business
  const businessHashtags = allHashtags.filter((tag: string) => 
    BUSINESS_HASHTAGS.some(bizTag => tag.includes(bizTag.replace('#', '')))
  )
  
  // Analyser les hashtags d'industrie
  const industryHashtags: string[] = []
  let detectedIndustry = ''
  
  for (const [industry, hashtags] of Object.entries(INDUSTRY_HASHTAGS)) {
    const matchingHashtags = allHashtags.filter((tag: string) => 
      hashtags.some(indTag => tag.includes(indTag.replace('#', '')))
    )
    if (matchingHashtags.length > 0) {
      industryHashtags.push(...matchingHashtags)
      detectedIndustry = industry
    }
  }
  
  // Calculer les scores
  const gabonScore = calculateGabonScore(gabonHashtags, locationHashtags, allText)
  const businessScore = calculateBusinessScore(businessHashtags, allText)
  
  // Déterminer si c'est une entreprise gabonaise
  const isGabonCompany = gabonScore >= 70 || 
    (gabonHashtags.length > 0 && locationHashtags.length > 0) ||
    allText.includes('gabon') || allText.includes('libreville') || allText.includes('port-gentil')
  
  // Déterminer si c'est un compte business
  const isBusinessAccount = businessScore >= 60 || 
    businessHashtags.length > 0 ||
    allText.includes('entreprise') || allText.includes('business') || allText.includes('service')
  
  // Générer des hashtags suggérés
  const suggestedHashtags = generateSuggestedHashtags(detectedIndustry, gabonHashtags, locationHashtags)
  
  return {
    gabonHashtags,
    businessHashtags,
    locationHashtags,
    industryHashtags,
    gabonScore,
    businessScore,
    isGabonCompany,
    isBusinessAccount,
    suggestedHashtags
  }
}

function calculateGabonScore(gabonHashtags: string[], locationHashtags: string[], text: string): number {
  let score = 0
  
  // Score basé sur les hashtags Gabon
  score += gabonHashtags.length * 15
  
  // Score basé sur les hashtags de localisation
  score += locationHashtags.length * 10
  
  // Score basé sur les mots-clés dans le texte
  const gabonKeywords = ['gabon', 'libreville', 'port-gentil', 'franceville', 'gabonais', 'gabonaise']
  const keywordMatches = gabonKeywords.filter(keyword => text.includes(keyword)).length
  score += keywordMatches * 8
  
  // Bonus pour les hashtags spécifiques
  if (gabonHashtags.some(tag => tag.includes('madeingabon'))) score += 20
  if (gabonHashtags.some(tag => tag.includes('gabontech'))) score += 15
  if (gabonHashtags.some(tag => tag.includes('entreprisgabonaise'))) score += 25
  
  return Math.min(score, 100)
}

function calculateBusinessScore(businessHashtags: string[], text: string): number {
  let score = 0
  
  // Score basé sur les hashtags business
  score += businessHashtags.length * 12
  
  // Score basé sur les mots-clés business
  const businessKeywords = ['entreprise', 'business', 'service', 'client', 'vente', 'marketing', 'professional']
  const keywordMatches = businessKeywords.filter(keyword => text.includes(keyword)).length
  score += keywordMatches * 6
  
  // Bonus pour les hashtags spécifiques
  if (businessHashtags.some(tag => tag.includes('entrepreneur'))) score += 15
  if (businessHashtags.some(tag => tag.includes('startup'))) score += 10
  if (businessHashtags.some(tag => tag.includes('innovation'))) score += 8
  
  return Math.min(score, 100)
}

function generateSuggestedHashtags(industry: string, gabonHashtags: string[], locationHashtags: string[]): string[] {
  const suggestions: string[] = []
  
  // Ajouter des hashtags Gabon manquants
  const missingGabonHashtags = GABON_HASHTAGS.filter(tag => 
    !gabonHashtags.some(existing => existing.includes(tag.replace('#', '')))
  ).slice(0, 3)
  suggestions.push(...missingGabonHashtags)
  
  // Ajouter des hashtags de localisation manquants
  const missingLocationHashtags = LOCATION_HASHTAGS.filter(tag => 
    !locationHashtags.some(existing => existing.includes(tag.replace('#', '')))
  ).slice(0, 2)
  suggestions.push(...missingLocationHashtags)
  
  // Ajouter des hashtags d'industrie
  if (industry && INDUSTRY_HASHTAGS[industry as keyof typeof INDUSTRY_HASHTAGS]) {
    const industryHashtags = INDUSTRY_HASHTAGS[industry as keyof typeof INDUSTRY_HASHTAGS]
    suggestions.push(...industryHashtags.slice(0, 2))
  }
  
  // Ajouter des hashtags business génériques
  suggestions.push('#MadeInGabon', '#EntrepriseGabonaise', '#BusinessGabon')
  
  return Array.from(new Set(suggestions)).slice(0, 8) // Limiter à 8 suggestions
}

export function extractHashtagsFromText(text: string): string[] {
  const hashtagRegex = /#[\w\u00c0-\u017f\u0100-\u017f\u0180-\u024f\u1e00-\u1eff]+/gi
  return text.match(hashtagRegex) || []
}

// isGabonRelated est maintenant importé depuis ./types
// export function isGabonRelated() { ... } <- SUPPRIMÉ pour éviter duplication
