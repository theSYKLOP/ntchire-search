# ❌ PROBLÈME: API Facebook - "Permissions error"

## 🔍 Diagnostic

Votre token Facebook **n'a PAS** la permission de rechercher les pages publiques.

### Erreurs observées:
```
Erreur recherche "SANNA GABON": Permissions error
```

### Permissions actuelles (token expirant 10 Jan 2026):
```json
{
  "data": [
    {
      "permission": "public_profile",
      "status": "granted"
    },
    {
      "permission": "pages_show_list",
      "status": "granted"
    },
    {
      "permission": "pages_read_engagement",
      "status": "granted"  
    },
    {
      "permission": "pages_manage_metadata",
      "status": "granted"
    },
    {
      "permission": "business_management",
      "status": "granted"
    },
    {
      "permission": "pages_messaging",
      "status": "granted"
    }
  ]
}
```

## ⚠️ PROBLÈME IDENTIFIÉ

L'API Facebook Graph **a changé** et **ne permet PLUS** la recherche publique de pages via `/search?type=page`.

### Pourquoi ça ne fonctionne plus ?

Depuis **2018**, Facebook a **retiré** l'accès public à l'endpoint `/search` pour les pages :
- ❌ `/v23.0/search?q=SANNA&type=page` → **Permissions error**
- ❌ Même avec token valide et toutes les permissions → **Erreur**
- ❌ Même pour les pages publiques → **Bloqué**

**Source officielle**: https://developers.facebook.com/docs/graph-api/changelog/breaking-changes#search-4-4

## ✅ SOLUTIONS DISPONIBLES

### Solution 1: Utiliser l'API Pages (VOS pages uniquement)
```javascript
// ✅ Fonctionne: Récupérer VOS pages gérées
GET /me/accounts
```
**Limite**: Vous ne pouvez récupérer QUE les pages que vous gérez, PAS les pages d'autres entreprises.

### Solution 2: Utiliser Facebook Business Discovery ⭐ RECOMMANDÉ
Permet de récupérer des infos sur des pages publiques **SI vous connaissez leur ID ou username**.

```javascript
// ✅ Fonctionne: Récupérer une page spécifique
GET /{page-id}?fields=id,name,about,location,fan_count

// Exemple avec "Sanna Gabon" (si vous connaissez son ID)
GET /sannagabon?fields=id,name,about,location,fan_count
```

**Comment trouver l'ID/username ?**
1. Aller sur la page Facebook: https://www.facebook.com/sannagabon
2. L'username est dans l'URL: `sannagabon`
3. Ou utiliser: `https://findmyfbid.com/`

### Solution 3: Scraping (Attention aux ToS) ⚠️
Utiliser un service de scraping comme:
- Apify Facebook Pages Scraper
- Bright Data
- ScraperAPI

**Attention**: Violer les Terms of Service de Facebook peut entraîner un ban.

### Solution 4: Base de données de pages gabonaises 🎯 MEILLEURE SOLUTION
Créer votre propre base :
1. Répertorier manuellement les pages Facebook des entreprises gabonaises
2. Stocker leurs IDs dans votre DB
3. Utiliser l'API Business Discovery pour mettre à jour leurs infos

**Avantages**:
- ✅ Respecte les ToS Facebook
- ✅ Plus rapide (pas de recherche)
- ✅ Plus fiable (pas d'erreurs de permissions)

## 📝 RECOMMANDATION FINALE

**Pour votre application "Ntchire Search"**:

1. **Court terme**: 
   - Désactiver temporairement la recherche Facebook
   - Se concentrer sur Google Places (qui fonctionne parfaitement)
   
2. **Moyen terme**:
   - Créer une base de données de pages Facebook gabonaises
   - Ajouter un formulaire pour que les entreprises soumettent leur page
   
3. **Long terme**:
   - Utiliser l'API Business Discovery avec les IDs connus
   - Mettre à jour les infos périodiquement (cron job)

## 🔧 CODE À MODIFIER

### Désactiver la recherche Facebook temporairement:

```typescript
// Dans server/utils/facebook.ts
export async function searchPagesAdvanced(query: string, limit = 50): Promise<FacebookSearchResult> {
  // ❌ Ne fonctionne plus depuis 2018
  throw new FacebookApiError(
    "La recherche publique de pages Facebook n'est plus disponible via l'API Graph. " +
    "Utilisez l'API Business Discovery avec des IDs de pages connus.",
    403
  );
}
```

### Alternative avec Business Discovery:

```typescript
// Récupérer une page spécifique
export async function getPageById(pageIdOrUsername: string) {
  const fields = ['id', 'name', 'about', 'location', 'fan_count', 'website'].join(',');
  const url = `${FB_GRAPH_URL}/${pageIdOrUsername}`;
  const params = { fields, access_token: FB_ACCESS_TOKEN };
  
  const { data } = await axios.get(url, { params });
  return data;
}
```

## 📚 RESSOURCES

- [Facebook Graph API Changelog](https://developers.facebook.com/docs/graph-api/changelog/breaking-changes)
- [Business Discovery API](https://developers.facebook.com/docs/instagram-api/guides/business-discovery)
- [Page Public Content Access](https://developers.facebook.com/docs/features-reference/page-public-content-access)

---

**Status**: ❌ API Search bloquée par Facebook  
**Solution**: ✅ Utiliser Business Discovery + DB de pages connues  
**Priorité**: 🔴 Critique - Affecte la fonctionnalité principale
