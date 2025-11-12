import prisma from './prisma';
import crypto from 'crypto';
import type { SearchOptions, SearchResults } from './types';

// Durée de validité du cache en heures (7 jours = 168 heures)
const CACHE_DURATION_HOURS = 168;

// Configuration de l'IA pour normalisation
const USE_AI_NORMALIZATION = process.env.USE_AI_NORMALIZATION !== 'false';
const HF_API_TOKEN = process.env.HF_API_TOKEN;

/**
 * Normalise une requête en utilisant l'IA pour détecter les variantes sémantiques
 * Exemples: "restaurant lalala" = "restaurant à lalala" = "resto lalala"
 */
async function normalizeQueryWithAI(query: string): Promise<string> {
  if (!USE_AI_NORMALIZATION || !HF_API_TOKEN) {
    return basicNormalizeQuery(query);
  }

  try {
    const prompt = `Normalise cette recherche en français du Gabon en retirant les mots inutiles et en gardant seulement le type d'activité et la localisation.
Exemples:
- "restaurant à lalala" → "restaurant lalala"
- "cherche resto à libreville" → "restaurant libreville"
- "coiffeur près de glass" → "coiffeur glass"
- "salon de coiffure owendo" → "coiffeur owendo"

Recherche: "${query}"
Normalisé:`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.3,
            top_p: 0.9,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('⚠️ IA normalisation échouée, utilisation normalisation basique');
      return basicNormalizeQuery(query);
    }

    const data = await response.json();
    const normalized = data[0]?.generated_text?.trim() || query;
    
    // Nettoyer le résultat (enlever guillemets, points, etc.)
    const cleaned = normalized
      .replace(/["'`]/g, '')
      .replace(/\.$/, '')
      .toLowerCase()
      .trim();

    console.log(`🤖 IA normalisation: "${query}" → "${cleaned}"`);
    return cleaned;
  } catch (error) {
    console.error('❌ Erreur IA normalisation:', error);
    return basicNormalizeQuery(query);
  }
}

/**
 * Normalisation basique sans IA (fallback)
 */
function basicNormalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    // Retirer les prépositions et articles
    .replace(/\b(le|la|les|un|une|des|du|de|à|au|aux|en|près|dans)\b/gi, ' ')
    // Normaliser les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Génère un hash unique pour une recherche en utilisant la normalisation IA
 */
export async function generateQueryHash(options: SearchOptions): Promise<string> {
  const normalizedQuery = await normalizeQueryWithAI(options.query);
  const normalizedHashtags = (options.hashtags || [])
    .map(h => h.toLowerCase().trim())
    .sort();
  const normalizedNetworks = (options.networks || [])
    .map(n => n.toLowerCase().trim())
    .sort();
  const normalizedLang = (options.lang || 'fr').toLowerCase();

  const dataToHash = JSON.stringify({
    query: normalizedQuery,
    hashtags: normalizedHashtags,
    networks: normalizedNetworks,
    lang: normalizedLang,
  });

  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

/**
 * Récupère les résultats depuis le cache
 */
export async function getCachedSearch(options: SearchOptions): Promise<SearchResults | null> {
  const queryHash = await generateQueryHash(options);

  try {
    const cached = await prisma.searchCache.findUnique({
      where: { queryHash },
    });

    // Vérifier si le cache existe et n'est pas expiré
    if (!cached || new Date() > cached.expiresAt) {
      // Nettoyer le cache expiré si nécessaire
      if (cached) {
        await prisma.searchCache.delete({ where: { id: cached.id } });
      }
      return null;
    }

    // Mettre à jour les statistiques d'utilisation
    await prisma.searchCache.update({
      where: { id: cached.id },
      data: {
        hitCount: cached.hitCount + 1,
        lastAccessed: new Date(),
      },
    });

    console.log(`✅ Cache hit pour la recherche: "${options.query}" → requête normalisée trouvée (${cached.hitCount + 1} utilisations)`);

    return {
      companies: cached.results as any[],
      totalFound: cached.totalFound,
      source: `cache (${cached.source})`,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
}

/**
 * Sauvegarde les résultats dans le cache
 */
export async function setCachedSearch(
  options: SearchOptions,
  results: SearchResults
): Promise<void> {
  const queryHash = await generateQueryHash(options);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

  try {
    await prisma.searchCache.upsert({
      where: { queryHash },
      create: {
        queryHash,
        query: options.query,
        hashtags: options.hashtags || [],
        networks: options.networks || [],
        lang: options.lang || 'fr',
        results: results.companies,
        totalFound: results.totalFound,
        expiresAt,
        source: results.source,
        hitCount: 0,
      },
      update: {
        results: results.companies,
        totalFound: results.totalFound,
        expiresAt,
        source: results.source,
        updatedAt: new Date(),
      },
    });

    console.log(`💾 Résultats mis en cache pour: "${options.query}" (expire dans ${CACHE_DURATION_HOURS}h)`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du cache:', error);
  }
}

/**
 * Nettoie les caches expirés
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const result = await prisma.searchCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      console.log(`🧹 ${result.count} caches expirés nettoyés`);
    }

    return result.count;
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache:', error);
    return 0;
  }
}

/**
 * Obtient les statistiques du cache
 */
export async function getCacheStats() {
  try {
    const totalCaches = await prisma.searchCache.count();
    const expiredCaches = await prisma.searchCache.count({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const topQueries = await prisma.searchCache.findMany({
      orderBy: {
        hitCount: 'desc',
      },
      take: 10,
      select: {
        query: true,
        hitCount: true,
        lastAccessed: true,
        source: true,
      },
    });

    return {
      totalCaches,
      activeCaches: totalCaches - expiredCaches,
      expiredCaches,
      topQueries,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
}

/**
 * Invalide le cache pour une recherche spécifique
 */
export async function invalidateCache(options: SearchOptions): Promise<boolean> {
  const queryHash = await generateQueryHash(options);

  try {
    await prisma.searchCache.delete({
      where: { queryHash },
    });

    console.log(`🗑️ Cache invalidé pour: "${options.query}"`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'invalidation du cache:', error);
    return false;
  }
}

/**
 * Vide tout le cache
 */
export async function clearAllCache(): Promise<number> {
  try {
    const result = await prisma.searchCache.deleteMany({});
    console.log(`🗑️ Tout le cache vidé (${result.count} entrées)`);
    return result.count;
  } catch (error) {
    console.error('Erreur lors du vidage du cache:', error);
    return 0;
  }
}
