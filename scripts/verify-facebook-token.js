/**
 * Script de vérification du token Facebook
 * Usage: node scripts/verify-facebook-token.js
 */

const axios = require('axios');
require('dotenv').config();

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v18.0';

async function verifyFacebookToken() {
  console.log('🔍 Vérification du token Facebook...\n');

  if (!FB_ACCESS_TOKEN) {
    console.error('❌ FB_ACCESS_TOKEN manquant dans le fichier .env');
    console.log('\n📝 Solution:');
    console.log('1. Créez une application Facebook: https://developers.facebook.com/apps/');
    console.log('2. Ajoutez l\'API Graph dans votre app');
    console.log('3. Générez un token d\'accès avec les permissions:');
    console.log('   - pages_read_engagement');
    console.log('   - pages_show_list');
    console.log('   - business_management (si vous gérez une page)');
    console.log('4. Ajoutez FB_ACCESS_TOKEN=votre_token dans .env');
    process.exit(1);
  }

  try {
    // Vérifier le token
    console.log('📡 Test de connexion à l\'API Graph...');
    const debugUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/debug_token`;
    const debugResponse = await axios.get(debugUrl, {
      params: {
        input_token: FB_ACCESS_TOKEN,
        access_token: FB_ACCESS_TOKEN
      }
    });

    const tokenData = debugResponse.data.data;
    
    console.log('✅ Token valide!\n');
    console.log('📊 Informations du token:');
    console.log(`   - App ID: ${tokenData.app_id}`);
    console.log(`   - Type: ${tokenData.type}`);
    console.log(`   - Valide: ${tokenData.is_valid ? '✅ Oui' : '❌ Non'}`);
    console.log(`   - Expire: ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toLocaleString() : 'Jamais'}`);
    console.log(`   - User ID: ${tokenData.user_id || 'N/A'}`);
    
    if (tokenData.scopes) {
      console.log(`\n🔐 Permissions accordées (${tokenData.scopes.length}):`);
      tokenData.scopes.forEach(scope => {
        console.log(`   - ${scope}`);
      });
      
      // Vérifier les permissions nécessaires
      const requiredScopes = ['pages_read_engagement', 'pages_show_list'];
      const missingScopes = requiredScopes.filter(scope => !tokenData.scopes.includes(scope));
      
      if (missingScopes.length > 0) {
        console.log('\n⚠️  Permissions manquantes:');
        missingScopes.forEach(scope => {
          console.log(`   ❌ ${scope}`);
        });
        console.log('\n📝 Action requise:');
        console.log('   Régénérez votre token avec les permissions manquantes:');
        console.log('   https://developers.facebook.com/tools/explorer/');
      } else {
        console.log('\n✅ Toutes les permissions nécessaires sont présentes!');
      }
    }

    // Tester une recherche simple
    console.log('\n🔎 Test de recherche...');
    try {
      const searchUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/search`;
      const searchResponse = await axios.get(searchUrl, {
        params: {
          q: 'restaurant',
          type: 'page',
          fields: 'id,name',
          limit: 1,
          access_token: FB_ACCESS_TOKEN
        }
      });

      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        console.log('✅ Recherche fonctionnelle!');
        console.log(`   Exemple trouvé: ${searchResponse.data.data[0].name}`);
      } else {
        console.log('⚠️  Recherche retourne 0 résultats');
        console.log('   Cela peut être normal selon votre région');
      }
    } catch (searchError) {
      console.error('❌ Erreur lors de la recherche:');
      console.error(`   ${searchError.response?.data?.error?.message || searchError.message}`);
      
      if (searchError.response?.data?.error?.code === 200) {
        console.log('\n📝 Solution:');
        console.log('   Cette erreur indique un problème de permissions.');
        console.log('   1. Vérifiez que votre token a les permissions "pages_read_engagement"');
        console.log('   2. Si vous utilisez un token utilisateur, assurez-vous d\'avoir:');
        console.log('      - Accepté les permissions dans votre compte Facebook');
        console.log('      - Accès à des pages ou groupes');
      }
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du token:');
    
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      console.error(`   Code: ${fbError.code}`);
      console.error(`   Message: ${fbError.message}`);
      console.error(`   Type: ${fbError.type}`);

      if (fbError.code === 190) {
        console.log('\n📝 Solution:');
        console.log('   Token invalide ou expiré. Générez un nouveau token:');
        console.log('   1. Allez sur https://developers.facebook.com/tools/explorer/');
        console.log('   2. Sélectionnez votre application');
        console.log('   3. Cliquez sur "Generate Access Token"');
        console.log('   4. Sélectionnez les permissions requises');
        console.log('   5. Copiez le nouveau token dans .env');
      }
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Exécuter la vérification
verifyFacebookToken();
