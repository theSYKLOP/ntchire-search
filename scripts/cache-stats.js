import { PrismaClient } from '@prisma/client';
import { getCacheStats, cleanExpiredCache } from '../server/utils/search-cache';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Statistiques du cache de recherche\n');
  
  const stats = await getCacheStats();
  
  if (!stats) {
    console.error('❌ Impossible de récupérer les statistiques');
    return;
  }
  
  console.log(`📦 Total des caches : ${stats.totalCaches}`);
  console.log(`✅ Caches actifs : ${stats.activeCaches}`);
  console.log(`⏰ Caches expirés : ${stats.expiredCaches}`);
  
  if (stats.topQueries.length > 0) {
    console.log('\n🔥 Top 10 des recherches les plus populaires :\n');
    stats.topQueries.forEach((query, index) => {
      const lastAccessed = new Date(query.lastAccessed).toLocaleString('fr-FR');
      console.log(`${index + 1}. "${query.query}"`);
      console.log(`   💎 ${query.hitCount} utilisations | Source: ${query.source}`);
      console.log(`   🕐 Dernier accès: ${lastAccessed}\n`);
    });
  } else {
    console.log('\nℹ️  Aucune recherche en cache pour le moment');
  }
  
  // Nettoyer les caches expirés
  console.log('\n🧹 Nettoyage des caches expirés...');
  const cleaned = await cleanExpiredCache();
  console.log(`✅ ${cleaned} cache(s) expiré(s) supprimé(s)`);
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
