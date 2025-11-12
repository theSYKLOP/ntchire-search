import prisma from '../utils/prisma';
import { readFileSync } from 'fs';
import path from 'path';
import { generateQuery, type GabonCompany } from '../utils/huggingface';
import { 
  getCachedSearch, 
  setCachedSearch, 
  cleanExpiredCache
} from '../utils/search-cache';
import { smartDatabaseSearch, findSimilarCachedQueries } from '../utils/smart-search';
import type { SearchOptions } from '../utils/types';
import { searchMockCompanies, MOCK_GABON_COMPANIES } from '../utils/mock-data';

// Utilisation des données mock importées
const mockGabonCompanies: GabonCompany[] = MOCK_GABON_COMPANIES as any[];

export default defineEventHandler(async (event) => {
  try {
    // Nettoyer les caches expirés en arrière-plan (non bloquant)
    cleanExpiredCache().catch(err => console.error('Erreur nettoyage cache:', err));

    // Lecture du fichier de config
    const configPath = path.resolve(process.cwd(), 'search.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    // Récupérer les paramètres de recherche
    const query = getQuery(event)?.q as string || '';
    
    // Créer les options de recherche pour le cache
    const searchOptions: SearchOptions = {
      query: query || config.prompt,
      hashtags: config.hashtags,
      networks: config.networks,
      lang: config.lang,
    };

    // 1️⃣ VÉRIFIER LE CACHE D'ABORD (avec normalisation IA)
    console.log(`🔍 Recherche: "${searchOptions.query}"`);
    
    const cachedResults = await getCachedSearch(searchOptions);
    
    if (cachedResults) {
      // Enregistrer quand même la recherche pour les statistiques
      const search = await prisma.search.create({
        data: {
          prompt: searchOptions.query,
          hashtags: config.hashtags,
          networks: config.networks,
          lang: config.lang,
          maxResults: config.maxResults,
        },
      });

      return {
        search,
        aiQuery: searchOptions.query,
        companies: cachedResults.companies,
        totalFound: cachedResults.totalFound,
        searchQuery: query,
        fromCache: true,
        cacheSource: cachedResults.source,
      };
    }

    // 1.5️⃣ SUGGÉRER DES REQUÊTES SIMILAIRES EN CACHE
    const similarQueries = await findSimilarCachedQueries(searchOptions.query);
    if (similarQueries.length > 0) {
      console.log(`💡 Suggestion: essayez "${similarQueries[0]}" (déjà en cache)`);
    }

    // 2️⃣ SI PAS EN CACHE, RECHERCHE INTELLIGENTE DANS LA BASE DE DONNÉES
    console.log('🧠 Recherche intelligente dans la base de données...');
    
    const smartResults = await smartDatabaseSearch(query || config.prompt, config.maxResults);

    // Si la recherche intelligente donne des résultats, les utiliser
    if (smartResults.length > 0) {
      console.log(`✅ ${smartResults.length} résultats trouvés avec la recherche intelligente`);
      
      // Enregistrer la recherche
      const search = await prisma.search.create({
        data: {
          prompt: query || config.prompt,
          hashtags: config.hashtags,
          networks: config.networks,
          lang: config.lang,
          maxResults: config.maxResults,
        },
      });

      // Transformer les données
      const companies = smartResults.map(company => ({
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
        lastPostDate: company.lastPostDate?.toISOString(),
        likeCount: 0,
        status: company.status
      }));

      // Mettre en cache
      await setCachedSearch(searchOptions, {
        companies,
        totalFound: companies.length,
        source: 'smart_database',
      });

      return {
        search,
        aiQuery: query || config.prompt,
        companies,
        totalFound: companies.length,
        searchQuery: query,
        fromCache: false,
        similarQueries,
      };
    }

    // 3️⃣ RECHERCHE CLASSIQUE SI LA RECHERCHE INTELLIGENTE N'A RIEN TROUVÉ
    console.log('📊 Recherche classique dans la base de données...');

    // Enregistrement d'une recherche avec la requête générée
    const search2 = await prisma.search.create({
      data: {
        prompt: query || config.prompt,
        hashtags: config.hashtags,
        networks: config.networks,
        lang: config.lang,
        maxResults: config.maxResults,
      },
    });

    // Construire la clause WHERE pour la recherche
    const whereClause = query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { bio: { contains: query, mode: 'insensitive' as const } },
        { activityDomain: { contains: query, mode: 'insensitive' as const } },
        { location: { contains: query, mode: 'insensitive' as const } },
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
      lastPostDate: company.lastPostDate?.toISOString(),
      likeCount: company.likes.length,
      status: company.status
    }));

    // 3️⃣ METTRE EN CACHE LES RÉSULTATS
    await setCachedSearch(searchOptions, {
      companies,
      totalFound: companies.length,
      source: 'database',
    });

    return {
      search: search2,
      aiQuery: query || config.prompt,
      companies,
      totalFound: companies.length,
      searchQuery: query,
      fromCache: false,
      similarQueries,
    };
  } catch (error: any) {
    console.error('Erreur dans l\'API de recherche:', error);
    // Récupérer le query de manière sûre
    const errorQuery = event.node?.req?.url?.includes('?q=') 
      ? decodeURIComponent(event.node.req.url.split('?q=')[1]?.split('&')[0] || '')
      : '';
    
    // Rendre la route résiliente: ne pas planter l'UI
    return {
      search: null,
      aiQuery: '',
      companies: [],
      totalFound: 0,
      searchQuery: errorQuery,
      error: 'db_error',
      message: error?.message || 'Erreur lors de la recherche d\'entreprises gabonaises'
    };
  }
});
