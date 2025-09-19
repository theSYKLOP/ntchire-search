import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';
import { generateQuery, type GabonCompany } from '../utils/huggingface';

const prisma = new PrismaClient();

// Données mockées d'entreprises gabonaises pour la démonstration
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
    // Lecture du fichier de config
    const configPath = path.resolve(process.cwd(), 'search.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    // Générer une requête intelligente avec l'IA HuggingFace
    const aiQuery = await generateQuery(config.prompt, config.hashtags, config.lang);

    // Enregistrement d'une recherche avec la requête générée
    const search = await prisma.search.create({
      data: {
        prompt: aiQuery || config.prompt,
        hashtags: config.hashtags,
        networks: config.networks,
        lang: config.lang,
        maxResults: config.maxResults,
      },
    });

    // Récupérer les entreprises depuis la base de données
    const query = getQuery(event)?.q as string || '';
    
    const whereClause = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { activityDomain: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
        // Les tableaux de chaînes (hashtags) ne supportent pas mode: 'insensitive' ni le fuzzy.
        // On couvre les cas avec/sans dièse.
        { hashtags: { hasSome: [query, `#${query}`] } }
      ]
    } : {};

    const dbCompanies = await prisma.gabonCompany.findMany({
      where: whereClause,
      include: {
        likes: {
          where: { isLike: true },
          select: { id: true }
        }
      },
      orderBy: [
        { gabonScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: config.maxResults
    });

    // Transformer les données pour l'interface
    const companies = dbCompanies.map(company => ({
      id: company.id,
      name: company.name,
      bio: company.bio,
      profileImage: company.profileImage,
      platform: company.platform,
      profileUrl: company.profileUrl,
      activityDomain: company.activityDomain,
      location: company.location,
      followers: company.followers,
      verified: company.verified,
      gabonScore: company.gabonScore,
      hashtags: company.hashtags,
      lastPostDate: company.lastPostDate.toISOString(),
      contactInfo: company.contactInfo,
      likeCount: company.likes.length,
      status: company.status
    }));

    return {
      search,
      aiQuery,
      companies,
      totalFound: companies.length,
      searchQuery: query
    };
  } catch (error: any) {
    console.error('Erreur dans l\'API de recherche:', error);
    // Rendre la route résiliente: ne pas planter l'UI
    return {
      search: null,
      aiQuery: '',
      companies: [],
      totalFound: 0,
      searchQuery: getQuery(event)?.q || '',
      error: 'db_error',
      message: error?.message || 'Erreur lors de la recherche d\'entreprises gabonaises'
    };
  }
});
