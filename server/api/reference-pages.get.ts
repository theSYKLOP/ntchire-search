import { getActiveReferencePages } from '../utils/google.js'

export default defineEventHandler(async (event) => {
  try {
    const referencePages = getActiveReferencePages()
    
    return {
      success: true,
      data: referencePages,
      count: referencePages.length
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des pages de référence:', error)
    
    return createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des pages de référence'
    })
  }
})
