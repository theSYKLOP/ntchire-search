# Guide de Configuration des Clés API

## 🚀 Configuration Rapide

### 1. Facebook API (Obligatoire)

#### Obtenir le token :
1. Aller sur [Facebook for Developers](https://developers.facebook.com/)
2. Créer une nouvelle app
3. Aller dans "Outils" → "Explorateur Graph API"
4. Sélectionner votre app
5. Cliquer "Générer un token d'accès"
6. Copier le token

#### Test du token :
```bash
curl "https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN"
```

### 2. Google Custom Search API (Obligatoire)

#### Obtenir la clé API :
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet
3. Activer "Custom Search JSON API"
4. Créer une clé API dans "Identifiants"

#### Créer le moteur de recherche :
1. Aller sur [Google Custom Search](https://cse.google.com/)
2. Cliquer "Ajouter"
3. Sites à rechercher :
   - `facebook.com`
   - `instagram.com`
   - `tiktok.com`
4. Copier l'ID du moteur

#### Test de l'API :
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_CX&q=test"
```

## 📝 Configuration du fichier .env

```env
# Facebook API
FB_ACCESS_TOKEN=your_facebook_token_here
FB_GRAPH_VERSION=v18.0

# Google Custom Search
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Optionnel (utilise des données mock)
INSTAGRAM_ACCESS_TOKEN=your_instagram_token_here
TIKTOK_ACCESS_TOKEN=your_tiktok_token_here
```

## 🧪 Test de la configuration

```bash
# Vérifier les clés
node scripts/check-api-keys.js

# Tester l'API
npm run dev
curl "http://localhost:3000/api/search/facebook?q=restaurant&limit=5"
```

## 🔒 Sécurité

- Ne jamais commiter le fichier `.env`
- Utiliser des tokens avec permissions minimales
- Régénérer les tokens régulièrement
- Surveiller l'utilisation des quotas

## 📊 Limites et Coûts

### Facebook API
- Gratuit pour les pages publiques
- Limite de 200 requêtes/heure par défaut

### Google Custom Search
- 100 requêtes/jour gratuit
- 10 000 requêtes/jour avec facturation
- Coût : ~$5 pour 1000 requêtes

### Instagram/TikTok
- Gratuit avec données mock
- APIs réelles nécessitent approbation

## 🆘 Dépannage

### Erreur "Token invalide"
- Vérifier que le token est correct
- Vérifier les permissions
- Régénérer le token

### Erreur "Quota dépassé"
- Attendre la réinitialisation
- Vérifier l'utilisation dans les consoles
- Considérer l'upgrade du plan

### Aucun résultat
- Vérifier la configuration des moteurs de recherche
- Tester avec des requêtes simples
- Vérifier les logs du serveur
