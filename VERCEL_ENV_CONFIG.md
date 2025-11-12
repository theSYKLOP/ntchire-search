# Configuration Variables d'Environnement Vercel

## 📋 Instructions

Allez sur votre dashboard Vercel → Projet ntchire-search → Settings → Environment Variables

Ajoutez les variables suivantes :

## 🔐 Variables Requises

### Base de données
```
DATABASE_URL
<Copiez la valeur depuis votre fichier .env local>
```

### Intelligence Artificielle
```
HF_API_TOKEN
<Votre token Hugging Face depuis .env>

USE_AI_NORMALIZATION
true
```

### Facebook API
```
FB_ACCESS_TOKEN
<Votre token Facebook depuis .env>

FB_GRAPH_VERSION
v23.0
```

### Google API
```
GOOGLE_API_KEY
<Votre clé API Google depuis .env>

GOOGLE_SEARCH_ENGINE_ID
<Votre ID de moteur de recherche depuis .env>
```

### APIs Optionnelles (désactivées)
```
USE_INSTAGRAM_API
false

USE_TIKTOK_API
false
```

## ✅ Après Configuration

1. Allez dans l'onglet "Deployments"
2. Cliquez sur les trois points du dernier déploiement
3. Sélectionnez "Redeploy"
4. Cochez "Use existing Build Cache" pour plus rapidité
5. Cliquez sur "Redeploy"

## 🔧 Corrections Appliquées

### Problème Résolu
❌ **Erreur**: `SyntaxError: Named export 'PrismaClient' not found. The requested module '@prisma/client' is a CommonJS module`

### Solutions Implémentées

1. **nuxt.config.ts**
   - Ajout de `@prisma/client` dans `build.transpile`
   - Configuration Nitro avec preset `vercel`
   - External rollup pour `@prisma/client` et `.prisma/client`

2. **package.json**
   - Script `vercel-build` avec `prisma generate`
   - Script `build` avec `prisma generate`
   - Script `postinstall` avec `prisma generate`

3. **prisma/schema.prisma**
   - Binary target `rhel-openssl-3.0.x` pour Vercel
   - Output path explicite vers `node_modules/.prisma/client`

4. **vercel.json**
   - Build command personnalisé
   - Variables d'environnement mappées
   - Target binary Prisma pour Vercel

5. **.vercelignore**
   - Exclusion des fichiers inutiles
   - Inclusion de Prisma pour la génération

## 🚀 Prochaines Étapes

Après le redéploiement, l'application devrait fonctionner correctement sur Vercel avec :
- ✅ Prisma Client généré avec le bon binary target
- ✅ Connexion à la base de données Neon PostgreSQL
- ✅ API Facebook/Google fonctionnelles
- ✅ IA de normalisation activée
- ✅ Cache de recherche opérationnel

## 📊 Vérification

Testez l'URL de production :
```
https://ntchire-search.vercel.app/api/search?q=SANNA+GABON
```

Si tout fonctionne, vous devriez recevoir des résultats de recherche.
