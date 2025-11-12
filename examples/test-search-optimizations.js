/**
 * Script de test pour vérifier les optimisations du moteur de recherche
 * 
 * Teste :
 * 1. Suggestions de recherche avec BitNet
 * 2. Cache de recherche
 * 3. Performance
 * 
 * Usage : node examples/test-search-optimizations.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSuggestions() {
  log('cyan', '\n=== TEST 1 : Suggestions de Recherche ===\n');
  
  const queries = ['restaurant', 'coiffure', 'informatique', 'immobilier'];
  
  for (const query of queries) {
    try {
      const start = Date.now();
      const response = await axios.get(`${API_BASE_URL}/search/suggestions`, {
        params: { q: query, limit: 3 }
      });
      const duration = Date.now() - start;
      
      log('blue', `\nRecherche : "${query}"`);
      log('yellow', `Temps de réponse : ${duration}ms`);
      
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        log('green', 'Suggestions :');
        response.data.suggestions.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s}`);
        });
      } else {
        log('red', '❌ Aucune suggestion reçue');
      }
    } catch (error) {
      log('red', `❌ Erreur : ${error.message}`);
    }
  }
}

async function testSearchCache() {
  log('cyan', '\n\n=== TEST 2 : Cache de Recherche ===\n');
  
  const testQuery = 'restaurant Libreville';
  
  try {
    // Première recherche (devrait créer le cache)
    log('blue', `\n1️⃣ Première recherche : "${testQuery}"`);
    const start1 = Date.now();
    const response1 = await axios.get(`${API_BASE_URL}/search`, {
      params: { q: testQuery }
    });
    const duration1 = Date.now() - start1;
    
    log('yellow', `Temps de réponse : ${duration1}ms`);
    log('yellow', `Résultats trouvés : ${response1.data.totalFound}`);
    log('yellow', `Depuis le cache : ${response1.data.fromCache ? 'OUI ⚡' : 'NON'}`);
    
    if (response1.data.fromCache) {
      log('green', `Source du cache : ${response1.data.cacheSource}`);
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Deuxième recherche (devrait utiliser le cache)
    log('blue', `\n2️⃣ Deuxième recherche (même requête) : "${testQuery}"`);
    const start2 = Date.now();
    const response2 = await axios.get(`${API_BASE_URL}/search`, {
      params: { q: testQuery }
    });
    const duration2 = Date.now() - start2;
    
    log('yellow', `Temps de réponse : ${duration2}ms`);
    log('yellow', `Résultats trouvés : ${response2.data.totalFound}`);
    log('yellow', `Depuis le cache : ${response2.data.fromCache ? 'OUI ⚡' : 'NON'}`);
    
    if (response2.data.fromCache) {
      log('green', `✅ CACHE HIT ! Source : ${response2.data.cacheSource}`);
      
      // Calculer le gain de performance
      const speedup = ((duration1 - duration2) / duration1 * 100).toFixed(1);
      log('green', `⚡ Gain de performance : ${speedup}% plus rapide !`);
    } else {
      log('red', '❌ Cache non utilisé (possible problème)');
    }
    
  } catch (error) {
    log('red', `❌ Erreur : ${error.message}`);
  }
}

async function testPerformance() {
  log('cyan', '\n\n=== TEST 3 : Performance Globale ===\n');
  
  const queries = [
    'restaurant',
    'coiffure',
    'transport',
    'restaurant', // Répétition pour tester le cache
    'coiffure',   // Répétition pour tester le cache
  ];
  
  const results = {
    fromCache: 0,
    fromDB: 0,
    totalTime: 0,
    cacheTime: 0,
    dbTime: 0,
  };
  
  for (let i = 0; i < queries.length; i++) {
    try {
      const start = Date.now();
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: { q: queries[i] }
      });
      const duration = Date.now() - start;
      
      results.totalTime += duration;
      
      if (response.data.fromCache) {
        results.fromCache++;
        results.cacheTime += duration;
        log('green', `${i + 1}. "${queries[i]}" → CACHE (${duration}ms) ⚡`);
      } else {
        results.fromDB++;
        results.dbTime += duration;
        log('yellow', `${i + 1}. "${queries[i]}" → DB (${duration}ms)`);
      }
      
      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      log('red', `${i + 1}. Erreur : ${error.message}`);
    }
  }
  
  // Statistiques finales
  log('cyan', '\n📊 Statistiques :');
  console.log(`  • Total de requêtes : ${queries.length}`);
  console.log(`  • Depuis le cache : ${results.fromCache} (${(results.fromCache / queries.length * 100).toFixed(0)}%)`);
  console.log(`  • Depuis la DB : ${results.fromDB}`);
  console.log(`  • Temps total : ${results.totalTime}ms`);
  
  if (results.fromCache > 0) {
    const avgCacheTime = (results.cacheTime / results.fromCache).toFixed(0);
    log('green', `  • Temps moyen (cache) : ${avgCacheTime}ms ⚡`);
  }
  
  if (results.fromDB > 0) {
    const avgDBTime = (results.dbTime / results.fromDB).toFixed(0);
    log('yellow', `  • Temps moyen (DB) : ${avgDBTime}ms`);
  }
  
  if (results.fromCache > 0 && results.fromDB > 0) {
    const speedup = ((results.dbTime / results.fromDB) / (results.cacheTime / results.fromCache)).toFixed(1);
    log('green', `\n⚡ Le cache est ${speedup}x plus rapide !`);
  }
}

async function main() {
  log('green', '╔════════════════════════════════════════════════════╗');
  log('green', '║   TEST DES OPTIMISATIONS DU MOTEUR DE RECHERCHE   ║');
  log('green', '╚════════════════════════════════════════════════════╝');
  
  log('yellow', '\n⚠️  Assurez-vous que le serveur est démarré : npm run dev\n');
  
  try {
    // Test 1 : Suggestions
    await testSuggestions();
    
    // Test 2 : Cache
    await testSearchCache();
    
    // Test 3 : Performance
    await testPerformance();
    
    log('green', '\n\n✅ Tous les tests sont terminés !\n');
    
  } catch (error) {
    log('red', `\n❌ Erreur globale : ${error.message}\n`);
    log('yellow', 'Vérifiez que le serveur est bien démarré avec : npm run dev\n');
  }
}

// Lancer les tests
main();
