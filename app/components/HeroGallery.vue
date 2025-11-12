<template>
  <div class="relative w-full max-w-6xl mx-auto mb-8 md:mb-12 lg:mb-16 px-4 md:px-0">
    <!-- Desktop Gallery (Hidden on mobile/tablet) -->
    <div class="hidden lg:flex items-center justify-center gap-4 h-80 overflow-hidden">
      <div
        v-for="(item, index) in galleryItems"
        :key="item.id"
        class="relative h-full overflow-hidden cursor-pointer transition-all duration-700 ease-out shadow-xl hover:shadow-2xl group"
        :class="[
          index === activeIndex 
            ? 'w-[480px] flex-shrink-0 rounded-3xl' 
            : 'w-20 flex-shrink-0 hover:w-24 rounded-full'
        ]"
        @click="setActiveIndex(index)"
        @mouseenter="handleHover(index)"
      >
        <!-- Background Image -->
        <div 
          class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          :style="{ backgroundImage: `url(${item.image})` }"
        >
          <!-- Overlay -->
          <div 
            class="absolute inset-0 transition-all duration-500"
            :class="[
              index === activeIndex 
                ? 'bg-black/20' 
                : 'bg-black/60 group-hover:bg-black/40'
            ]"
          />
        </div>

        

        <!-- Platform Icon (for collapsed state) -->
        <div 
          v-if="index !== activeIndex"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
        >
          <div 
            class="w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-white/90 backdrop-blur-sm border border-gray-200"
          >
            <font-awesome-icon 
              :icon="getPlatformIcon(item.platform)" 
              class="w-7 h-7 text-gray-800"
            />
          </div>
        </div>

        <!-- Content (for expanded state) -->
        <div 
          v-if="index === activeIndex"
          class="absolute inset-0 p-6 flex flex-col justify-end text-white transform transition-all duration-500"
        >
          <div class="space-y-3">
            <!-- Company Info -->
            <div class="flex items-center gap-3">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg platform-icon"
                :class="getPlatformIconClass(item.platform)"
              >
                <font-awesome-icon 
                  :icon="getPlatformIcon(item.platform)" 
                  class="w-6 h-6 text-white"
                />
              </div>
              
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold truncate">{{ item.name }}</h3>
                <p class="text-sm text-white/80">{{ item.location }}</p>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-white/90 leading-relaxed line-clamp-2">
              {{ item.description }}
            </p>

            <!-- Stats -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span class="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                  {{ item.category }}
                </span>
                
                <div class="flex items-center gap-1 text-sm">
                  <font-awesome-icon 
                    :icon="['fas', 'heart']" 
                    class="w-4 h-4" 
                  />
                  {{ item.likes }}
                </div>
              </div>

              <button 
                class="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors duration-200"
                @click.stop="openCompany(item)"
              >
                Voir plus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet Slider (Hidden on desktop) -->
    <div class="lg:hidden relative">
      <!-- Main Card -->
      <div class="relative w-full h-[450px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
        <TransitionGroup
          name="slide"
          tag="div"
          class="relative w-full h-full"
        >
          <div
            v-for="(item, index) in galleryItems"
            v-show="index === activeIndex"
            :key="item.id"
            class="absolute inset-0 w-full h-full"
          >
            <!-- Background Image -->
            <div 
              class="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              :style="{ backgroundImage: `url(${item.image})` }"
            >
              <!-- Overlay -->
              <div class="absolute inset-0 bg-black/30" />
            </div>

            <!-- Content -->
            <div class="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
              <div class="space-y-3 md:space-y-4">
                <!-- Company Info -->
                <div class="flex items-center gap-3">
                  <div 
                    class="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg platform-icon"
                    :class="getPlatformIconClass(item.platform)"
                  >
                    <font-awesome-icon 
                      :icon="getPlatformIcon(item.platform)" 
                      class="w-7 h-7 md:w-8 md:h-8 text-white"
                    />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="text-2xl md:text-3xl font-bold mb-1">{{ item.name }}</h3>
                    <p class="text-base md:text-lg text-white/90">{{ item.location }}</p>
                  </div>
                </div>

                <!-- Description -->
                <p class="text-sm md:text-base text-white/90 leading-relaxed line-clamp-2">
                  {{ item.description }}
                </p>

                <!-- Stats -->
                <div class="flex items-center justify-between flex-wrap gap-3">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="text-xs md:text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      {{ item.category }}
                    </span>
                    
                    <div class="flex items-center gap-1.5 text-sm md:text-base">
                      <font-awesome-icon 
                        :icon="['fas', 'heart']" 
                        class="w-4 h-4 md:w-5 md:h-5" 
                      />
                      {{ item.likes }}
                    </div>
                  </div>

                  <button 
                    class="px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 rounded-lg text-sm md:text-base font-medium transition-colors duration-200"
                    @click.stop="openCompany(item)"
                  >
                    Voir plus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Navigation Arrows -->
      <button
        class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
        @click="prevSlide"
        aria-label="Élément précédent"
      >
        <svg class="w-6 h-6 md:w-7 md:h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-10"
        @click="nextSlide"
        aria-label="Élément suivant"
      >
        <svg class="w-6 h-6 md:w-7 md:h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Pagination Dots -->
      <div class="flex justify-center gap-2 mt-6">
        <button
          v-for="(item, index) in galleryItems"
          :key="'dot-' + item.id"
          class="transition-all duration-300"
          :class="[
            index === activeIndex 
              ? 'w-8 h-2 bg-blue-600 rounded-full' 
              : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
          ]"
          @click="setActiveIndex(index)"
          :aria-label="`Aller à ${item.name}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Types
interface GalleryItem {
  id: string
  name: string
  location: string
  description: string
  category: string
  platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin'
  image: string
  likes: number
  url: string
}

// State
const activeIndex = ref(0)
const autoSlideInterval = ref<NodeJS.Timeout | null>(null)

// Data
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    name: 'Angels Restaurant',
    location: 'Lalala à droite',
    description: 'Restaurant gastronomique proposant une cuisine gabonaise authentique dans un cadre tropical exceptionnel.',
    category: 'Restauration',
    platform: 'facebook',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    likes: 245,
    url: 'https://facebook.com/angels.restaurant'
  },
  {
    id: '2',
    name: 'Gabon Fashion',
    location: 'Libreville Centre',
    description: 'Boutique de mode spécialisée dans les créations africaines contemporaines et les tissus traditionnels.',
    category: 'Mode',
    platform: 'instagram',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    likes: 189,
    url: 'https://instagram.com/gabonfashion'
  },
  {
    id: '3',
    name: 'Okume Tech',
    location: 'Port-Gentil',
    description: 'Entreprise de technologie innovante spécialisée dans les solutions digitales pour l\'Afrique centrale.',
    category: 'Technologie',
    platform: 'linkedin',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    likes: 167,
    url: 'https://linkedin.com/company/okume-tech'
  },
  {
    id: '4',
    name: 'Tropical Events',
    location: 'Libreville',
    description: 'Organisation d\'événements et cérémonies traditionnelles dans des lieux d\'exception au Gabon.',
    category: 'Événementiel',
    platform: 'instagram',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
    likes: 312,
    url: 'https://instagram.com/tropical.events.ga'
  },
  {
    id: '5',
    name: 'Forest Coffee',
    location: 'Franceville',
    description: 'Café artisanal cultivé de manière durable dans les forêts gabonaises, torréfaction locale.',
    category: 'Alimentation',
    platform: 'facebook',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop',
    likes: 94,
    url: 'https://facebook.com/forest.coffee.gabon'
  }
]

// Platform icon functions
function getPlatformIcon(platform: string) {
  const iconMap: Record<string, string[]> = {
    facebook: ['fab', 'facebook'],
    instagram: ['fab', 'instagram'],
    tiktok: ['fab', 'tiktok'],
    twitter: ['fab', 'twitter'],
    linkedin: ['fab', 'linkedin']
  }
  return iconMap[platform] || ['fab', 'facebook']
}

function getPlatformIconClass(platform: string) {
  const classMap: Record<string, string> = {
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    tiktok: 'bg-black',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700'
  }
  return classMap[platform] || 'bg-gray-500'
}

// Methods
function setActiveIndex(index: number) {
  activeIndex.value = index
  resetAutoSlide()
}

function handleHover(index: number) {
  if (index !== activeIndex.value) {
    // Small preview on hover without changing active
  }
}

function openCompany(item: GalleryItem) {
  window.open(item.url, '_blank')
}

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % galleryItems.length
}

function prevSlide() {
  activeIndex.value = (activeIndex.value - 1 + galleryItems.length) % galleryItems.length
}

function startAutoSlide() {
  autoSlideInterval.value = setInterval(nextSlide, 5000)
}

function resetAutoSlide() {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
  }
  startAutoSlide()
}

// Lifecycle
onMounted(() => {
  startAutoSlide()
})

onUnmounted(() => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
  }
})
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

/* Smooth transitions for all elements */
* {
  transition-property: width, height, transform, opacity, background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Platform icon styles */
.platform-icon {
  transition: all 0.3s ease;
}

.platform-icon:hover {
  transform: scale(1.1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  display: none;
}

/* Gradient backgrounds for platforms */
.bg-gradient-to-r {
  background-size: 200% 200%;
}

/* Enhanced hover effects */
.group:hover .platform-icon {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Animation for content appearance */
.group[data-active="true"] .content {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Slider Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  /* Styles spécifiques pour tablettes */
}

@media (max-width: 768px) {
  /* Styles spécifiques pour mobiles */
  .w-\[480px\] {
    width: 340px;
  }
  
  .w-20 {
    width: 60px;
  }
  
  .hover\:w-24:hover {
    width: 70px;
  }
}

/* Enhanced styling for retracted cards */
.w-20, .w-24 {
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Smooth border radius transitions */
.group {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Touch feedback for mobile */
@media (hover: none) and (pointer: coarse) {
  button:active {
    transform: scale(0.95);
  }
}
</style>