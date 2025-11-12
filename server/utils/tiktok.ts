import axios from 'axios'

export interface TikTokProfile {
  id: string
  uniqueId: string
  nickname: string
  signature: string
  avatarLarger: string
  followerCount: number
  followingCount: number
  videoCount: number
  verified: boolean
  commerceUserInfo?: {
    commerceUser: boolean
  }
  bioLink?: {
    link: string
    risk: number
  }
}

export interface TikTokSearchResult {
  userList: TikTokProfile[]
  hasMore: boolean
  cursor: string
}

export class TikTokApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'TikTokApiError'
    this.status = status
  }
}

// Note: TikTok API nécessite une authentification complexe
// Configuration requise pour utiliser l'API réelle
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || ''
const USE_REAL_API = process.env.USE_TIKTOK_API === 'true' && !!TIKTOK_ACCESS_TOKEN

function ensureConfigured() {
  if (!TIKTOK_ACCESS_TOKEN) {
    throw new TikTokApiError(
      'TIKTOK_ACCESS_TOKEN manquant. Configurez-le dans .env ou désactivez TikTok dans les plateformes de recherche.',
      401
    )
  }
}

// Les données mock ne sont plus utilisées - API réelle uniquement
const mockTikTokProfiles: TikTokProfile[] = [
  {
    id: 'tt_1',
    uniqueId: 'restaurant_legabonais',
    nickname: 'Restaurant Le Gabonais',
    signature: '🍽️ Restaurant traditionnel gabonais à Libreville\n📍 Libreville, Gabon\n📞 +241 01 23 45 67\n#Gabon #Libreville #RestaurantGabonais #MadeInGabon #FoodGabon',
    avatarLarger: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=RG',
    followerCount: 2500,
    followingCount: 150,
    videoCount: 45,
    verified: false,
    commerceUserInfo: {
      commerceUser: true
    },
    bioLink: {
      link: 'https://legabonais.ga',
      risk: 0
    }
  },
  {
    id: 'tt_2',
    uniqueId: 'techgabonsolutions',
    nickname: 'Tech Gabon Solutions',
    signature: '💻 Solutions technologiques pour les entreprises gabonaises\n🚀 Développement web, apps mobiles\n📍 Port-Gentil, Gabon\n#GabonTech #InnovationGabon #MadeInGabon #TechGabon',
    avatarLarger: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=TGS',
    followerCount: 1200,
    followingCount: 100,
    videoCount: 30,
    verified: false,
    commerceUserInfo: {
      commerceUser: true
    },
    bioLink: {
      link: 'https://techgabon.ga',
      risk: 0
    }
  },
  {
    id: 'tt_3',
    uniqueId: 'modegabonaise',
    nickname: 'Mode Gabonaise Authentique',
    signature: '👗 Créations de mode inspirées de la culture gabonaise\n🎨 Vêtements traditionnels et modernes\n📍 Franceville, Gabon\n#ModeGabonaise #CultureGabon #Franceville #FashionGabon',
    avatarLarger: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=MGA',
    followerCount: 4500,
    followingCount: 200,
    videoCount: 120,
    verified: false,
    commerceUserInfo: {
      commerceUser: true
    },
    bioLink: {
      link: 'https://modegabonaise.ga',
      risk: 0
    }
  },
  {
    id: 'tt_4',
    uniqueId: 'immobiliergabonpro',
    nickname: 'Immobilier Gabon Pro',
    signature: '🏠 Agence immobilière spécialisée Gabon\n🏢 Ventes, locations, investissements\n📍 Libreville & Port-Gentil\n#ImmobilierGabon #Libreville #PortGentil #RealEstateGabon',
    avatarLarger: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=IGP',
    followerCount: 3800,
    followingCount: 300,
    videoCount: 80,
    verified: false,
    commerceUserInfo: {
      commerceUser: true
    },
    bioLink: {
      link: 'https://immobiliergabon.ga',
      risk: 0
    }
  },
  {
    id: 'tt_5',
    uniqueId: 'formationgabonexcellence',
    nickname: 'Formation Gabon Excellence',
    signature: '🎓 Centre de formation professionnelle au Gabon\n📚 Cours de langues, informatique, management\n📍 Libreville, Gabon\n#FormationGabon #Education #Libreville #EduGabon',
    avatarLarger: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=FGE',
    followerCount: 2200,
    followingCount: 180,
    videoCount: 60,
    verified: false,
    commerceUserInfo: {
      commerceUser: true
    },
    bioLink: {
      link: 'https://formationgabon.ga',
      risk: 0
    }
  },
  {
    id: 'tt_6',
    uniqueId: 'transportgabonexpress',
    nickname: 'Transport Gabon Express',
    signature: '🚐 Service de transport de personnes et marchandises au Gabon\n📍 Libreville, Port-Gentil, Franceville\n#TransportGabon #Libreville #PortGentil #TransportGabon',
    avatarLarger: 'https://via.placeholder.com/150/607D8B/FFFFFF?text=TGE',
    followerCount: 1800,
    followingCount: 120,
    videoCount: 40,
    verified: false,
    commerceUserInfo: {
      commerceUser: true
    },
    bioLink: {
      link: 'https://transportgabon.ga',
      risk: 0
    }
  }
]

export async function searchTikTokProfiles(query: string, limit = 20): Promise<TikTokProfile[]> {
  if (!USE_REAL_API) {
    throw new TikTokApiError(
      'TikTok API non configurée. Ajoutez TIKTOK_ACCESS_TOKEN et USE_TIKTOK_API=true dans .env',
      401
    )
  }
  
  ensureConfigured()
  
  // TODO: Implémenter la recherche réelle avec TikTok for Business API
  // https://developers.tiktok.com/
  throw new TikTokApiError('TikTok API non implémentée. Utilisez Facebook ou Google Places à la place.', 501)
}

export async function searchTikTokByHashtag(hashtag: string, limit = 20): Promise<TikTokProfile[]> {
  if (!USE_REAL_API) {
    throw new TikTokApiError(
      'TikTok API non configurée. Ajoutez TIKTOK_ACCESS_TOKEN et USE_TIKTOK_API=true dans .env',
      401
    )
  }
  
  ensureConfigured()
  
  // TODO: Implémenter la recherche par hashtag avec TikTok for Business API
  throw new TikTokApiError('TikTok API non implémentée. Utilisez Facebook ou Google Places à la place.', 501)
}

export function mapTikTokProfileToCompany(profile: TikTokProfile) {
  const hashtags = extractHashtags(profile.signature)
  const isGabon = isGabonRelated(profile.signature + ' ' + profile.nickname)
  
  return {
    externalId: profile.id,
    name: profile.nickname,
    bio: profile.signature,
    profileImage: profile.avatarLarger,
    platform: 'tiktok',
    profileUrl: `https://tiktok.com/@${profile.uniqueId}`,
    activityDomain: 'non spécifié',
    location: 'Gabon',
    followers: profile.followerCount,
    verified: profile.verified,
    gabonScore: isGabon ? 88 : 35,
    hashtags: hashtags,
    lastPostDate: new Date().toISOString(),
    contactInfo: {
      phone: '',
      email: '',
      website: profile.bioLink?.link || ''
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
