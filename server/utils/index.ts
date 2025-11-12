/**
 * Exports centralisés pour éviter les duplications et simplifier les imports
 * 
 * IMPORTANT : Exports sélectifs uniquement pour éviter les conflits
 */

// Types partagés (source unique)
export type { 
  SearchOptions, 
  SearchResults, 
  FallbackSearchResult 
} from './types';

export { 
  isGabonRelated, 
  calculateGabonScore 
} from './types';

// Cache de recherche
export { 
  getCachedSearch, 
  setCachedSearch, 
  cleanExpiredCache,
  clearAllCache,
  invalidateCache,
  getCacheStats,
  generateQueryHash
} from './search-cache';

// Recherche intelligente
export {
  smartDatabaseSearch,
  findSimilarCachedQueries
} from './smart-search';

// HuggingFace
export {
  generateQuery,
  generateSearchSuggestions,
  generateFacebookPageQuery,
  analyzeGabonCompany,
  extractCompanyInfo
} from './huggingface';

export type { 
  GabonCompany as HFGabonCompany, 
  ContentAnalysis 
} from './huggingface';

// Google (exports sélectifs)
export {
  searchGabonCompanies,
  searchGooglePlaces,
  mapGoogleResultToCompany,
  mapGooglePlaceToCompany
} from './google';

// Facebook (exports sélectifs)
export {
  searchPagesAdvanced,
  mapFacebookPageToCompany
} from './facebook';

// Instagram
export * from './instagram';

// TikTok
export * from './tiktok';
