/**
 * Script de test des suggestions IA
 * Teste l'endpoint /api/search/suggestions
 * 
 * Usage: node scripts/test-ai-suggestions.js
 */

const BASE_URL = 'http://localhost:3000'

async function testSuggestions(query) {
  console.log(`\n🧪 Test des suggestions pour: "${query}"`)
  console.log('='.repeat(60))
  
  try {
    const url = `${BASE_URL}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`
    console.log(`📡 URL: ${url}`)
    
    const response = await fetch(url)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur:', errorText)
      return
    }
    
    const data = await response.json()
    console.log(`✅ Réponse reçue:`)
    console.log(JSON.stringify(data, null, 2))
    
    if (data.suggestions && data.suggestions.length > 0) {
      console.log(`\n💡 ${data.suggestions.length} suggestions trouvées:`)
      data.suggestions.forEach((suggestion, i) => {
        console.log(`   ${i + 1}. ${suggestion}`)
      })
    } else {
      console.log('\n⚠️ Aucune suggestion trouvée')
    }
    
    if (data.useAI) {
      console.log('\n🤖 Suggestions générées par IA (Mistral)')
    } else {
      console.log('\n💾 Suggestions locales (fallback)')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

async function runTests() {
  console.log('\n🚀 Début des tests des suggestions IA')
  console.log('='.repeat(60))
  
  const queries = [
    'restaurant',
    're',
    'salon',
    'technologie',
    'coiffure',
    'boutique',
    'formation',
    'immobilier'
  ]
  
  for (const query of queries) {
    await testSuggestions(query)
    await new Promise(resolve => setTimeout(resolve, 500)) // Pause entre les requêtes
  }
  
  console.log('\n✅ Tests terminés')
}

runTests()
