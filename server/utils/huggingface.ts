import axios from 'axios';

// Configuration des modèles pour suggestions intelligentes
// Utilisation de modèles gratuits et stables
const SUGGESTION_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
const SUGGESTION_API_URL = `https://api-inference.huggingface.co/models/${SUGGESTION_MODEL}`;

// Modèle fallback
const FALLBACK_MODEL = 'google/flan-t5-base';
const FALLBACK_API_URL = `https://api-inference.huggingface.co/models/${FALLBACK_MODEL}`;

const HF_API_TOKEN = process.env.HF_API_TOKEN || '';

// Flag pour désactiver les appels API si nécessaire
const USE_AI_SUGGESTIONS = process.env.USE_AI_SUGGESTIONS !== 'false' && !!HF_API_TOKEN;

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

// Fonction pour générer des suggestions de recherche intelligentes
export async function generateSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  // Si l'API est désactivée ou pas de token, utiliser directement le fallback local
  if (!USE_AI_SUGGESTIONS) {
    console.log('💡 Utilisation des suggestions locales (API IA désactivée)');
    return generateFallbackSuggestions(query, limit);
  }

  const prompt = `Génère ${limit} suggestions de recherche en français pour trouver des entreprises gabonaises liées à "${query}". Format: une suggestion par ligne, commençant par "-".

Exemples pour "restaurant":
- restaurants gabonais à Libreville
- meilleurs restaurants Port-Gentil
- restaurant traditionnel gabonais
- livraison restaurant Gabon
- restaurant africain Libreville

Pour "${query}":`;

  try {
    console.log(`🤖 Génération de suggestions IA pour: "${query}"`);
    const response = await axios.post(
      SUGGESTION_API_URL,
      { 
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    
    if (response.data && Array.isArray(response.data) && response.data[0]?.generated_text) {
      const generatedText = response.data[0].generated_text;
      const suggestions = extractSuggestions(generatedText, limit);
      
      if (suggestions.length > 0) {
        console.log(`✅ ${suggestions.length} suggestions IA générées`);
        return suggestions;
      }
    }
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.message || 'Erreur inconnue';
    
    // Erreurs spécifiques
    if (status === 410) {
      console.warn('⚠️ Modèle IA obsolète (410), utilisation du fallback local');
    } else if (status === 503) {
      console.warn('⚠️ Modèle IA en cours de chargement, utilisation du fallback local');
    } else {
      console.warn(`⚠️ Erreur API IA (${status}): ${message}, utilisation du fallback local`);
    }
  }
  
  // Fallback local en cas d'erreur
  console.log('💡 Utilisation des suggestions locales intelligentes');
  return generateFallbackSuggestions(query, limit);
}

// Fonction pour extraire les suggestions du texte généré
function extractSuggestions(text: string, limit: number): string[] {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)))
    .map(line => line.replace(/^[-•]\s*|\d+\.\s*/g, '').trim())
    .filter(line => line.length > 3 && line.length < 100);
  
  return lines.slice(0, limit);
}

// Fonction de fallback pour générer des suggestions localement
function generateFallbackSuggestions(query: string, limit: number = 5): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Base de suggestions par domaine
  const suggestionTemplates = [
    `${query} à Libreville`,
    `${query} à Port-Gentil`,
    `${query} gabonais`,
    `meilleur ${query} Gabon`,
    `${query} pas cher Libreville`,
    `${query} professionnel Gabon`,
    `entreprise ${query} gabonaise`,
    `service ${query} Libreville`,
    `${query} de qualité Gabon`,
    `contact ${query} Libreville`
  ];
  
  // Suggestions spécifiques par type d'activité
  const domainSuggestions: Record<string, string[]> = {
    restaurant: [
      'restaurants gabonais à Libreville',
      'meilleurs restaurants Port-Gentil',
      'restaurant traditionnel gabonais',
      'livraison restaurant Gabon',
      'restaurant africain Libreville'
    ],
    coiffure: [
      'salon de coiffure Libreville',
      'coiffeur professionnel Gabon',
      'coiffure afro Libreville',
      'barbier Libreville',
      'salon de beauté gabonais'
    ],
    transport: [
      'transport Libreville Port-Gentil',
      'taxi Libreville',
      'location voiture Gabon',
      'transport marchandise Gabon',
      'bus Libreville'
    ],
    informatique: [
      'réparation ordinateur Libreville',
      'développement web Gabon',
      'informatique professionnel Libreville',
      'maintenance IT Gabon',
      'formation informatique Libreville'
    ],
    immobilier: [
      'location appartement Libreville',
      'achat maison Gabon',
      'agence immobilière Libreville',
      'terrain à vendre Gabon',
      'villa Libreville'
    ]
  };
  
  // Chercher des suggestions spécifiques au domaine
  for (const [domain, suggestions] of Object.entries(domainSuggestions)) {
    if (normalizedQuery.includes(domain)) {
      return suggestions.slice(0, limit);
    }
  }
  
  // Retourner les suggestions génériques
  return suggestionTemplates.slice(0, limit);
}

export async function generateQuery(prompt: string, hashtags: string[], lang?: string): Promise<string> {
  // Si l'API est désactivée, retourner une requête construite localement
  if (!USE_AI_SUGGESTIONS) {
    return `${prompt} ${hashtags.slice(0, 5).join(' ')} ${lang || 'fr'} entreprises gabonaises`;
  }

  const fullPrompt = `Sujet: ${prompt}\nHashtags: ${hashtags.join(', ')}\nLangue: ${lang || 'fr'}\nGénère une requête de recherche optimisée pour trouver des entreprises gabonaises sur les réseaux sociaux.`;
  
  try {
    const response = await axios.post(
      FALLBACK_API_URL,
      { inputs: fullPrompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
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
    const status = (error as any)?.response?.status;
    const message = (error as any)?.message || 'Erreur inconnue';
    console.warn(`⚠️ Erreur API IA query (${status}): ${message}`);
    
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

// Fonction pour extraire le numéro de téléphone du texte
export function extractPhoneNumber(text: string): string | null {
  // Patterns pour les numéros gabonais et français
  const patterns = [
    // Gabon: +241 XX XX XX XX ou 241 XX XX XX XX
    /(\+?241\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{2})/g,
    // France: +33 X XX XX XX XX
    /(\+?33\s*[0-9]\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{2})/g,
    // Format international général
    /(\+?[0-9]{1,4}[\s.-]?[0-9]{2,3}[\s.-]?[0-9]{2,3}[\s.-]?[0-9]{2,4}[\s.-]?[0-9]{2,4})/g
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

// Fonction pour extraire l'email du texte
export function extractEmail(text: string): string | null {
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const match = text.match(emailPattern);
  return match ? match[0] : null;
}

// Fonction pour extraire l'adresse web du texte
export function extractWebsite(text: string): string | null {
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  const match = text.match(urlPattern);
  if (match) {
    let url = match[0];
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    return url;
  }
  return null;
}

// Fonction pour extraire les horaires d'ouverture du texte
export function extractOpeningHours(text: string): Record<string, string> | null {
  const normalizedText = text.toLowerCase();
  const hours: Record<string, string> = {};
  
  // Patterns pour détecter les horaires
  const dayPatterns = {
    lundi: /lundi[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi,
    mardi: /mardi[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi,
    mercredi: /mercredi[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi,
    jeudi: /jeudi[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi,
    vendredi: /vendredi[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi,
    samedi: /samedi[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi,
    dimanche: /dimanche[:\s]*([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]*[0-9]{1,2}[h:]?[0-9]{0,2}|fermé)/gi
  };
  
  for (const [day, pattern] of Object.entries(dayPatterns)) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      hours[day] = match[1].trim();
    }
  }
  
  // Pattern général pour horaires
  const generalPattern = /([0-9]{1,2}[h:]?[0-9]{0,2}[\s-]+[0-9]{1,2}[h:]?[0-9]{0,2})/g;
  const generalMatch = normalizedText.match(generalPattern);
  
  if (Object.keys(hours).length === 0 && generalMatch) {
    return { general: generalMatch[0] };
  }
  
  return Object.keys(hours).length > 0 ? hours : null;
}

// Fonction pour extraire les réseaux sociaux du texte
export function extractSocialNetworks(text: string, bio: string): Record<string, string> {
  const fullText = text + ' ' + bio;
  const networks: Record<string, string> = {};
  
  const patterns = {
    facebook: /(?:facebook\.com\/|fb\.com\/|@)([a-zA-Z0-9._-]+)/gi,
    instagram: /(?:instagram\.com\/|ig\.com\/|@)([a-zA-Z0-9._-]+)/gi,
    tiktok: /(?:tiktok\.com\/@?|@)([a-zA-Z0-9._-]+)/gi,
    linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/company\/)([a-zA-Z0-9._-]+)/gi,
    twitter: /(?:twitter\.com\/|x\.com\/|@)([a-zA-Z0-9._-]+)/gi,
    youtube: /(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/@)([a-zA-Z0-9._-]+)/gi
  };
  
  for (const [platform, pattern] of Object.entries(patterns)) {
    const match = fullText.match(pattern);
    if (match) {
      const username = match[0].split('/').pop() || match[0].replace('@', '');
      if (username && username.length > 2) {
        networks[platform + 'Url'] = `https://${platform}.com/${username.replace('@', '')}`;
      }
    }
  }
  
  return networks;
}

// Fonction pour extraire les services offerts
export function extractServices(text: string, bio: string): string[] {
  const fullText = (text + ' ' + bio).toLowerCase();
  const services: string[] = [];
  
  const serviceKeywords = [
    'formation', 'conseil', 'consulting', 'développement', 'maintenance', 'installation',
    'réparation', 'vente', 'achat', 'location', 'livraison', 'transport', 'logistique',
    'marketing', 'communication', 'design', 'graphisme', 'événement', 'organisation',
    'catering', 'restauration', 'hébergement', 'tourisme', 'guide', 'excursion',
    'coiffure', 'beauté', 'esthétique', 'massage', 'soins', 'santé', 'médical',
    'juridique', 'comptabilité', 'finances', 'assurance', 'immobilier', 'construction',
    'artisanat', 'couture', 'cuisine', 'pâtisserie', 'boulangerie'
  ];
  
  for (const keyword of serviceKeywords) {
    if (fullText.includes(keyword)) {
      services.push(keyword);
    }
  }
  
  return Array.from(new Set(services)); // Supprimer les doublons
}

// Fonction pour extraire les informations d'entreprise à partir des données de profil
export function extractCompanyInfo(profileData: any, platform: string): Partial<GabonCompany> | undefined {
  const content = profileData.description || profileData.bio || '';
  const bio = profileData.bio || profileData.description || '';
  const hashtags = profileData.hashtags || [];
  
  const analysis = analyzeGabonCompany(content, bio, hashtags);
  
  if (!analysis.isGabonCompany) {
    return undefined;
  }
  
  // Extraire les informations de contact
  const phone = extractPhoneNumber(content + ' ' + bio);
  const email = extractEmail(content + ' ' + bio);
  const website = extractWebsite(content + ' ' + bio);
  const openingHours = extractOpeningHours(content + ' ' + bio);
  const socialNetworks = extractSocialNetworks(content, bio);
  const services = extractServices(content, bio);
  
  // Déterminer la ville principale
  const detectedCity = analysis.locationIndicators.find(loc => 
    ['libreville', 'port-gentil', 'franceville', 'oyem', 'moanda'].includes(loc.toLowerCase())
  ) || null;
  
  return {
    id: profileData.id || profileData.username || '',
    name: profileData.name || profileData.username || profileData.display_name || '',
    bio: bio,
    description: content,
    profileImage: profileData.profile_image_url || profileData.profile_pic_url || profileData.avatar || '',
    platform: platform as any,
    profileUrl: profileData.url || profileData.profile_url || profileData.link || '',
    activityDomain: analysis.activityDomain,
    category: analysis.activityDomain,
    location: analysis.locationIndicators.join(', ') || 'Gabon',
    city: detectedCity,
    followers: profileData.followers_count || profileData.followers || 0,
    verified: profileData.verified || false,
    gabonScore: analysis.gabonScore,
    hashtags: hashtags,
    lastPostDate: profileData.last_post_date || new Date().toISOString(),
    
    // Informations de contact extraites
    phone: phone,
    email: email,
    website: website,
    whatsapp: phone, // Utiliser le même numéro pour WhatsApp
    
    // Horaires d'ouverture
    openingHours: openingHours,
    
    // Réseaux sociaux
    ...socialNetworks,
    
    // Métadonnées (ajoutées comme propriétés custom)
    // dataSource: platform, <- Retiré car non défini dans le type GabonCompany
    // dataQuality: calculateDataQuality(...), <- Retiré car non défini dans le type
    lastScraped: new Date().toISOString()
  } as any; // Cast en any pour permettre les propriétés custom
}

// Fonction pour calculer la qualité des données
function calculateDataQuality(data: any): number {
  let score = 0;
  
  // Points pour chaque type d'information
  if (data.phone) score += 20;
  if (data.email) score += 15;
  if (data.website) score += 15;
  if (data.openingHours) score += 10;
  if (data.bio && data.bio.length > 50) score += 15;
  if (data.profileImage) score += 10;
  if (data.services && data.services.length > 0) score += 10;
  if (Object.keys(data.socialNetworks || {}).length > 0) score += 5;
  
  return Math.min(score, 100);
}