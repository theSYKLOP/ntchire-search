import { searchInReferencePages, mapGoogleResultToCompany } from '../../utils/google.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchQuery = query.q as string || ''
  const pageIds = query.pageIds as string || ''
  const limit = parseInt(query.limit as string || '10', 10)
  
  if (!searchQuery.trim()) {
    return createError({
      statusCode: 400,
      statusMessage: 'Paramètre de recherche requis'
    })
  }
  
  try {
    console.log('🔍 Recherche dans les pages de référence:', {
      query: searchQuery,
      pageIds: pageIds ? pageIds.split(',') : [],
      limit
    })
    
    const pageIdsArray = pageIds ? pageIds.split(',').filter(id => id.trim()) : []
    const results = await searchInReferencePages(searchQuery, pageIdsArray, limit)
    
    // Convertir les résultats Google en format entreprise
    const companies = results.map(result => {
      // Déterminer la plateforme à partir de l'URL ou des métadonnées
      let platform = 'facebook'
      if (result.link.includes('instagram.com')) platform = 'instagram'
      else if (result.link.includes('tiktok.com')) platform = 'tiktok'
      else if (result.link.includes('linkedin.com')) platform = 'linkedin'
      else if (result.link.includes('twitter.com')) platform = 'twitter'
      
      const company = mapGoogleResultToCompany(result, platform)
      
      // Ajouter les métadonnées de la page de référence si disponibles
      if ('referencePage' in result) {
        company.referencePage = result.referencePage
      }
      
      return company
    })
    
    console.log('✅ Résultats pages de référence trouvés:', companies.length)
    
    return {
      success: true,
      companies,
      searchQuery,
      totalResults: companies.length,
      sourceType: 'reference-pages'
    }
  } catch (error) {
    console.error('❌ Erreur lors de la recherche dans les pages de référence:', error)
    
    return createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la recherche dans les pages de référence'
    })
  }
})
