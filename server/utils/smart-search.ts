import prisma from '../utils/prisma';
const HF_API_TOKEN = process.env.HF_API_TOKEN;

/**
 * Extrait les mots-clés importants d'une recherche en utilisant l'IA
 */
async function extractSearchKeywords(query: string): Promise<string[]> {
  if (!HF_API_TOKEN) {
    return basicExtractKeywords(query);
  }

  try {
    const prompt = `Extrais les mots-clés principaux de cette recherche (type d'activité et localisation uniquement).
Exemples:
- "restaurant à lalala" → ["restaurant", "lalala"]
- "cherche coiffeur libreville" → ["coiffeur", "libreville"]
- "salon de beauté owendo" → ["beauté", "owendo"]

Recherche: "${query}"
Mots-clés (séparés par des virgules):`;

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
      return basicExtractKeywords(query);
    }

    const data = await response.json();
    const keywords = data[0]?.generated_text
      ?.trim()
      .split(',')
      .map((k: string) => k.trim().replace(/["'\[\]]/g, ''))
      .filter((k: string) => k.length > 2);

    console.log(`🔍 Mots-clés extraits: ${keywords?.join(', ')}`);
    return keywords || basicExtractKeywords(query);
  } catch (error) {
    console.error('❌ Erreur extraction mots-clés:', error);
    return basicExtractKeywords(query);
  }
}

/**
 * Extraction basique des mots-clés (fallback)
 */
function basicExtractKeywords(query: string): string[] {
  // Mots à ignorer
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
    'en', 'pour', 'dans', 'sur', 'avec', 'sans', 'par', 'chez', 'près',
    'cherche', 'trouve', 'trouver', 'recherche'
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Recherche intelligente dans la base de données avec correspondances sémantiques
 */
export async function smartDatabaseSearch(query: string, limit: number = 30) {
  try {
    console.log(`🧠 Recherche intelligente pour: "${query}"`);
    
    // 1. Extraire les mots-clés avec l'IA
    const keywords = await extractSearchKeywords(query);
    console.log(`📝 Mots-clés: ${keywords.join(', ')}`);

    if (keywords.length === 0) {
      return [];
    }

    // 2. Construire une requête SQL flexible qui cherche dans plusieurs champs
    const companies = await prisma.gabonCompany.findMany({
      where: {
        OR: keywords.flatMap(keyword => [
          // Recherche dans le nom
          {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          // Recherche dans la description
          {
            description: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          // Recherche dans l'adresse
          {
            location: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          // Recherche dans le domaine d'activité
          {
            activityDomain: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          // Recherche dans les hashtags
          {
            hashtags: {
              has: keyword,
            },
          },
        ]),
      },
      take: limit,
      orderBy: [
        { followers: 'desc' },
        { gabonScore: 'desc' },
      ],
    });

    console.log(`✅ ${companies.length} résultats trouvés dans la base de données`);
    return companies;
  } catch (error) {
    console.error('❌ Erreur recherche intelligente:', error);
    return [];
  }
}

/**
 * Trouve les requêtes similaires dans le cache
 */
export async function findSimilarCachedQueries(query: string): Promise<string[]> {
  try {
    const keywords = await extractSearchKeywords(query);
    
    if (keywords.length === 0) {
      return [];
    }

    // Chercher dans le cache des requêtes contenant au moins 1 mot-clé
    const caches = await prisma.searchCache.findMany({
      where: {
        OR: keywords.map(keyword => ({
          query: {
            contains: keyword,
            mode: 'insensitive',
          },
        })),
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        query: true,
        hitCount: true,
      },
      orderBy: {
        hitCount: 'desc',
      },
      take: 5,
    });

    const similarQueries = caches.map(c => c.query);
    
    if (similarQueries.length > 0) {
      console.log(`💡 Requêtes similaires trouvées: ${similarQueries.join(', ')}`);
    }

    return similarQueries;
  } catch (error) {
    console.error('❌ Erreur recherche requêtes similaires:', error);
    return [];
  }
}
