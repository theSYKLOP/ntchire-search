import axios from 'axios';

// Permettre la configuration via variables d'environnement
const HF_MODEL = process.env.HF_MODEL || 'google/flan-t5-base'
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const HF_API_TOKEN = process.env.HF_API_TOKEN || '';

// Interface pour les données d'entreprise gabonaise
export interface GabonCompany {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  profileUrl: string;
  activityDomain: string;
  location: string;
  followers: number;
  verified: boolean;
  gabonScore: number; // Score de pertinence gabonaise (0-100)
  hashtags: string[];
  lastPostDate: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
}

// Interface pour l'analyse de contenu
export interface ContentAnalysis {
  isGabonCompany: boolean;
  gabonScore: number;
  detectedKeywords: string[];
  companyIndicators: string[];
  locationIndicators: string[];
  activityDomain: string;
  confidence: number;
}

export async function generateQuery(prompt: string, hashtags: string[], lang?: string): Promise<string> {
  const fullPrompt = `Sujet: ${prompt}\nHashtags: ${hashtags.join(', ')}\nLangue: ${lang || 'fr'}\nGénère une requête de recherche optimisée pour trouver des entreprises gabonaises sur les réseaux sociaux.`;
  
  try {
    if (!HF_API_TOKEN) {
      console.warn('HF_API_TOKEN manquant: retour à une requête générée localement.')
      return `${prompt} ${hashtags.slice(0, 5).join(' ')} ${lang || 'fr'} entreprises gabonaises`;
    }

    const response = await axios.post(
      HF_API_URL,
      { inputs: fullPrompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 secondes de timeout
      }
    );
    
    if (response.data && Array.isArray(response.data) && response.data[0]?.generated_text) {
      return response.data[0].generated_text;
    }
    if (typeof response.data === 'string') {
      return response.data;
    }
    return '';
  } catch (error) {
    // Gestion des codes d'erreur réseau/API (404 modèle introuvable, etc.)
    const status = (error as any)?.response?.status
    const message = (error as any)?.message || 'Erreur inconnue'
    console.error('Erreur HuggingFace API:', status, message);
    
    // Fallback: requête locale simple
    return `${prompt} ${hashtags.slice(0, 5).join(' ')} ${lang || 'fr'} entreprises gabonaises`;
  }
}

// Génère une requête ciblée pour Facebook Pages
export async function generateFacebookPageQuery(topic: string, cityHint?: string): Promise<string> {
  const base = `pages d'entreprises gabonaises ${topic}`
  const h = ['#gabon', '#gabonaise', '#entreprise', '#business', '#libreville']
  const prompt = `${base} ${cityHint || ''} ${h.join(' ')}`.trim()
  return generateQuery(prompt, h, 'fr')
}

// Fonction pour analyser le contenu et détecter les entreprises gabonaises
export function analyzeGabonCompany(content: string, bio: string, hashtags: string[]): ContentAnalysis {
  const gabonKeywords = [
    'gabon', 'gabonaise', 'gabonais', 'libreville', 'port-gentil', 'franceville', 
    'oyem', 'moanda', 'lambaréné', 'koulamoutou', 'makokou', 'bitam', 'tchibanga', 
    'mouila', 'ndendé', 'omboué', 'akanda', 'noya', '100% gabonais', 'made in gabon',
    'entreprise gabonaise', 'entrepreneur gabonais', 'business gabon', 'gabon business'
  ];
  
  const companyIndicators = [
    'entreprise', 'sarl', 'sa', 'eurl', 'sas', 'sci', 'snc', 'sarlu', 'sarl au',
    'société', 'compagnie', 'groupe', 'holding', 'filiale', 'succursale',
    'agence', 'bureau', 'cabinet', 'consulting', 'conseil', 'service'
  ];
  
  const locationIndicators = [
    'libreville', 'port-gentil', 'franceville', 'oyem', 'moanda', 'lambaréné',
    'koulamoutou', 'makokou', 'bitam', 'tchibanga', 'mouila', 'ndendé',
    'omboué', 'akanda', 'noya', 'gabon', 'gabonaise', 'gabonais'
  ];
  
  const activityDomains = [
    'commerce', 'industrie', 'agriculture', 'tourisme', 'immobilier', 'finance',
    'consulting', 'formation', 'marketing', 'communication', 'media', 'art',
    'culture', 'mode', 'beauté', 'santé', 'éducation', 'sport', 'événement',
    'restauration', 'hôtellerie', 'transport', 'logistique', 'énergie', 'pétrole',
    'mines', 'bois', 'manganèse', 'uranium', 'pêche'
  ];
  
  // Normaliser le contenu pour l'analyse
  const normalizedContent = (content + ' ' + bio).toLowerCase();
  const normalizedHashtags = hashtags.map(tag => tag.toLowerCase().replace('#', ''));
  
  // Détecter les mots-clés gabonais
  const detectedKeywords = gabonKeywords.filter(keyword => 
    normalizedContent.includes(keyword.toLowerCase()) || 
    normalizedHashtags.some(tag => tag.includes(keyword.toLowerCase()))
  );
  
  // Détecter les indicateurs d'entreprise
  const detectedCompanyIndicators = companyIndicators.filter(indicator =>
    normalizedContent.includes(indicator.toLowerCase())
  );
  
  // Détecter les indicateurs de localisation
  const detectedLocationIndicators = locationIndicators.filter(indicator =>
    normalizedContent.includes(indicator.toLowerCase()) ||
    normalizedHashtags.some(tag => tag.includes(indicator.toLowerCase()))
  );
  
  // Déterminer le domaine d'activité
  const detectedActivityDomain = activityDomains.find(domain =>
    normalizedContent.includes(domain.toLowerCase()) ||
    normalizedHashtags.some(tag => tag.includes(domain.toLowerCase()))
  ) || 'non spécifié';
  
  // Calculer le score de pertinence gabonaise
  let gabonScore = 0;
  
  // Points pour les mots-clés gabonais
  gabonScore += detectedKeywords.length * 15;
  
  // Points pour les indicateurs de localisation
  gabonScore += detectedLocationIndicators.length * 10;
  
  // Points pour les hashtags gabonais
  const gabonHashtags = normalizedHashtags.filter(tag => 
    gabonKeywords.some(keyword => tag.includes(keyword.toLowerCase()))
  );
  gabonScore += gabonHashtags.length * 20;
  
  // Points pour les indicateurs d'entreprise
  gabonScore += detectedCompanyIndicators.length * 5;
  
  // Bonus pour "100% gabonais" ou "made in gabon"
  if (normalizedContent.includes('100% gabonais') || normalizedContent.includes('made in gabon')) {
    gabonScore += 30;
  }
  
  // Limiter le score à 100
  gabonScore = Math.min(gabonScore, 100);
  
  // Déterminer si c'est une entreprise gabonaise (score >= 30)
  const isGabonCompany = gabonScore >= 30;
  
  // Calculer la confiance
  const confidence = Math.min(gabonScore / 100, 1);
  
  return {
    isGabonCompany,
    gabonScore,
    detectedKeywords,
    companyIndicators: detectedCompanyIndicators,
    locationIndicators: detectedLocationIndicators,
    activityDomain: detectedActivityDomain,
    confidence
  };
}

// Fonction pour extraire les informations d'entreprise à partir des données de profil
export function extractCompanyInfo(profileData: any, platform: string): Partial<GabonCompany> | undefined {
  const analysis = analyzeGabonCompany(
    profileData.description || profileData.bio || '',
    profileData.bio || profileData.description || '',
    profileData.hashtags || []
  );
  
  if (!analysis.isGabonCompany) {
    return undefined;
  }
  
  return {
    id: profileData.id || profileData.username || '',
    name: profileData.name || profileData.username || profileData.display_name || '',
    bio: profileData.bio || profileData.description || '',
    profileImage: profileData.profile_image_url || profileData.profile_pic_url || '',
    platform: platform as any,
    profileUrl: profileData.url || profileData.profile_url || '',
    activityDomain: analysis.activityDomain,
    location: analysis.locationIndicators.join(', ') || 'Gabon',
    followers: profileData.followers_count || profileData.followers || 0,
    verified: profileData.verified || false,
    gabonScore: analysis.gabonScore,
    hashtags: profileData.hashtags || [],
    lastPostDate: profileData.last_post_date || new Date().toISOString(),
    contactInfo: {
      phone: profileData.phone || '',
      email: profileData.email || '',
      website: profileData.website || '',
      address: profileData.address || ''
    }
  };
}