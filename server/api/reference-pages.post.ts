import { updateReferencePage, type ReferencePage } from '../utils/google.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as Partial<ReferencePage> & { id: string }
    
    if (!body.id) {
      return createError({
        statusCode: 400,
        statusMessage: 'ID de la page de référence requis'
      })
    }
    
    const success = updateReferencePage(body)
    
    if (success) {
      return {
        success: true,
        message: 'Page de référence mise à jour avec succès',
        data: body
      }
    } else {
      return createError({
        statusCode: 400,
        statusMessage: 'Impossible de mettre à jour la page de référence. Vérifiez les données fournies.'
      })
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la page de référence:', error)
    
    return createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la mise à jour de la page de référence'
    })
  }
})
