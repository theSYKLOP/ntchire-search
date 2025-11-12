import { PrismaClient } from '@prisma/client';
import { GabonCompany } from '../../utils/huggingface';

const prisma = new PrismaClient();

// Données mock supprimées - utilisation des APIs réelles uniquement
const mockGabonCompanies: GabonCompany[] = [];

export default defineEventHandler(async (event) => {
  try {
    console.log('Synchronisation des entreprises gabonaises...');
    
    const results = [];
    
    for (const companyData of mockGabonCompanies) {
      try {
        // Vérifier si l'entreprise existe déjà
        const existingCompany = await prisma.gabonCompany.findUnique({
          where: { profileUrl: companyData.profileUrl }
        });

        if (existingCompany) {
          // Mettre à jour l'entreprise existante
          const updatedCompany = await prisma.gabonCompany.update({
            where: { id: existingCompany.id },
            data: {
              name: companyData.name,
              bio: companyData.bio,
              profileImage: companyData.profileImage,
              platform: companyData.platform,
              activityDomain: companyData.activityDomain,
              location: companyData.location,
              followers: companyData.followers,
              gabonScore: companyData.gabonScore,
              hashtags: companyData.hashtags,
              lastPostDate: new Date(companyData.lastPostDate),
              contactInfo: companyData.contactInfo || {}
            }
          });
          
          results.push({ action: 'updated', company: updatedCompany.name });
        } else {
          // Créer une nouvelle entreprise
          const newCompany = await prisma.gabonCompany.create({
            data: {
              name: companyData.name,
              bio: companyData.bio,
              profileImage: companyData.profileImage,
              platform: companyData.platform,
              profileUrl: companyData.profileUrl,
              activityDomain: companyData.activityDomain,
              location: companyData.location,
              followers: companyData.followers,
              gabonScore: companyData.gabonScore,
              hashtags: companyData.hashtags,
              lastPostDate: new Date(companyData.lastPostDate),
              contactInfo: companyData.contactInfo || {}
            }
          });
          
          results.push({ action: 'created', company: newCompany.name });
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de ${companyData.name}:`, error);
        results.push({ action: 'error', company: companyData.name, error: error.message });
      }
    }

    return {
      success: true,
      message: 'Synchronisation terminée',
      results
    };
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la synchronisation des entreprises'
    });
  }
});
