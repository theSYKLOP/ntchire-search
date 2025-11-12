/**
 * Exemple d'utilisation de l'API de suggestions de recherche
 * 
 * Pour tester :
 * 1. Démarrer le serveur : npm run dev
 * 2. Ouvrir un navigateur : http://localhost:3000
 * 3. Taper dans la barre de recherche pour voir les suggestions
 */

// Exemple de composant Vue pour les suggestions
export default {
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      isLoadingSuggestions: false,
    };
  },
  watch: {
    searchQuery(newQuery) {
      if (newQuery.length >= 2) {
        this.fetchSuggestions(newQuery);
      } else {
        this.suggestions = [];
      }
    },
  },
  methods: {
    async fetchSuggestions(query) {
      this.isLoadingSuggestions = true;
      
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();
        
        this.suggestions = data.suggestions || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des suggestions:', error);
        this.suggestions = [];
      } finally {
        this.isLoadingSuggestions = false;
      }
    },
    
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion;
      this.suggestions = [];
      // Lancer la recherche complète
      this.performSearch();
    },
    
    async performSearch() {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(this.searchQuery)}`
        );
        const data = await response.json();
        
        console.log('Résultats:', data);
        console.log('Depuis le cache ?', data.fromCache);
        
        // Afficher les résultats...
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    },
  },
};

// Template HTML correspondant
const template = `
<div class="search-container">
  <div class="search-input-wrapper">
    <input 
      v-model="searchQuery"
      type="text"
      placeholder="Rechercher des entreprises gabonaises..."
      class="search-input"
      @keyup.enter="performSearch"
    />
    
    <!-- Liste des suggestions -->
    <div v-if="suggestions.length > 0" class="suggestions-dropdown">
      <div 
        v-for="(suggestion, index) in suggestions" 
        :key="index"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </div>
    </div>
    
    <!-- Loader -->
    <div v-if="isLoadingSuggestions" class="suggestions-loader">
      Chargement des suggestions...
    </div>
  </div>
  
  <button @click="performSearch" class="search-button">
    Rechercher
  </button>
</div>
`;

// Exemple de requête fetch directe
async function exampleDirectFetch() {
  // 1. Obtenir des suggestions
  const suggestionsResponse = await fetch('/api/search/suggestions?q=restaurant');
  const suggestionsData = await suggestionsResponse.json();
  
  console.log('Suggestions:', suggestionsData.suggestions);
  // [
  //   "restaurants gabonais à Libreville",
  //   "meilleurs restaurants Port-Gentil",
  //   "restaurant traditionnel gabonais",
  //   ...
  // ]
  
  // 2. Faire une recherche
  const searchResponse = await fetch('/api/search?q=restaurant Libreville');
  const searchData = await searchResponse.json();
  
  console.log('Résultats:', searchData.companies);
  console.log('Total:', searchData.totalFound);
  console.log('Depuis le cache ?', searchData.fromCache);
  console.log('Source du cache:', searchData.cacheSource);
}

// Exemple avec axios
import axios from 'axios';

async function exampleWithAxios() {
  try {
    // Suggestions
    const { data: suggestions } = await axios.get('/api/search/suggestions', {
      params: { q: 'coiffure', limit: 5 }
    });
    
    console.log('Suggestions:', suggestions.suggestions);
    
    // Recherche
    const { data: results } = await axios.get('/api/search', {
      params: { q: 'coiffure Libreville' }
    });
    
    console.log('Entreprises trouvées:', results.companies);
    
    if (results.fromCache) {
      console.log('⚡ Résultats servis depuis le cache!');
      console.log('Source:', results.cacheSource);
    } else {
      console.log('🔍 Recherche effectuée en base de données');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Composable Nuxt 3
export function useSmartSearch() {
  const searchQuery = ref('');
  const suggestions = ref([]);
  const isLoadingSuggestions = ref(false);
  const searchResults = ref([]);
  const isLoadingResults = ref(false);
  const fromCache = ref(false);
  
  // Debounce pour éviter trop de requêtes
  let suggestionsTimeout;
  
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      suggestions.value = [];
      return;
    }
    
    clearTimeout(suggestionsTimeout);
    
    suggestionsTimeout = setTimeout(async () => {
      isLoadingSuggestions.value = true;
      
      try {
        const { data } = await useFetch('/api/search/suggestions', {
          params: { q: query, limit: 5 }
        });
        
        suggestions.value = data.value?.suggestions || [];
      } catch (error) {
        console.error('Erreur suggestions:', error);
        suggestions.value = [];
      } finally {
        isLoadingSuggestions.value = false;
      }
    }, 300); // Attendre 300ms après la dernière frappe
  };
  
  const performSearch = async (query) => {
    isLoadingResults.value = true;
    
    try {
      const { data } = await useFetch('/api/search', {
        params: { q: query }
      });
      
      searchResults.value = data.value?.companies || [];
      fromCache.value = data.value?.fromCache || false;
      
      if (fromCache.value) {
        console.log('⚡ Résultats du cache - temps de réponse optimal!');
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      searchResults.value = [];
    } finally {
      isLoadingResults.value = false;
    }
  };
  
  return {
    searchQuery,
    suggestions,
    isLoadingSuggestions,
    searchResults,
    isLoadingResults,
    fromCache,
    fetchSuggestions,
    performSearch,
  };
}
