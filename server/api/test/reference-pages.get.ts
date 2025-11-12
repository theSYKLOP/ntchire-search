// Endpoint de test pour vérifier que les imports fonctionnent
import { getActiveReferencePages, searchInReferencePages } from '../../utils/google.js'

export default defineEventHandler(async (event) => {
  try {
    console.log('🧪 Test des imports de google.ts...')
    
    // Test 1: Vérifier que les pages de référence sont accessibles
    const pages = getActiveReferencePages()
    console.log('✅ Pages de référence chargées:', pages.length)
    
    // Test 2: Tester une recherche simple (si les clés API sont disponibles)
    try {
      const testResults = await searchInReferencePages('test', [], 1)
      console.log('✅ Recherche test réussie, résultats:', testResults.length)
    } catch (searchError) {
      console.log('⚠️ Recherche test échouée (normal si pas de clés API):', (searchError as Error).message)
    }
    
    return {
      success: true,
      message: 'Imports et fonctions Google OK',
      data: {
        pagesCount: pages.length,
        pages: pages.map(p => ({ id: p.id, name: p.name, platform: p.platform }))
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des imports:', error)
    
    return createError({
      statusCode: 500,
      statusMessage: `Erreur d'import: ${(error as Error).message}`
    })
  }
})

