import axios from 'axios'

export interface InstagramProfile {
  id: string
  username: string
  full_name: string
  biography: string
  profile_pic_url: string
  follower_count: number
  following_count: number
  media_count: number
  is_verified: boolean
  is_business: boolean
  external_url?: string
  business_category?: string
}

export interface InstagramSearchResult {
  users: InstagramProfile[]
  has_more: boolean
  next_max_id?: string
}

export class InstagramApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'InstagramApiError'
    this.status = status
  }
}

// Note: Instagram Basic Display API nécessite une authentification OAuth
// Configuration requise pour utiliser l'API réelle
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || ''
const USE_REAL_API = process.env.USE_INSTAGRAM_API === 'true' && !!INSTAGRAM_ACCESS_TOKEN

function ensureConfigured() {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    throw new InstagramApiError(
      'INSTAGRAM_ACCESS_TOKEN manquant. Configurez-le dans .env ou désactivez Instagram dans les plateformes de recherche.',
      401
    )
  }
}

// Les données mock ne sont plus utilisées - API réelle uniquement
const mockInstagramProfiles: InstagramProfile[] = [
  {
    id: 'ig_1',
    username: 'restaurant_legabonais',
    full_name: 'Restaurant Le Gabonais',
    biography: '🍽️ Restaurant traditionnel gabonais à Libreville\n📍 Libreville, Gabon\n📞 +241 01 23 45 67\n#Gabon #Libreville #RestaurantGabonais #MadeInGabon',
    profile_pic_url: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=RG',
    follower_count: 1250,
    following_count: 200,
    media_count: 180,
    is_verified: false,
    is_business: true,
    external_url: 'https://legabonais.ga',
    business_category: 'Restaurant'
  },
  {
    id: 'ig_2',
    username: 'techgabonsolutions',
    full_name: 'Tech Gabon Solutions',
    biography: '💻 Solutions technologiques pour les entreprises gabonaises\n🚀 Développement web, apps mobiles\n📍 Port-Gentil, Gabon\n#GabonTech #InnovationGabon #MadeInGabon',
    profile_pic_url: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=TGS',
    follower_count: 890,
    following_count: 150,
    media_count: 95,
    is_verified: false,
    is_business: true,
    external_url: 'https://techgabon.ga',
    business_category: 'Technology'
  },
  {
    id: 'ig_3',
    username: 'modegabonaise',
    full_name: 'Mode Gabonaise Authentique',
    biography: '👗 Créations de mode inspirées de la culture gabonaise\n🎨 Vêtements traditionnels et modernes\n📍 Franceville, Gabon\n#ModeGabonaise #CultureGabon #Franceville',
    profile_pic_url: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=MGA',
    follower_count: 2100,
    following_count: 300,
    media_count: 250,
    is_verified: false,
    is_business: true,
    external_url: 'https://modegabonaise.ga',
    business_category: 'Fashion'
  },
  {
    id: 'ig_4',
    username: 'immobiliergabonpro',
    full_name: 'Immobilier Gabon Pro',
    biography: '🏠 Agence immobilière spécialisée Gabon\n🏢 Ventes, locations, investissements\n📍 Libreville & Port-Gentil\n#ImmobilierGabon #Libreville #PortGentil',
    profile_pic_url: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=IGP',
    follower_count: 3200,
    following_count: 500,
    media_count: 400,
    is_verified: false,
    is_business: true,
    external_url: 'https://immobiliergabon.ga',
    business_category: 'Real Estate'
  },
  {
    id: 'ig_5',
    username: 'formationgabonexcellence',
    full_name: 'Formation Gabon Excellence',
    biography: '🎓 Centre de formation professionnelle au Gabon\n📚 Cours de langues, informatique, management\n📍 Libreville, Gabon\n#FormationGabon #Education #Libreville',
    profile_pic_url: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=FGE',
    follower_count: 1800,
    following_count: 250,
    media_count: 120,
    is_verified: false,
    is_business: true,
    external_url: 'https://formationgabon.ga',
    business_category: 'Education'
  }
]

export async function searchInstagramProfiles(query: string, limit = 20): Promise<InstagramProfile[]> {
  if (!USE_REAL_API) {
    throw new InstagramApiError(
      'Instagram API non configurée. Ajoutez INSTAGRAM_ACCESS_TOKEN et USE_INSTAGRAM_API=true dans .env',
      401
    )
  }
  
  ensureConfigured()
  
  // TODO: Implémenter la recherche réelle avec Instagram Basic Display API
  // https://developers.facebook.com/docs/instagram-basic-display-api
  throw new InstagramApiError('Instagram API non implémentée. Utilisez Facebook ou Google Places à la place.', 501)
}

export async function searchInstagramByHashtag(hashtag: string, limit = 20): Promise<InstagramProfile[]> {
  if (!USE_REAL_API) {
    throw new InstagramApiError(
      'Instagram API non configurée. Ajoutez INSTAGRAM_ACCESS_TOKEN et USE_INSTAGRAM_API=true dans .env',
      401
    )
  }
  
  ensureConfigured()
  
  // TODO: Implémenter la recherche par hashtag avec Instagram Basic Display API
  throw new InstagramApiError('Instagram API non implémentée. Utilisez Facebook ou Google Places à la place.', 501)
}

export function mapInstagramProfileToCompany(profile: InstagramProfile) {
  const hashtags = extractHashtags(profile.biography)
  const isGabon = isGabonRelated(profile.biography + ' ' + profile.full_name)
  
  return {
    externalId: profile.id,
    name: profile.full_name || profile.username,
    bio: profile.biography,
    profileImage: profile.profile_pic_url,
    platform: 'instagram',
    profileUrl: `https://instagram.com/${profile.username}`,
    activityDomain: profile.business_category || 'non spécifié',
    location: 'Gabon',
    followers: profile.follower_count,
    verified: profile.is_verified,
    gabonScore: isGabon ? 90 : 40,
    hashtags: hashtags,
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '',
      email: '',
      website: profile.external_url || ''
    }
  }
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u00c0-\u017f\u0100-\u017f\u0180-\u024f\u1e00-\u1eff]+/gi
  return text.match(hashtagRegex) || []
}

function isGabonRelated(text: string): boolean {
  const gabonKeywords = [
    'gabon', 'libreville', 'port-gentil', 'franceville', 'oyem', 'moanda',
    'lambaréné', 'koulamoutou', 'makokou', 'bitam', 'omboué',
    '#gabon', '#libreville', '#portgentil', '#franceville',
    'made in gabon', 'entreprise gabonaise', 'business gabon'
  ]
  
  const textLower = text.toLowerCase()
  return gabonKeywords.some(keyword => textLower.includes(keyword.toLowerCase()))
}
