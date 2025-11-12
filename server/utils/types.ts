/**
 * Types et interfaces partagés pour le moteur de recherche
 */

// Interface pour les options de recherche (utilisée par cache et fallback)
export interface SearchOptions {
  query: string;
  hashtags?: string[];
  networks?: string[];
  lang?: string;
}

// Interface pour les résultats de recherche
export interface SearchResults {
  companies: any[];
  totalFound: number;
  source: string;
}

// Interface pour le résultat de recherche fallback
export interface FallbackSearchResult {
  companies: any[];
  sources: string[];
  totalFound: number;
  success: boolean;
}

/**
 * Vérifie si un texte est lié au Gabon
 * Fonction utilitaire centralisée pour éviter les duplications
 */
export function isGabonRelated(text: string): boolean {
  const gabonKeywords = [
    'gabon', 'gabonaise', 'gabonais',
    'libreville', 'port-gentil', 'franceville',
    'oyem', 'moanda', 'lambaréné', 'koulamoutou',
    'makokou', 'bitam', 'tchibanga', 'mouila',
    'ndendé', 'omboué', 'akanda', 'noya',
    '100% gabonais', 'made in gabon',
    'entreprise gabonaise', 'entrepreneur gabonais',
    'business gabon', 'gabon business',
    '.ga', // extension de domaine
  ];
  
  const normalizedText = text.toLowerCase();
  
  return gabonKeywords.some(keyword => 
    normalizedText.includes(keyword)
  );
}

/**
 * Calcule un score de pertinence gabonaise
 */
export function calculateGabonScore(text: string, hashtags: string[] = []): number {
  let score = 0;
  const normalizedText = text.toLowerCase();
  const normalizedHashtags = hashtags.map(h => h.toLowerCase());
  
  // Mots-clés principaux (20 points chacun)
  const mainKeywords = ['gabon', 'gabonaise', 'gabonais'];
  mainKeywords.forEach(keyword => {
    if (normalizedText.includes(keyword)) score += 20;
  });
  
  // Villes (15 points chacune)
  const cities = ['libreville', 'port-gentil', 'franceville', 'oyem', 'moanda'];
  cities.forEach(city => {
    if (normalizedText.includes(city)) score += 15;
  });
  
  // Hashtags gabonais (10 points chacun)
  const gabonHashtags = normalizedHashtags.filter(tag => 
    tag.includes('gabon') || tag.includes('libreville')
  );
  score += gabonHashtags.length * 10;
  
  // Expressions spéciales (30 points)
  if (normalizedText.includes('100% gabonais') || 
      normalizedText.includes('made in gabon')) {
    score += 30;
  }
  
  return Math.min(score, 100);
}
