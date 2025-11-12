// Exemple de test pour le système de fallback search
// Exécuter avec: node examples/test-fallback-search.js

const BASE_URL = 'http://localhost:3000'

async function testFallbackSearch() {
  console.log('🧪 Test du système de fallback search\n')
  
  // Test 1: Recherche simple
  console.log('1️⃣ Test recherche simple: "restaurant libreville"')
  try {
    const response = await fetch(`${BASE_URL}/api/search/facebook?q=restaurant%20libreville&limit=5`)
    const data = await response.json()
    console.log(`✅ Résultats: ${data.companies?.length || 0} entreprises`)
    console.log(`📊 Sources: ${data.platforms?.join(', ') || 'N/A'}`)
    console.log(`🔍 Plateformes: ${data.source || 'N/A'}\n`)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
  
  // Test 2: Recherche multi-plateforme
  console.log('2️⃣ Test recherche multi-plateforme: "restaurant"')
  try {
    const response = await fetch(`${BASE_URL}/api/search/facebook?q=restaurant&platforms=facebook,instagram,tiktok&limit=10`)
    const data = await response.json()
    console.log(`✅ Résultats: ${data.companies?.length || 0} entreprises`)
    console.log(`📊 Facebook: ${data.facebookResults || 0}, Fallback: ${data.fallbackResults || 0}, Mock: ${data.mockResults || 0}`)
    console.log(`🔍 Sources: ${data.platforms?.join(', ') || 'N/A'}\n`)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
  
  // Test 3: Recherche par hashtag
  console.log('3️⃣ Test recherche par hashtag: "#MadeInGabon"')
  try {
    const response = await fetch(`${BASE_URL}/api/search/facebook?hashtag=%23MadeInGabon&limit=8`)
    const data = await response.json()
    console.log(`✅ Résultats: ${data.companies?.length || 0} entreprises`)
    console.log(`📊 Sources: ${data.platforms?.join(', ') || 'N/A'}`)
    console.log(`🔍 Type: ${data.source || 'N/A'}\n`)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
  
  // Test 4: Recherche avec fallback désactivé
  console.log('4️⃣ Test sans fallback: "restaurant"')
  try {
    const response = await fetch(`${BASE_URL}/api/search/facebook?q=restaurant&useFallback=false&platforms=facebook&limit=5`)
    const data = await response.json()
    console.log(`✅ Résultats: ${data.companies?.length || 0} entreprises`)
    console.log(`📊 Facebook: ${data.facebookResults || 0}, Mock: ${data.mockResults || 0}`)
    console.log(`🔍 Sources: ${data.platforms?.join(', ') || 'N/A'}\n`)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
  
  // Test 5: Recherche par secteur d'activité
  console.log('5️⃣ Test recherche par secteur: "technologie"')
  try {
    const response = await fetch(`${BASE_URL}/api/search/facebook?q=technologie&platforms=facebook,instagram,google&limit=6`)
    const data = await response.json()
    console.log(`✅ Résultats: ${data.companies?.length || 0} entreprises`)
    console.log(`📊 Sources: ${data.platforms?.join(', ') || 'N/A'}`)
    
    // Afficher les détails des entreprises trouvées
    if (data.companies && data.companies.length > 0) {
      console.log('\n📋 Détails des entreprises:')
      data.companies.slice(0, 3).forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name}`)
        console.log(`      🏢 Secteur: ${company.activityDomain}`)
        console.log(`      📍 Localisation: ${company.location}`)
        console.log(`      📱 Plateforme: ${company.platform}`)
        console.log(`      🏷️ Hashtags: ${company.hashtags?.slice(0, 3).join(', ') || 'Aucun'}`)
        console.log(`      ⭐ Score Gabon: ${company.gabonScore || 'N/A'}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
  
  console.log('🎉 Tests terminés!')
}

// Fonction pour tester les différents hashtags gabonais
async function testGabonHashtags() {
  console.log('\n🏷️ Test des hashtags gabonais\n')
  
  const hashtags = [
    '#MadeInGabon',
    '#EntrepriseGabonaise', 
    '#GabonTech',
    '#Libreville',
    '#PortGentil',
    '#RestaurantGabonais'
  ]
  
  for (const hashtag of hashtags) {
    console.log(`Test hashtag: ${hashtag}`)
    try {
      const response = await fetch(`${BASE_URL}/api/search/facebook?hashtag=${encodeURIComponent(hashtag)}&limit=3`)
      const data = await response.json()
      console.log(`  ✅ ${data.companies?.length || 0} résultats`)
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`)
    }
  }
}

// Fonction pour tester les différents secteurs
async function testBusinessSectors() {
  console.log('\n🏢 Test des secteurs d\'activité\n')
  
  const sectors = [
    'restaurant',
    'technologie', 
    'mode',
    'immobilier',
    'formation',
    'transport',
    'santé',
    'événementiel'
  ]
  
  for (const sector of sectors) {
    console.log(`Test secteur: ${sector}`)
    try {
      const response = await fetch(`${BASE_URL}/api/search/facebook?q=${sector}&platforms=facebook,instagram,tiktok&limit=2`)
      const data = await response.json()
      console.log(`  ✅ ${data.companies?.length || 0} résultats`)
      if (data.companies && data.companies.length > 0) {
        const firstCompany = data.companies[0]
        console.log(`     📋 Exemple: ${firstCompany.name} (${firstCompany.activityDomain})`)
      }
    } catch (error) {
      console.log(`  ❌ Erreur: ${error.message}`)
    }
  }
}

// Exécuter les tests
async function runAllTests() {
  await testFallbackSearch()
  await testGabonHashtags()
  await testBusinessSectors()
}

// Vérifier si on est dans un environnement Node.js
if (typeof fetch === 'undefined') {
  console.log('❌ Ce script nécessite Node.js 18+ avec fetch support')
  console.log('💡 Alternative: Utilisez curl ou un client HTTP')
  console.log('\nExemples curl:')
  console.log('curl "http://localhost:3000/api/search/facebook?q=restaurant&limit=5"')
  console.log('curl "http://localhost:3000/api/search/facebook?hashtag=%23MadeInGabon&limit=3"')
  console.log('curl "http://localhost:3000/api/search/facebook?q=technologie&platforms=facebook,instagram&limit=5"')
} else {
  runAllTests().catch(console.error)
}
