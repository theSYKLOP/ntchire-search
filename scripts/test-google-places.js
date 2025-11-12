/**
 * Script de test pour diagnostiquer les problèmes Google Places API
 */

import 'dotenv/config'
import axios from 'axios'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place'

console.log('🧪 Test Google Places API\n')
console.log('🔑 API Key présente:', !!GOOGLE_API_KEY)
console.log('🔑 API Key longueur:', GOOGLE_API_KEY?.length)
console.log('🔑 API Key commence par:', GOOGLE_API_KEY?.substring(0, 10) + '...\n')

async function testTextSearch() {
  console.log('📍 Test 1: Text Search - "restaurant à akanda"\n')
  
  const params = {
    key: GOOGLE_API_KEY,
    query: 'restaurant à akanda Gabon',
    location: '0.3901,9.4673',
    radius: 50000,
    language: 'fr'
  }
  
  try {
    const response = await axios.get(`${GOOGLE_PLACES_URL}/textsearch/json`, { 
      params,
      timeout: 15000 
    })
    
    console.log('✅ Statut HTTP:', response.status)
    console.log('📊 Statut API:', response.data.status)
    console.log('📊 Nombre de résultats:', response.data.results?.length || 0)
    
    if (response.data.error_message) {
      console.error('❌ Message d\'erreur:', response.data.error_message)
    }
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('\n📋 Premiers résultats:')
      response.data.results.slice(0, 3).forEach((place, i) => {
        console.log(`\n${i + 1}. ${place.name}`)
        console.log(`   📍 Adresse: ${place.formatted_address || place.vicinity}`)
        console.log(`   🆔 Place ID: ${place.place_id}`)
        console.log(`   ⭐ Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} avis)`)
        console.log(`   📞 Types: ${place.types?.join(', ')}`)
      })
    } else {
      console.log('\n⚠️ Aucun résultat trouvé')
    }
    
    return response.data
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message)
    return null
  }
}

async function testNearbySearch() {
  console.log('\n\n📍 Test 2: Nearby Search - Libreville\n')
  
  const params = {
    key: GOOGLE_API_KEY,
    location: '0.3901,9.4673', // Libreville
    radius: 10000, // 10km
    keyword: 'restaurant',
    language: 'fr'
  }
  
  try {
    const response = await axios.get(`${GOOGLE_PLACES_URL}/nearbysearch/json`, { 
      params,
      timeout: 15000 
    })
    
    console.log('✅ Statut HTTP:', response.status)
    console.log('📊 Statut API:', response.data.status)
    console.log('📊 Nombre de résultats:', response.data.results?.length || 0)
    
    if (response.data.error_message) {
      console.error('❌ Message d\'erreur:', response.data.error_message)
    }
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('\n📋 Premiers résultats:')
      response.data.results.slice(0, 3).forEach((place, i) => {
        console.log(`\n${i + 1}. ${place.name}`)
        console.log(`   📍 Adresse: ${place.vicinity}`)
        console.log(`   🆔 Place ID: ${place.place_id}`)
        console.log(`   ⭐ Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} avis)`)
      })
    }
    
    return response.data
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message)
    return null
  }
}

async function testPlaceDetails(placeId) {
  console.log('\n\n📍 Test 3: Place Details\n')
  
  const params = {
    key: GOOGLE_API_KEY,
    place_id: placeId,
    fields: 'name,formatted_address,formatted_phone_number,website,rating,opening_hours',
    language: 'fr'
  }
  
  try {
    const response = await axios.get(`${GOOGLE_PLACES_URL}/details/json`, { 
      params,
      timeout: 10000 
    })
    
    console.log('✅ Statut HTTP:', response.status)
    console.log('📊 Statut API:', response.data.status)
    
    if (response.data.result) {
      const place = response.data.result
      console.log('\n📋 Détails:')
      console.log(`   📛 Nom: ${place.name}`)
      console.log(`   📍 Adresse: ${place.formatted_address}`)
      console.log(`   📞 Téléphone: ${place.formatted_phone_number || 'N/A'}`)
      console.log(`   🌐 Website: ${place.website || 'N/A'}`)
      console.log(`   ⭐ Rating: ${place.rating || 'N/A'}`)
    }
    
    return response.data
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message)
    return null
  }
}

async function checkAPIStatus() {
  console.log('\n\n🔍 Test 4: Vérification des APIs activées\n')
  
  // Test simple pour voir si l'API répond
  const simpleParams = {
    key: GOOGLE_API_KEY,
    input: 'Libreville',
    inputtype: 'textquery'
  }
  
  try {
    const response = await axios.get(`${GOOGLE_PLACES_URL}/findplacefromtext/json`, { 
      params: simpleParams,
      timeout: 10000 
    })
    
    console.log('📊 Statut API:', response.data.status)
    
    if (response.data.status === 'REQUEST_DENIED') {
      console.error('\n❌ L\'API Places n\'est PAS activée !')
      console.error('💡 Solutions:')
      console.error('   1. Allez sur: https://console.cloud.google.com/apis/library/places-backend.googleapis.com')
      console.error('   2. Cliquez sur "Activer"')
      console.error('   3. Assurez-vous que la facturation est activée sur le projet')
      console.error('   4. Vérifiez les restrictions de clé API')
      return false
    } else if (response.data.status === 'OK' || response.data.candidates) {
      console.log('✅ L\'API Places est activée et fonctionne !')
      return true
    } else {
      console.warn('⚠️ Statut inattendu:', response.data.status)
      return false
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.response?.data || error.message)
    return false
  }
}

// Exécution des tests
async function runAllTests() {
  console.log('=' .repeat(60))
  console.log('🧪 DIAGNOSTIC GOOGLE PLACES API')
  console.log('='.repeat(60) + '\n')
  
  // Test 4: Vérifier si l'API est activée
  const isEnabled = await checkAPIStatus()
  
  if (!isEnabled) {
    console.log('\n❌ L\'API n\'est pas correctement configurée. Arrêt des tests.')
    return
  }
  
  // Test 1: Text Search
  const textSearchResults = await testTextSearch()
  
  // Test 2: Nearby Search
  const nearbyResults = await testNearbySearch()
  
  // Test 3: Place Details (si on a des résultats)
  const placeId = textSearchResults?.results?.[0]?.place_id || nearbyResults?.results?.[0]?.place_id
  if (placeId) {
    await testPlaceDetails(placeId)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Tests terminés')
  console.log('='.repeat(60))
}

runAllTests().catch(console.error)
