import { PrismaClient } from '@prisma/client';
import { GabonCompany } from '../../utils/huggingface';

const prisma = new PrismaClient();

// Données mockées d'entreprises gabonaises pour la synchronisation
const mockGabonCompanies: GabonCompany[] = [
  {
    id: '1',
    name: 'Tech Gabon SARL',
    bio: 'Entreprise gabonaise spécialisée dans les solutions technologiques et l\'innovation digitale. 100% gabonais, nous développons des applications web et mobiles pour les entreprises de Libreville.',
    profileImage: 'https://via.placeholder.com/150x150/2563eb/ffffff?text=TG',
    platform: 'facebook',
    profileUrl: 'https://facebook.com/techgabon',
    activityDomain: 'technologie',
    location: 'Libreville, Gabon',
    followers: 2500,
    verified: true,
    gabonScore: 95,
    hashtags: ['#gabon', '#tech', '#innovation', '#libreville', '#100%gabonais'],
    lastPostDate: '2024-01-15T10:30:00Z',
    contactInfo: {
      phone: '+241 01 23 45 67',
      email: 'contact@techgabon.ga',
      website: 'https://techgabon.ga',
      address: 'Avenue Léon Mba, Libreville'
    }
  },
  {
    id: '2',
    name: 'Restaurant Le Gabonais',
    bio: 'Restaurant traditionnel gabonais à Port-Gentil. Nous servons les meilleurs plats de la cuisine gabonaise : poulet nyembwe, poisson braisé, plantain... Venez découvrir nos saveurs authentiques !',
    profileImage: 'https://via.placeholder.com/150x150/10b981/ffffff?text=LG',
    platform: 'instagram',
    profileUrl: 'https://instagram.com/restaurantlegabonais',
    activityDomain: 'restauration',
    location: 'Port-Gentil, Gabon',
    followers: 1800,
    verified: false,
    gabonScore: 88,
    hashtags: ['#gabon', '#restaurant', '#cuisine', '#portgentil', '#gabonaise'],
    lastPostDate: '2024-01-14T18:45:00Z',
    contactInfo: {
      phone: '+241 02 34 56 78',
      email: 'info@restaurantlegabonais.ga',
      address: 'Quartier Louis, Port-Gentil'
    }
  },
  {
    id: '3',
    name: 'Mode Gabonaise by Amina',
    bio: 'Créatrice de mode gabonaise basée à Franceville. Je crée des vêtements modernes inspirés de notre culture gabonaise. Chaque pièce raconte une histoire...',
    profileImage: 'https://via.placeholder.com/150x150/ec4899/ffffff?text=MG',
    platform: 'tiktok',
    profileUrl: 'https://tiktok.com/@modegabonaise',
    activityDomain: 'mode',
    location: 'Franceville, Gabon',
    followers: 3200,
    verified: true,
    gabonScore: 92,
    hashtags: ['#gabon', '#mode', '#fashion', '#franceville', '#gabonaise', '#culture'],
    lastPostDate: '2024-01-13T14:20:00Z',
    contactInfo: {
      email: 'amina@modegabonaise.ga',
      website: 'https://modegabonaise.ga'
    }
  },
  {
    id: '4',
    name: 'Agence Immobilière Gabon Pro',
    bio: 'Agence immobilière gabonaise leader à Libreville. Nous vous accompagnons dans vos projets immobiliers : vente, location, achat de terrains. Expertise locale, service professionnel.',
    profileImage: 'https://via.placeholder.com/150x150/f59e0b/ffffff?text=AG',
    platform: 'facebook',
    profileUrl: 'https://facebook.com/gabonpro',
    activityDomain: 'immobilier',
    location: 'Libreville, Gabon',
    followers: 4200,
    verified: true,
    gabonScore: 85,
    hashtags: ['#gabon', '#immobilier', '#libreville', '#vente', '#location', '#gabonais'],
    lastPostDate: '2024-01-12T09:15:00Z',
    contactInfo: {
      phone: '+241 01 45 67 89',
      email: 'contact@gabonpro.ga',
      website: 'https://gabonpro.ga',
      address: 'Boulevard de l\'Indépendance, Libreville'
    }
  },
  {
    id: '5',
    name: 'Formation Gabon Excellence',
    bio: 'Centre de formation professionnelle gabonais. Nous formons les jeunes gabonais aux métiers du digital, de la comptabilité et de la gestion d\'entreprise. Construisons ensemble l\'avenir du Gabon !',
    profileImage: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=FG',
    platform: 'linkedin',
    profileUrl: 'https://linkedin.com/company/formation-gabon-excellence',
    activityDomain: 'formation',
    location: 'Libreville, Gabon',
    followers: 1500,
    verified: false,
    gabonScore: 90,
    hashtags: ['#gabon', '#formation', '#éducation', '#libreville', '#gabonais', '#excellence'],
    lastPostDate: '2024-01-11T16:30:00Z',
    contactInfo: {
      phone: '+241 01 67 89 01',
      email: 'info@formationgabon.ga',
      website: 'https://formationgabon.ga',
      address: 'Quartier Montagne Sainte, Libreville'
    }
  }
];

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
