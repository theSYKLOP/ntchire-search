<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl">
      <!-- Header -->
      <div class="text-center mb-12 sm:mb-16 lg:mb-20">
        <div class="flex justify-center mb-4 sm:mb-6">
          <img 
            src="/ntchire.png" 
            alt="Ntchiré - Moteur de recherche d'entreprises gabonaises" 
            class="h-24 sm:h-32 md:h-40 lg:h-48 w-auto object-contain"
          />
        </div>
       
      </div>

      <!-- Hero Gallery -->
      <HeroGallery />

      <!-- Search Bar -->
      <div class="max-w-6xl mx-auto mb-12 sm:mb-14 lg:mb-16">
        <div class="bg-white rounded-2xl sm:rounded-full shadow-2xl border border-gray-200 p-2">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div class="relative flex-1">
              <Search class="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <InputText
                v-model="searchQuery"
                placeholder="Rechercher une entreprise gabonaise..."
                class="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 bg-transparent border-0 focus:ring-0 text-gray-900 text-base sm:text-lg placeholder-gray-400 rounded-xl sm:rounded-full"
                @keyup.enter="searchCompanies"
              />
            </div>
            <Button
              @click="searchCompanies"
              :loading="isSearching"
              :disabled="!searchQuery.trim()"
              class="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 justify-center"
            >
              <span v-if="!isSearching">Recherche</span>
              <span v-else class="flex items-center">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                Recherche...
              </span>
            </Button>
          </div>
        </div>
        
        <!-- Suggestions populaires -->
        <div v-if="!hasSearched && !searchQuery.trim()" class="mt-4 sm:mt-6">
          <p class="text-center text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm px-4">Recherches populaires :</p>
          <div class="flex flex-wrap justify-center gap-2 px-4">
            <button
              v-for="suggestion in popularSuggestions"
              :key="suggestion.term"
              @click="applySuggestion(suggestion.term)"
              class="suggestion-bubble inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
            >
              <span class="text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded-full">{{ suggestion.count }}</span>
              {{ suggestion.term }}
            </button>
          </div>
        </div>
        
        <!-- Suggestions IA -->
        <div v-if="searchQuery.trim().length >= 2 && aiSuggestions.length > 0 && !hasSearched" class="mt-4 sm:mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mx-4 sm:mx-0">
          <div class="flex items-center gap-2 mb-3 sm:mb-4">
            <span class="text-purple-600">✨</span>
            <h3 class="text-sm font-semibold text-gray-800">Suggestions IA pour "{{ searchQuery }}"</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="(suggestion, index) in aiSuggestions"
              :key="index"
              @click="applySuggestion(suggestion)"
              class="text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200 text-xs sm:text-sm border border-purple-100 hover:border-purple-300 hover:shadow-md"
            >
              <span class="mr-2">💡</span>{{ suggestion }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Counter -->
      <div v-if="filteredCompanies.length > 0" class="text-center mb-8 sm:mb-10 lg:mb-12 px-4">
        <div class="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="w-3 h-3 bg-blue-500 rounded-full mr-3 sm:mr-4"></div>
          <p class="text-gray-800 text-sm sm:text-base font-semibold">
            {{ filteredCompanies.length }} entreprise{{ filteredCompanies.length > 1 ? 's' : '' }} gabonaise{{ filteredCompanies.length > 1 ? 's' : '' }}
            <span v-if="searchQuery" class="text-gray-500 font-normal">pour "{{ searchQuery }}"</span>
          </p>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="hasSearched && searchQuery" class="text-center py-12 sm:py-16 lg:py-20 px-4">
        <div class="max-w-md mx-auto">
          <div class="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <Search class="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" />
          </div>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Aucune entreprise trouvée</h3>
          <p class="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">Essayez avec un autre terme de recherche ou un domaine d'activité.</p>
          <Button 
            @click="clearSearch" 
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Nouvelle recherche
          </Button>
        </div>
      </div>

      <!-- Companies Grid - Design Moderne & Épuré -->
      <div v-if="filteredCompanies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
        <article
          v-for="company in filteredCompanies"
          :key="company.id"
          class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          @click="openCompanyProfile(company)"
        >
          <!-- En-tête compact -->
          <header class="p-4 pb-3 border-b border-gray-100">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100 platform-icon" 
                  :class="getPlatformIconClass(company.platform)"
                >
                  <font-awesome-icon 
                    :icon="getPlatformIcon(company.platform)" 
                    class="w-5 h-5 text-white"
                  />
                </div>
              <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-gray-900 text-sm truncate">{{ company.name }}</h3>
                    <div v-if="company.verified" class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 truncate">{{ company.location }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg flex-shrink-0">
                <Eye class="w-3 h-3" />
                <span class="font-medium">{{ formatNumber(company.followers) }}</span>
              </div>
            </div>
          </header>

          <!-- Contenu principal -->
          <main class="p-4 space-y-3">
            <!-- Description -->
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {{ company.bio }}
            </p>

            <!-- Métadonnées principales -->
          <div class="flex items-center justify-between">
              <span class="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                {{ company.activityDomain }}
              </span>
              <div class="flex items-center gap-2">
                <div class="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-blue-500 transition-all duration-500"
                    :style="{ width: company.gabonScore + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-semibold text-gray-700">{{ company.gabonScore }}%</span>
            </div>
          </div>

            <!-- Indicateurs de statut -->
          <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                  {{ company.likeCount || 0 }}
                </span>
                <span v-if="company.status === 'VERIFIED'" class="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                  Vérifiée
                </span>
              </div>
              <span v-if="(company.likeCount || 0) >= 10 && company.gabonScore >= 80" class="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md">
                Recommandée
              </span>
          </div>

            <!-- Hashtags (si présents) -->
            <div v-if="company.hashtags && company.hashtags.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="tag in company.hashtags.slice(0, 3)"
              :key="tag"
                class="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                {{ tag }}
              </span>
              <span
                v-if="company.hashtags.length > 3"
                class="inline-block text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-md"
              >
                +{{ company.hashtags.length - 3 }}
              </span>
            </div>
          </main>

          <!-- Actions (visibles au survol) -->
          <footer class="p-4 pt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div class="flex gap-2">
              <button
              @click.stop="openLikeModal(company, true)"
                class="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
            >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              Confirmer
              </button>
            
              <button
              @click.stop="openLikeModal(company, false)"
                class="flex items-center justify-center p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              </button>
            
              <button
              @click.stop="openCompanyProfile(company)"
                class="flex items-center justify-center p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
                <Eye class="w-4 h-4" />
              </button>
          </div>
          </footer>
        </article>
  </div>

      <!-- Default State -->
      <div v-if="!hasSearched" class="text-center py-16 sm:py-20 lg:py-24 px-4">
        <div class="max-w-2xl mx-auto">
          <div class="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl sm:rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 sm:mb-10">
            <Search class="w-10 sm:w-12 h-10 sm:h-12 text-blue-600" />
          </div>
          <h3 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Découvrez les entreprises gabonaises</h3>
          <p class="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed">
            Utilisez la barre de recherche pour trouver des entreprises gabonaises par nom, domaine d'activité ou localisation.
          </p>
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="applySuggestion(suggestion)"
              class="px-4 sm:px-6 py-2 sm:py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Like Modal -->
    <LikeModal
      :is-open="isLikeModalOpen"
      :company="selectedCompany"
      :is-like="isLikeAction"
      @close="closeLikeModal"
      @success="handleLikeSuccess"
    />

    <!-- Detail Modal -->
    <DetailModal
      :is-open="isDetailModalOpen"
      :company="selectedCompanyDetail"
      @close="closeDetailModal"
    />
  </div>
</template>

<script>
import { 
  Search, 
  Eye
} from 'lucide-vue-next'
import LikeModal from '~/components/LikeModal.vue'
import DetailModal from '~/components/DetailModal.vue'
import HeroGallery from '~/components/HeroGallery.vue'

export default {
  name: 'NtchireHomePage',
  components: {
    Search,
    Eye,
    LikeModal,
    DetailModal,
    HeroGallery
  },
  data() {
    return {
      // États principaux
      searchQuery: '',
      isSearching: false,
      hasSearched: false,
      aiQuery: '',
      
      // Suggestions IA
      aiSuggestions: [],
      loadingSuggestions: false,
      suggestionTimer: null,

// Like Modal State
      isLikeModalOpen: false,
      selectedCompany: null,
      isLikeAction: true,

// Detail Modal State
      isDetailModalOpen: false,
      selectedCompanyDetail: null,

// Suggestions de recherche pour les entreprises gabonaises
      searchSuggestions: [
  'technologie', 'restauration', 'mode', 'immobilier', 'formation', 'commerce', 'libreville', 'port-gentil'
      ],

// Suggestions populaires avec compteurs
      popularSuggestions: [
  { term: 'restaurant', count: 156 },
  { term: 'technologie', count: 89 },
  { term: 'mode', count: 72 },
  { term: 'commerce', count: 134 },
  { term: 'formation', count: 45 },
  { term: 'immobilier', count: 67 },
  { term: 'libreville', count: 203 },
  { term: 'port-gentil', count: 78 }
      ],

// Cache local pour optimiser les recherches
      searchCache: new Map(),
      CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

// Liste des entreprises gabonaises
      companies: []
    }
  },
  computed: {
    // Filtrage des entreprises selon la recherche
    // Après une recherche API, on retourne TOUS les résultats sans refiltrage
    // Car l'API a déjà fait le travail de filtrage
    filteredCompanies() {
      // Si on vient de faire une recherche, retourner tous les résultats de l'API
      return this.companies
    }
  },
  
  watch: {
    // Charger les suggestions IA quand l'utilisateur tape
    searchQuery(newQuery) {
      if (newQuery.trim().length >= 2 && !this.hasSearched) {
        this.loadAISuggestions(newQuery)
      } else {
        this.aiSuggestions = []
      }
    }
  },
  
  mounted() {
    // Vérification que l'application est bien initialisée
    if (import.meta.client) {
      console.log('Application initialisée côté client')
      // Charger les entreprises gabonaises au démarrage
      this.searchCompanies()
    }
  },
  methods: {
// Méthodes utilitaires
    formatNumber(n) {
      if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return n.toString()
    },

// Fonctions pour les icônes de plateformes
    getPlatformIcon(platform) {
      const iconMap = {
    facebook: ['fab', 'facebook'],
    instagram: ['fab', 'instagram'],
    tiktok: ['fab', 'tiktok'],
    twitter: ['fab', 'twitter'],
    linkedin: ['fab', 'linkedin'],
    google: ['fab', 'google']
  }
  return iconMap[platform] || ['fab', 'facebook']
    },

    getPlatformIconClass(platform) {
      const classMap = {
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    tiktok: 'bg-black',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
    google: 'bg-gradient-to-r from-blue-500 to-green-500'
  }
  return classMap[platform] || 'bg-gray-500'
    },

// Fonction pour ouvrir le profil de l'entreprise dans le modal détaillé
    openCompanyProfile(company) {
  console.log('🔍 Ouverture du modal pour:', company.name)
      this.selectedCompanyDetail = company
      this.isDetailModalOpen = true
    },

// Fonctions pour le modal de like
    openLikeModal(company, isLike) {
      this.selectedCompany = company
      this.isLikeAction = isLike
      this.isLikeModalOpen = true
    },

    closeLikeModal() {
      this.isLikeModalOpen = false
      this.selectedCompany = null
    },

// Fonctions pour le modal détaillé
    closeDetailModal() {
      this.isDetailModalOpen = false
      this.selectedCompanyDetail = null
    },

    handleLikeSuccess(data) {
  console.log('Like enregistré avec succès:', data)
  // Optionnel: recharger les données ou afficher une notification
      // this.searchCompanies()
    },

    clearSearch() {
      this.searchQuery = ''
      this.hasSearched = false
      this.aiQuery = ''
      this.aiSuggestions = []
    },
    
    // Charger les suggestions IA avec debounce
    async loadAISuggestions(query) {
      // Annuler le timer précédent
      if (this.suggestionTimer) {
        clearTimeout(this.suggestionTimer)
      }
      
      // Attendre 300ms avant de charger les suggestions
      this.suggestionTimer = setTimeout(async () => {
        if (!query || query.trim().length < 2) return
        
        this.loadingSuggestions = true
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`)
          if (response.ok) {
            const data = await response.json()
            this.aiSuggestions = data.suggestions || []
          }
        } catch (error) {
          console.warn('Erreur lors du chargement des suggestions:', error)
          this.aiSuggestions = []
        } finally {
          this.loadingSuggestions = false
        }
      }, 300) // Debounce de 300ms
    },

    applySuggestion(suggestion) {
      this.searchQuery = suggestion
      this.aiSuggestions = []
      this.searchCompanies()
    },

// Fonction pour vérifier le cache local
    getCachedResults(query) {
  const cacheKey = query.trim().toLowerCase()
      const cached = this.searchCache.get(cacheKey)
  
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
    console.log('💾 Résultats trouvés dans le cache pour:', query)
    return cached.companies
  }
  
  return null
    },

// Fonction pour sauvegarder dans le cache
    setCachedResults(query, companies) {
  const cacheKey = query.trim().toLowerCase()
      this.searchCache.set(cacheKey, {
    companies: [...companies],
    timestamp: Date.now()
  })
  console.log('💾 Résultats mis en cache pour:', query)
    },

    // Fonction de normalisation des données
    normalize(c) {
      const company = c
      return {
        id: company.id || company.profileUrl || crypto.randomUUID(),
        name: company.name || '',
        bio: company.bio || '',
        description: company.description || '',
        profileImage: company.profileImage || '',
        platform: company.platform || 'facebook',
        profileUrl: company.profileUrl || '',
        activityDomain: company.activityDomain || 'non spécifié',
        category: company.category || '',
        subcategory: company.subcategory || '',
        location: company.location || '',
        city: company.city || '',
        address: company.address || '',
        followers: Number(company.followers || 0),
        verified: Boolean(company.verified || false),
        gabonScore: Number(company.gabonScore || 0),
        hashtags: Array.isArray(company.hashtags) ? company.hashtags : [],
        lastPostDate: company.lastPostDate || '',
        likeCount: company.likeCount,
        status: company.status,
        
        // Informations de contact enrichies
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        whatsapp: company.whatsapp || '',
        
        // Horaires d'ouverture
        openingHours: company.openingHours,
        
        // Réseaux sociaux supplémentaires
        facebookUrl: company.facebookUrl || '',
        instagramUrl: company.instagramUrl || '',
        tiktokUrl: company.tiktokUrl || '',
        linkedinUrl: company.linkedinUrl || '',
        twitterUrl: company.twitterUrl || '',
        youtubeUrl: company.youtubeUrl || '',
        
        // Informations métier
        services: Array.isArray(company.services) ? company.services : [],
        yearFounded: Number(company.yearFounded) || undefined,
        employeeCount: company.employeeCount || '',
        
        // Géolocalisation
        latitude: Number(company.latitude) || undefined,
        longitude: Number(company.longitude) || undefined,
        
        // Informations supplémentaires extraites par IA
        reviewCount: Number(company.reviewCount) || undefined,
        averageRating: Number(company.averageRating) || undefined,
        priceRange: company.priceRange || '',
        
        // Métadonnées d'extraction
        lastScraped: company.lastScraped || '',
        dataSource: company.dataSource || '',
        dataQuality: Number(company.dataQuality) || 0
      }
    },

    // Recherche d'entreprises gabonaises optimisée
    async searchCompanies() {
      const query = this.searchQuery.trim()
      console.log('🔍 Début de la recherche:', query)
      this.isSearching = true
      this.hasSearched = true
      this.aiQuery = ''
      
      try {
        // Vérifier d'abord le cache local
        const cachedResults = this.getCachedResults(query)
        if (cachedResults) {
          this.companies = cachedResults
          console.log('✅ Résultats chargés depuis le cache:', cachedResults.length)
          return
        }

        // 1) DB locale (entreprises déjà ingérées)
        const dbUrl = query 
          ? `/api/search?q=${encodeURIComponent(query)}`
          : '/api/search'

        console.log('📊 Appel API DB:', dbUrl)
        const dbRes = await fetch(dbUrl)
        const dbData = dbRes.ok ? await dbRes.json() : { companies: [] }
        this.aiQuery = dbData.aiQuery || ''
        console.log('📊 Résultats DB:', dbData.companies?.length || 0)

    // Si on a suffisamment de résultats en DB (>= 30), pas besoin d'appeler les APIs externes
    if (dbData.companies && dbData.companies.length >= 30) {
      console.log('✅ Suffisamment de résultats en DB, pas d\'appel API externe nécessaire')
          const normalizedCompanies = dbData.companies.map(this.normalize)
          this.companies = normalizedCompanies
          this.setCachedResults(query, normalizedCompanies)
      return
    }

    // 2) Recherche live Facebook (avec upsert pour enrichir la base) - Augmenté à 25
    const fbUrl = `/api/search/facebook?q=${encodeURIComponent(query || '')}&limit=25&upsert=true`
    console.log('📘 Appel API Facebook:', fbUrl)
    const fbRes = await fetch(fbUrl)
    const fbData = fbRes.ok ? await fbRes.json() : { companies: [] }
    console.log('📘 Résultats Facebook:', fbData.companies?.length || 0)

    // 3) Recherche Google Places (avec upsert pour enrichir la base) - Augmenté à 40
    const googleUrl = `/api/search/google-places?q=${encodeURIComponent(query || '')}&limit=40&upsert=true`
    console.log('🏢 Appel API Google Places:', googleUrl)
    const googleRes = await fetch(googleUrl)
    const googleData = googleRes.ok ? await googleRes.json() : { companies: [] }
    console.log('🏢 Résultats Google Places:', googleData.companies?.length || 0)

    // 5) Fusionner les résultats (unicité par profileUrl)
        const byProfileUrl = new Map()

        ;(dbData.companies || []).forEach((c) => {
          const nc = this.normalize(c)
      byProfileUrl.set(nc.profileUrl || nc.id, nc)
    })
        ;(fbData.companies || []).forEach((c) => {
          const nc = this.normalize(c)
      const key = nc.profileUrl || nc.id
      if (!byProfileUrl.has(key)) byProfileUrl.set(key, nc)
    })
        ;(googleData.companies || []).forEach((c) => {
          const nc = this.normalize(c)
      const key = nc.profileUrl || nc.id
      if (!byProfileUrl.has(key)) byProfileUrl.set(key, nc)
    })

    const finalResults = Array.from(byProfileUrl.values())
        this.companies = finalResults
    
    // Mettre en cache les résultats
        this.setCachedResults(query, finalResults)
    
    console.log('✅ Total entreprises trouvées:', finalResults.length)
  } catch (e) {
    console.error('❌ Erreur lors de la recherche d\'entreprises:', e)
  } finally {
        this.isSearching = false
      }
    }
  }
}
</script>

<style scoped>
/* Text truncation utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions for interactive elements */
button, .transition-colors, .transition-shadow, .transition-all {
  transition-property: color, background-color, border-color, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects for cards */
.group:hover {
  transform: translateY(-1px);
}

/* Card interactions optimisées */
.group article {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover article {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Espacement responsive optimisé */
@media (min-width: 768px) {
  .grid {
    gap: 1rem;
  }
}

@media (min-width: 1280px) {
  .grid {
    gap: 1.25rem;
  }
}

/* Animation des badges et indicateurs */
.inline-flex {
  transition: all 0.2s ease;
}

.inline-flex:hover {
  transform: scale(1.02);
}

/* Styles pour les icônes de plateformes */
.platform-icon {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.platform-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Couleurs spécifiques aux plateformes */
.bg-gradient-to-r {
  background-size: 200% 200%;
}

/* Gradient text animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Styles pour les suggestions populaires */
.suggestion-bubble {
  transform: scale(1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-bubble:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.suggestion-bubble:active {
  transform: scale(0.98);
}
</style>
