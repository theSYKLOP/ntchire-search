const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('🗑️ Début du nettoyage de la base de données...')
    
    // Supprimer toutes les données dans l'ordre approprié (contraintes de clés étrangères)
    
    console.log('📊 Suppression des likes...')
    const deletedLikes = await prisma.companyLike.deleteMany()
    console.log(`✅ ${deletedLikes.count} likes supprimés`)
    
    console.log('🏢 Suppression des entreprises...')
    const deletedCompanies = await prisma.gabonCompany.deleteMany()
    console.log(`✅ ${deletedCompanies.count} entreprises supprimées`)
    
    console.log('👥 Suppression des utilisateurs...')
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`✅ ${deletedUsers.count} utilisateurs supprimés`)
    
    console.log('🔍 Suppression des résultats de recherche...')
    const deletedResults = await prisma.result.deleteMany()
    console.log(`✅ ${deletedResults.count} résultats supprimés`)
    
    console.log('🔎 Suppression des recherches...')
    const deletedSearches = await prisma.search.deleteMany()
    console.log(`✅ ${deletedSearches.count} recherches supprimées`)
    
    console.log('')
    console.log('✨ Base de données nettoyée avec succès !')
    console.log('🎯 Vous pouvez maintenant effectuer de nouvelles recherches')
    console.log('📈 Les données seront collectées et enrichies par Hugging Face')
    console.log('🚀 Recherche Google Places et Facebook activées')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter directement sans confirmation
clearDatabase()
