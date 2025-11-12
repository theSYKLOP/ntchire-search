import { generateSearchSuggestions } from '../../utils/huggingface';

/**
 * API pour obtenir des suggestions de recherche intelligentes
 * GET /api/search/suggestions?q=restaurant
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const searchQuery = query.q as string || '';
    const limit = parseInt(query.limit as string || '5', 10);

    if (!searchQuery || searchQuery.trim().length < 2) {
      return {
        suggestions: [],
        message: 'Requête trop courte (minimum 2 caractères)',
      };
    }

    // Générer les suggestions avec le modèle BitNet
    const suggestions = await generateSearchSuggestions(searchQuery, limit);

    return {
      suggestions,
      query: searchQuery,
      count: suggestions.length,
    };
  } catch (error: any) {
    console.error('Erreur dans l\'API de suggestions:', error);
    
    return {
      suggestions: [],
      error: 'suggestion_error',
      message: error?.message || 'Erreur lors de la génération des suggestions',
    };
  }
});
