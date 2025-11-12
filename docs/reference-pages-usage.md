# 📋 Système de Pages de Référence Configurables

## Vue d'ensemble

Le système de pages de référence permet d'effectuer des recherches ciblées sur des pages ou profils spécifiques configurés dans l'application.

## Configuration des Pages

### Page actuelle configurée

- **Nery'w TV** (Facebook)
  - ID: `neryw-tv-facebook`
  - URL: `facebook.com/neryw.tv`
  - Description: Chaîne TV gabonaise - Actualités et divertissement

## Utilisation des APIs

### 1. Obtenir les pages de référence actives

```http
GET /api/reference-pages
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "neryw-tv-facebook",
      "name": "Nery'w TV",
      "platform": "facebook",
      "url": "facebook.com/neryw.tv",
      "description": "Chaîne TV gabonaise - Actualités et divertissement",
      "isActive": true
    }
  ],
  "count": 1
}
```

### 2. Rechercher dans les pages de référence

```http
GET /api/search/reference-pages?q=actualités&pageIds=neryw-tv-facebook&limit=10
```

**Paramètres:**
- `q`: Terme de recherche (obligatoire)
- `pageIds`: IDs des pages séparés par des virgules (optionnel, toutes les pages actives si omis)
- `limit`: Nombre maximum de résultats (défaut: 10)

**Réponse:**
```json
{
  "success": true,
  "companies": [
    {
      "name": "Nery'w TV",
      "bio": "Actualités gabonaises et divertissement...",
      "platform": "facebook",
      "profileUrl": "https://facebook.com/neryw.tv/posts/123",
      "gabonScore": 85,
      "referencePage": {
        "id": "neryw-tv-facebook",
        "name": "Nery'w TV",
        "platform": "facebook"
      }
    }
  ],
  "searchQuery": "actualités",
  "totalResults": 1,
  "sourceType": "reference-pages"
}
```

### 3. Ajouter/Modifier une page de référence

```http
POST /api/reference-pages
```

**Body:**
```json
{
  "id": "nouvelle-page-instagram",
  "name": "Nouvelle Page",
  "platform": "instagram",
  "url": "instagram.com/nouvelle.page",
  "description": "Description de la nouvelle page",
  "isActive": true
}
```

## Utilisation programmatique

### Dans le code serveur

```typescript
import { 
  searchInReferencePages, 
  getActiveReferencePages,
  updateReferencePage 
} from '~/server/utils/google'

// Recherche dans toutes les pages actives
const results = await searchInReferencePages('actualités')

// Recherche dans des pages spécifiques
const specificResults = await searchInReferencePages(
  'divertissement', 
  ['neryw-tv-facebook']
)

// Obtenir les pages actives
const activePages = getActiveReferencePages()

// Ajouter une nouvelle page
updateReferencePage({
  id: 'example-page',
  name: 'Exemple',
  platform: 'facebook',
  url: 'facebook.com/exemple',
  description: 'Page d\'exemple',
  isActive: true
})
```

### Intégration avec la recherche générale

```typescript
// Dans searchGabonCompanies, utiliser les pages de référence
const results = await searchGabonCompanies(
  'restaurant', 
  20, 
  true // useReferencePages = true
)
```

## Fonctionnalités

- ✅ **Recherche ciblée** dans des pages spécifiques
- ✅ **Configuration dynamique** des pages
- ✅ **Multi-plateformes** (Facebook, Instagram, TikTok, LinkedIn, Twitter)
- ✅ **Métadonnées enrichies** avec informations de la page source
- ✅ **Gestion d'erreurs** robuste
- ✅ **Déduplication** des résultats
- ✅ **API RESTful** complète

## Cas d'usage

1. **Veille médiatique** : Surveiller les mentions dans des médias gabonais
2. **Analyse concurrentielle** : Suivre l'activité de pages spécifiques
3. **Recherche thématique** : Trouver du contenu dans des sources fiables
4. **Curation de contenu** : Identifier du contenu pertinent depuis des sources connues
