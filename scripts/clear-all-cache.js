import { PrismaClient } from '@prisma/client';
import { clearAllCache } from '../server/utils/search-cache';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('⚠️  ATTENTION : Cette action va supprimer TOUS les caches de recherche!\n');
  
  const total = await prisma.searchCache.count();
  console.log(`📦 ${total} cache(s) seront supprimés\n`);
  
  rl.question('Êtes-vous sûr de vouloir continuer ? (oui/non) : ', async (answer) => {
    if (answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o') {
      console.log('\n🗑️  Suppression en cours...');
      const cleared = await clearAllCache();
      console.log(`✅ ${cleared} cache(s) supprimé(s)`);
    } else {
      console.log('\n❌ Opération annulée');
    }
    
    rl.close();
    await prisma.$disconnect();
  });
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
