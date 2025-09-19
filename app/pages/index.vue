<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-16 max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-sm border mb-6">
          <Search class="w-8 h-8 text-gray-700" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Ntchiré
        </h1>
        <p class="text-lg text-gray-600 max-w-xl mx-auto">
          Découvrez et connectez-vous avec les entreprises gabonaises sur les réseaux sociaux
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-12">
        <div class="bg-white rounded-xl shadow-sm border p-1">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <InputText
                v-model="searchQuery"
                placeholder="Rechercher une entreprise gabonaise..."
                class="w-full pl-12 pr-4 py-3 bg-transparent border-0 focus:ring-0 text-gray-900"
                @keyup.enter="searchCompanies"
              />
            </div>
            <Button
              @click="searchCompanies"
              :loading="isSearching"
              :disabled="!searchQuery.trim()"
              class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              <span v-if="!isSearching">Rechercher</span>
              <span v-else class="flex items-center">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Recherche...
              </span>
            </Button>
          </div>
        </div>
        <div v-if="aiQuery" class="my-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900 text-center">
          <div class="font-semibold mb-2">Requête IA générée :</div>
          <div class="text-sm break-words">{{ aiQuery }}</div>
        </div>
      </div>

      <!-- Results Counter -->
      <div v-if="filteredCompanies.length > 0" class="text-center mb-8">
        <div class="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border">
          <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
          <p class="text-gray-700 text-sm font-medium">
            {{ filteredCompanies.length }} entreprise{{ filteredCompanies.length > 1 ? 's' : '' }} gabonaise{{ filteredCompanies.length > 1 ? 's' : '' }}
            <span v-if="searchQuery" class="text-gray-500">pour "{{ searchQuery }}"</span>
          </p>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="hasSearched && searchQuery" class="text-center py-16">
        <div class="max-w-sm mx-auto">
          <div class="w-16 h-16 bg-white rounded-xl shadow-sm border flex items-center justify-center mx-auto mb-6">
            <Search class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune entreprise trouvée</h3>
          <p class="text-gray-600 mb-6">Essayez avec un autre terme de recherche ou un domaine d'activité.</p>
          <Button 
            @click="clearSearch" 
            class="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg"
          >
            Nouvelle recherche
          </Button>
        </div>
      </div>

      <!-- Companies Grid -->
      <div v-if="filteredCompanies.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card
          v-for="company in filteredCompanies"
          :key="company.id"
          class="bg-white shadow-sm border hover:shadow-md transition-shadow rounded-xl overflow-hidden cursor-pointer"
          @click="openCompanyProfile(company)"
        >
          <template #header>
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <img 
                    :src="company.profileImage" 
                    :alt="company.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <div class="flex items-center space-x-2">
                      <h3 class="font-semibold text-gray-900">{{ company.name }}</h3>
                      <div v-if="company.verified" class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm text-gray-500">{{ company.location }}</div>
                  </div>
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <Eye class="w-4 h-4 mr-1" />
                  {{ formatNumber(company.followers) }}
                </div>
              </div>
            </div>
          </template>

          <template #content>
            <div class="p-6 space-y-4">
              <!-- Company Bio -->
              <div>
                <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {{ company.bio }}
                </p>
              </div>

              <!-- Activity Domain & Score -->
              <div class="flex items-center justify-between">
                <Tag
                  :value="company.activityDomain"
                  class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                />
                <div class="flex items-center space-x-2">
                  <div class="text-xs text-gray-500">Score Gabon</div>
                  <div class="flex items-center space-x-1">
                    <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-green-500 transition-all duration-300"
                        :style="{ width: company.gabonScore + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs font-medium text-gray-700">{{ company.gabonScore }}%</span>
                  </div>
                </div>
              </div>

              <!-- Like Count & Status -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-1 text-green-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium">{{ company.likeCount || 0 }}</span>
                  </div>
                  <div v-if="company.status === 'VERIFIED'" class="flex items-center space-x-1 text-green-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-xs font-medium">Vérifiée</span>
                  </div>
                </div>
                <div v-if="(company.likeCount || 0) >= 10 && company.gabonScore >= 80" class="text-xs text-green-600 font-medium">
                  Prête à être validée
                </div>
              </div>

              <!-- Hashtags -->
              <div v-if="company.hashtags && company.hashtags.length > 0" class="flex flex-wrap gap-2">
                <Tag
                  v-for="tag in company.hashtags.slice(0, 3)"
                  :key="tag"
                  :value="tag"
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                />
                <Tag
                  v-if="company.hashtags.length > 3"
                  :value="`+${company.hashtags.length - 3}`"
                  class="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs"
                />
              </div>

              <!-- Contact Info -->
              <div v-if="company.contactInfo" class="py-3 border-t border-gray-100">
                <div class="space-y-2">
                  <div v-if="company.contactInfo.phone" class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ company.contactInfo.phone }}
                  </div>
                  <div v-if="company.contactInfo.email" class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ company.contactInfo.email }}
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-3">
                <Button
                  @click.stop="openLikeModal(company, true)"
                  class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                  Confirmer
                </Button>
                
                <Button
                  @click.stop="openLikeModal(company, false)"
                  class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  Signaler
                </Button>
                
                <Button
                  @click.stop="openCompanyProfile(company)"
                  class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <Eye class="w-4 h-4 mr-2" />
                  Voir
                </Button>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Default State -->
      <div v-if="!hasSearched" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <div class="w-20 h-20 bg-white rounded-xl shadow-sm border flex items-center justify-center mx-auto mb-8">
            <Search class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-2xl font-semibold text-gray-900 mb-4">Découvrez les entreprises gabonaises</h3>
          <p class="text-gray-600 mb-8 leading-relaxed">
            Utilisez la barre de recherche pour trouver des entreprises gabonaises par nom, domaine d'activité ou localisation.
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="applySuggestion(suggestion)"
              class="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
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
  </div>
</template>

<script setup lang="ts">
import { 
  Search, 
  Eye
} from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import LikeModal from '~/components/LikeModal.vue'

// Types
interface GabonCompany {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  profileUrl: string;
  activityDomain: string;
  location: string;
  followers: number;
  verified: boolean;
  gabonScore: number;
  hashtags: string[];
  lastPostDate: string;
  likeCount?: number;
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
}

// Etat
const searchQuery = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)
const aiQuery = ref('')

// Like Modal State
const isLikeModalOpen = ref(false)
const selectedCompany = ref<GabonCompany | null>(null)
const isLikeAction = ref(true)

// Suggestions de recherche pour les entreprises gabonaises
const searchSuggestions = [
  'technologie', 'restauration', 'mode', 'immobilier', 'formation', 'commerce', 'libreville', 'port-gentil'
]

// Liste des entreprises gabonaises
const companies = ref<GabonCompany[]>([])

// Filtrage des entreprises selon la recherche
const filteredCompanies = computed(() => {
  if (!searchQuery.value.trim()) return companies.value
  const query = searchQuery.value.trim().toLowerCase()
  return companies.value.filter(company =>
    company.name.toLowerCase().includes(query) ||
    company.bio.toLowerCase().includes(query) ||
    company.activityDomain.toLowerCase().includes(query) ||
    company.location.toLowerCase().includes(query) ||
    company.hashtags.some(tag => tag.toLowerCase().includes(query))
  )
})

// Méthodes utilitaires

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return n.toString()
}

// Fonction pour ouvrir le profil de l'entreprise
function openCompanyProfile(company: GabonCompany) {
  window.open(company.profileUrl, '_blank')
}

// Fonctions pour le modal de like
function openLikeModal(company: GabonCompany, isLike: boolean) {
  selectedCompany.value = company
  isLikeAction.value = isLike
  isLikeModalOpen.value = true
}

function closeLikeModal() {
  isLikeModalOpen.value = false
  selectedCompany.value = null
}

function handleLikeSuccess(data: unknown) {
  console.log('Like enregistré avec succès:', data)
  // Optionnel: recharger les données ou afficher une notification
  // searchCompanies()
}

function clearSearch() {
  searchQuery.value = ''
  hasSearched.value = false
  aiQuery.value = ''
}

function applySuggestion(suggestion: string) {
  searchQuery.value = suggestion
  searchCompanies()
}

// Recherche d'entreprises gabonaises
const searchCompanies = async () => {
  isSearching.value = true
  hasSearched.value = true
  aiQuery.value = ''
  try {
    // 1) DB locale (entreprises déjà ingérées)
    const dbUrl = searchQuery.value.trim() 
      ? `/api/search?q=${encodeURIComponent(searchQuery.value)}`
      : '/api/search'

    const dbRes = await fetch(dbUrl)
    const dbData = dbRes.ok ? await dbRes.json() : { companies: [] }
    aiQuery.value = dbData.aiQuery || ''

    // 2) Recherche live Facebook (avec upsert pour enrichir la base)
    const fbUrl = `/api/search/facebook?q=${encodeURIComponent(searchQuery.value.trim() || '')}&limit=25&upsert=true`
    const fbRes = await fetch(fbUrl)
    const fbData = fbRes.ok ? await fbRes.json() : { companies: [] }

    // 3) Fusionner les résultats (unicité par profileUrl)
    const byProfileUrl = new Map<string, GabonCompany>()

    const normalize = (c: any): GabonCompany => ({
      id: c.id || c.profileUrl || crypto.randomUUID(),
      name: c.name || '',
      bio: c.bio || '',
      profileImage: c.profileImage || '',
      platform: c.platform || 'facebook',
      profileUrl: c.profileUrl || '',
      activityDomain: c.activityDomain || 'non spécifié',
      location: c.location || 'Gabon',
      followers: Number(c.followers || 0),
      verified: Boolean(c.verified || false),
      gabonScore: Number(c.gabonScore || 0),
      hashtags: Array.isArray(c.hashtags) ? c.hashtags : [],
      lastPostDate: c.lastPostDate || new Date().toISOString(),
      likeCount: c.likeCount,
      status: c.status,
      contactInfo: c.contactInfo
    })

    ;(dbData.companies || []).forEach((c: any) => {
      const nc = normalize(c)
      byProfileUrl.set(nc.profileUrl || nc.id, nc)
    })
    ;(fbData.companies || []).forEach((c: any) => {
      const nc = normalize(c)
      const key = nc.profileUrl || nc.id
      if (!byProfileUrl.has(key)) byProfileUrl.set(key, nc)
    })

    companies.value = Array.from(byProfileUrl.values())
  } catch (e) {
    console.error('Erreur lors de la recherche d\'entreprises:', e)
  } finally {
    isSearching.value = false
  }
}

// Initialisation sécurisée
onMounted(() => {
  // Vérification que l'application est bien initialisée
  if (import.meta.client) {
    console.log('Application initialisée côté client')
    // Charger les entreprises gabonaises au démarrage
    searchCompanies()
  }
})

</script>
<script lang="ts">
// Correction Nuxt 3/TypeScript : expose les variables pour le template
export default {
  expose: [
    'searchQuery',
    'isSearching',
    'hasSearched',
    'aiQuery',
    'searchCompanies',
    'clearSearch',
    'applySuggestion',
    'filteredCompanies',
    'formatNumber',
    'openCompanyProfile',
    'openLikeModal',
    'closeLikeModal',
    'handleLikeSuccess',
    'searchSuggestions',
    'isLikeModalOpen',
    'selectedCompany',
    'isLikeAction'
  ]
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
button, .transition-colors, .transition-shadow {
  transition-property: color, background-color, border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
