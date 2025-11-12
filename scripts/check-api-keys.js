// Script de vérification des clés API
// Exécuter avec: node scripts/check-api-keys.js

import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

console.log('🔑 Vérification des clés API\n')

const apiKeys = {
  'Facebook API': {
    key: process.env.FB_ACCESS_TOKEN,
    required: true,
    description: 'Token d\'accès Facebook pour les pages publiques'
  },
  'Google Custom Search': {
    key: process.env.GOOGLE_API_KEY,
    required: true,
    description: 'Clé API Google pour la recherche web'
  },
  'Google Search Engine ID': {
    key: process.env.GOOGLE_SEARCH_ENGINE_ID,
    required: true,
    description: 'ID du moteur de recherche personnalisé Google'
  },
  'Instagram API': {
    key: process.env.INSTAGRAM_ACCESS_TOKEN,
    required: false,
    description: 'Token Instagram (optionnel - utilise des données mock)'
  },
  'TikTok API': {
    key: process.env.TIKTOK_ACCESS_TOKEN,
    required: false,
    description: 'Token TikTok (optionnel - utilise des données mock)'
  }
}

let allRequiredKeysPresent = true

for (const [service, config] of Object.entries(apiKeys)) {
  const status = config.key ? '✅' : (config.required ? '❌' : '⚠️')
  const required = config.required ? '(Obligatoire)' : '(Optionnel)'
  
  console.log(`${status} ${service} ${required}`)
  console.log(`   ${config.description}`)
  
  if (config.key) {
    console.log(`   Token: ${config.key.substring(0, 10)}...`)
  } else if (config.required) {
    allRequiredKeysPresent = false
  }
  console.log('')
}

if (allRequiredKeysPresent) {
  console.log('🎉 Toutes les clés obligatoires sont configurées!')
  console.log('💡 Le système de fallback search est prêt à fonctionner.')
} else {
  console.log('⚠️ Certaines clés obligatoires sont manquantes.')
  console.log('📖 Consultez FALLBACK_SEARCH.md pour les instructions d\'obtention.')
}

console.log('\n🔧 Pour tester le système:')
console.log('   npm run dev')
console.log('   node examples/test-fallback-search.js')
