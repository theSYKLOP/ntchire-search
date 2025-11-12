import { PrismaClient } from '@prisma/client';
import { cleanExpiredCache } from '../server/utils/search-cache';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage des caches expirés...\n');
  
  const cleaned = await cleanExpiredCache();
  
  if (cleaned > 0) {
    console.log(`✅ ${cleaned} cache(s) expiré(s) supprimé(s)`);
  } else {
    console.log('ℹ️  Aucun cache expiré à nettoyer');
  }
  
  // Afficher les statistiques après nettoyage
  const total = await prisma.searchCache.count();
  console.log(`\n📦 Total des caches restants : ${total}`);
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
