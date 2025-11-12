<template>
  <!-- Modal Backdrop -->
  <Transition
    name="modal"
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <!-- Enhanced Blur Overlay -->
      <div 
        class="absolute inset-0 bg-gray-900/40 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300" 
        @click="$emit('close')"
      />
      
      <!-- Modal Content -->
      <div 
        class="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 max-w-5xl w-full max-h-[95vh] sm:max-h-[92vh] overflow-hidden transform transition-all duration-300 scale-100"
        :class="{ 'animate-modal-enter': isOpen }"
      >
      <!-- Modern Header -->
      <header class="relative bg-white/80 backdrop-blur-sm border-b border-gray-100/50 p-4 sm:p-6 lg:p-8">
        <!-- Close Button -->
        <button
          class="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Fermer le modal"
          @click="$emit('close')"
        >
          <X class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        
        <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pr-10 sm:pr-0">
          <!-- Company Avatar -->
          <div class="relative group mx-auto sm:mx-0">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200">
              <img
                v-if="company?.profileImage"
                :src="company.profileImage"
                :alt="company.name"
                class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center">
                <Building2 class="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <!-- Verification Badge -->
            <div v-if="company?.verified" class="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <CheckCircle class="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          
          <!-- Company Info -->
          <div class="flex-1 min-w-0 space-y-3 sm:space-y-4 text-center sm:text-left">
            <!-- Title & Platform -->
            <div class="space-y-2">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {{ company?.name || 'Entreprise' }}
              </h1>
              
              <!-- Platform Badge -->
              <div class="flex items-center justify-center sm:justify-start gap-3">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 border border-gray-200/50">
                  <div 
                    class="w-5 h-5 rounded-full flex items-center justify-center"
                    :class="getPlatformIconClass(company?.platform || 'facebook')"
                  >
                    <font-awesome-icon 
                      :icon="getPlatformIcon(company?.platform || 'facebook')" 
                      class="w-3 h-3 text-white"
                    />
                  </div>
                  <span class="text-sm font-medium text-gray-700 capitalize">{{ company?.platform }}</span>
                </div>
              </div>
            </div>
            
            <!-- Stats Row -->
            <div class="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-sm flex-wrap">
              <div v-if="company?.followers" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span class="font-semibold text-gray-900">{{ formatNumber(company.followers) }}</span>
                  <span class="text-gray-500 ml-1">abonnés</span>
                </div>
              </div>
              
              <div v-if="company?.gabonScore" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <Star class="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span class="font-semibold text-gray-900">{{ company.gabonScore }}%</span>
                  <span class="text-gray-500 ml-1">Gabon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Scrollable Area -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div class="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          
          <!-- Description Section -->
          <section v-if="company?.bio" class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FileText class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-gray-900">Description</h2>
            </div>
            <div class="pl-0 sm:pl-12 space-y-2 sm:space-y-3">
              <p class="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {{ company.bio }}
              </p>
            </div>
          </section>
          
          <!-- General Info Section -->
          <section class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors duration-200">
                <Info class="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Informations générales</h2>
            </div>
            
            <div class="pl-0 sm:pl-12">
              <div class="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 space-y-3 sm:space-y-4 hover:border-gray-300/50 transition-all duration-200">
                <div v-if="company?.activityDomain" class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                  <span class="text-sm sm:text-base text-gray-600 font-medium">Domaine d'activité</span>
                  <span class="text-sm sm:text-base font-semibold text-gray-900 break-words">{{ company.activityDomain }}</span>
                </div>
                
                <div v-if="company?.category" class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-t border-gray-100 gap-1">
                  <span class="text-sm sm:text-base text-gray-600 font-medium">Catégorie</span>
                  <span class="text-sm sm:text-base font-semibold text-gray-900 break-words">{{ company.category }}</span>
                </div>
                
                <div v-if="company?.location || company?.city" class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-t border-gray-100 gap-1">
                  <span class="text-sm sm:text-base text-gray-600 font-medium">Localisation</span>
                  <span class="text-sm sm:text-base font-semibold text-gray-900 break-words">{{ company.city || company.location }}</span>
                </div>
                
                <div v-if="company?.yearFounded" class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-t border-gray-100 gap-1">
                  <span class="text-sm sm:text-base text-gray-600 font-medium">Année de création</span>
                  <span class="text-sm sm:text-base font-semibold text-gray-900">{{ company.yearFounded }}</span>
                </div>
                
                <div v-if="company?.employeeCount" class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-t border-gray-100 gap-1">
                  <span class="text-sm sm:text-base text-gray-600 font-medium">Employés</span>
                  <span class="text-sm sm:text-base font-semibold text-gray-900">{{ company.employeeCount }}</span>
                </div>
                
                <div v-if="company?.averageRating" class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-t border-gray-100 gap-1">
                  <span class="text-sm sm:text-base text-gray-600 font-medium">Note moyenne</span>
                  <div class="flex items-center gap-2">
                    <Star class="w-4 h-4 text-amber-500 fill-current" />
                    <span class="text-sm sm:text-base font-semibold text-gray-900">{{ company.averageRating }}/5</span>
                    <span v-if="company.reviewCount" class="text-xs sm:text-sm text-gray-500">({{ company.reviewCount }})</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Contact Section -->
          <section class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors duration-200">
                <Phone class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Contact</h2>
            </div>
            
            <div class="pl-0 sm:pl-12">
              <div class="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 space-y-3 sm:space-y-4 hover:border-gray-300/50 transition-all duration-200">
                <div v-if="company?.phone" class="hover:bg-gray-50/50 rounded-xl p-3 -m-3 transition-colors duration-200">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Phone class="w-4 h-4 text-blue-600" />
                      </div>
                      <span class="text-sm sm:text-base text-gray-600 font-medium">Téléphone</span>
                    </div>
                    <a :href="`tel:${company.phone}`" class="text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors break-all">
                      {{ company.phone }}
                    </a>
                  </div>
                </div>
                
                <div v-if="company?.whatsapp" class="hover:bg-gray-50/50 rounded-xl p-3 -m-3 transition-colors duration-200">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <MessageCircle class="w-4 h-4 text-green-600" />
                      </div>
                      <span class="text-sm sm:text-base text-gray-600 font-medium">WhatsApp</span>
                    </div>
                    <a :href="`https://wa.me/${company.whatsapp.replace(/\\D/g, '')}`" target="_blank" class="text-sm sm:text-base font-semibold text-green-600 hover:text-green-700 transition-colors break-all">
                      {{ company.whatsapp }}
                    </a>
                  </div>
                </div>
                
                <div v-if="company?.email" class="hover:bg-gray-50/50 rounded-xl p-3 -m-3 transition-colors duration-200">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                        <Mail class="w-4 h-4 text-purple-600" />
                      </div>
                      <span class="text-sm sm:text-base text-gray-600 font-medium">Email</span>
                    </div>
                    <a :href="`mailto:${company.email}`" class="text-sm sm:text-base font-semibold text-purple-600 hover:text-purple-700 transition-colors break-all">
                      {{ company.email }}
                    </a>
                  </div>
                </div>
                
                <div v-if="company?.website" class="hover:bg-gray-50/50 rounded-xl p-3 -m-3 transition-colors duration-200">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Globe class="w-4 h-4 text-indigo-600" />
                      </div>
                      <span class="text-sm sm:text-base text-gray-600 font-medium">Site web</span>
                    </div>
                    <a :href="company.website" target="_blank" class="text-sm sm:text-base font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                      Visiter →
                    </a>
                  </div>
                </div>
                
                <div v-if="company?.address" class="hover:bg-gray-50/50 rounded-xl p-3 -m-3 transition-colors duration-200">
                  <div class="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                        <MapPin class="w-4 h-4 text-orange-600" />
                      </div>
                      <span class="text-sm sm:text-base text-gray-600 font-medium">Adresse</span>
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-gray-900 break-words sm:text-right sm:flex-1">{{ company.address }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Opening Hours Section -->
          <section v-if="company?.openingHours" class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-50 flex items-center justify-center hover:bg-teal-100 transition-colors duration-200">
                <Clock class="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Horaires d'ouverture</h2>
            </div>
            
            <div class="pl-0 sm:pl-12">
              <div class="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 hover:border-gray-300/50 transition-all duration-200">
                <div v-if="typeof company.openingHours === 'object'" class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div v-for="(hours, day) in company.openingHours" :key="day" class="flex justify-between items-center py-2 hover:bg-gray-50/50 rounded-lg px-3 -mx-3 transition-colors duration-200">
                    <span class="text-sm sm:text-base text-gray-600 font-medium capitalize">{{ formatDay(day) }}</span>
                    <span class="text-sm sm:text-base font-semibold text-gray-900">{{ hours || 'Fermé' }}</span>
                  </div>
                </div>
                <div v-else class="text-sm sm:text-base text-gray-700 font-medium">
                  {{ company.openingHours }}
                </div>
              </div>
            </div>
          </section>

          <!-- Services Section -->
          <section v-if="company?.services && company.services.length > 0" class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-50 flex items-center justify-center hover:bg-violet-100 transition-colors duration-200">
                <Package class="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Services</h2>
            </div>
            
            <div class="pl-0 sm:pl-12">
              <div class="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 hover:border-gray-300/50 transition-all duration-200">
                <div class="flex flex-wrap gap-2 sm:gap-3">
                  <span
                    v-for="service in company.services"
                    :key="service"
                    class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs sm:text-sm font-semibold rounded-full border border-blue-200/50 hover:border-blue-300/50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                  >
                    {{ service }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- Social Networks Section -->
          <section class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-colors duration-200">
                <Share2 class="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Réseaux sociaux</h2>
            </div>
            
            <div class="pl-0 sm:pl-12">
              <div class="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 hover:border-gray-300/50 transition-all duration-200">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <a v-if="company?.facebookUrl"
                     :href="company.facebookUrl"
                     target="_blank"
                     class="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-blue-200/30">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fab', 'facebook']" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-blue-700">Facebook</span>
                  </a>
                  
                  <a v-if="company?.instagramUrl"
                     :href="company.instagramUrl"
                     target="_blank"
                     class="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-rose-100/50 hover:from-pink-100 hover:to-rose-200/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-pink-200/30">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fab', 'instagram']" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-pink-700">Instagram</span>
                  </a>
                  
                  <a v-if="company?.tiktokUrl"
                     :href="company.tiktokUrl"
                     target="_blank"
                     class="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-slate-100/50 hover:from-gray-100 hover:to-slate-200/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-200/30">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fab', 'tiktok']" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-gray-700">TikTok</span>
                  </a>
                  
                  <a v-if="company?.linkedinUrl"
                     :href="company.linkedinUrl"
                     target="_blank"
                     class="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-100/50 hover:from-blue-100 hover:to-indigo-200/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-blue-200/30">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fab', 'linkedin']" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-blue-700">LinkedIn</span>
                  </a>
                  
                  <a v-if="company?.twitterUrl"
                     :href="company.twitterUrl"
                     target="_blank"
                     class="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-sky-50 to-blue-100/50 hover:from-sky-100 hover:to-blue-200/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-sky-200/30">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-500 flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fab', 'twitter']" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-sky-700">Twitter</span>
                  </a>
                  
                  <a v-if="company?.youtubeUrl"
                     :href="company.youtubeUrl"
                     target="_blank"
                     class="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-100/50 hover:from-red-100 hover:to-rose-200/50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-red-200/30">
                    <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fab', 'youtube']" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span class="text-sm sm:text-base font-semibold text-red-700">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- Hashtags Section -->
          <section v-if="company?.hashtags && company.hashtags.length > 0" class="space-y-3 sm:space-y-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-50 flex items-center justify-center hover:bg-amber-100 transition-colors duration-200">
                <Tag class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Hashtags</h2>
            </div>
            
            <div class="pl-0 sm:pl-12">
              <div class="bg-gradient-to-br from-white/80 to-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-6 hover:border-gray-300/50 transition-all duration-200">
                <div class="flex flex-wrap gap-2 sm:gap-3">
                  <span
                    v-for="hashtag in company.hashtags"
                    :key="hashtag"
                    class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 text-xs sm:text-sm font-medium rounded-full border border-gray-200/50 hover:border-gray-300/50 hover:from-gray-100 hover:to-slate-100 transition-all duration-200 hover:scale-105"
                  >
                    {{ hashtag }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <footer class="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            <span v-if="company?.lastScraped" class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Dernière mise à jour : {{ formatDate(company.lastScraped) }}
            </span>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              v-if="company?.profileUrl"
              class="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
              @click="openProfileUrl"
            >
              <ExternalLink class="w-4 h-4 transition-transform group-hover:scale-110" />
              Voir le profil
            </button>
            
            <button
              class="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
              @click="$emit('close')"
            >
              Fermer
            </button>
          </div>
        </div>
      </footer>
    </div>
  </div>
  </Transition>
</template>

<script>
import { 
  X, 
  Building2, 
  CheckCircle, 
  Users, 
  Star, 
  FileText, 
  Info, 
  Phone, 
  MessageCircle, 
  Mail, 
  Globe, 
  MapPin, 
  Clock, 
  Package, 
  Share2, 
  Tag, 
  ExternalLink 
} from 'lucide-vue-next'

export default {
  name: 'DetailModal',
  components: {
    X,
    Building2,
    CheckCircle,
    Users,
    Star,
    FileText,
    Info,
    Phone,
    MessageCircle,
    Mail,
    Globe,
    MapPin,
    Clock,
    Package,
    Share2,
    Tag,
    ExternalLink
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    company: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  mounted() {
    // Gérer la touche Escape pour fermer le modal
    document.addEventListener('keydown', this.handleKeyDown)
  },
  unmounted() {
    // Nettoyer l'event listener
    document.removeEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    // Gestion des événements clavier pour une meilleure UX
    handleKeyDown(event) {
      if (event.key === 'Escape' && this.isOpen) {
        this.$emit('close')
      }
    },
    formatNumber(n) {
      if (!n) return '0'
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
      if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
      return n.toString()
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDay(day) {
      const days = {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      }
      return days[day] || day
    },
    
    getPlatformIcon(platform) {
      const iconMap = {
        facebook: ['fab', 'facebook'],
        instagram: ['fab', 'instagram'],
        tiktok: ['fab', 'tiktok'],
        twitter: ['fab', 'twitter'],
        linkedin: ['fab', 'linkedin']
      }
      return iconMap[platform] || ['fab', 'facebook']
    },
    
    getPlatformIconClass(platform) {
      const classMap = {
        facebook: 'bg-blue-600',
        instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
        tiktok: 'bg-black',
        twitter: 'bg-sky-500',
        linkedin: 'bg-blue-700'
      }
      return classMap[platform] || 'bg-gray-500'
    },
    
    openProfileUrl() {
      if (this.company?.profileUrl) {
        window.open(this.company.profileUrl, '_blank')
      }
    }
  }
}
</script>

<style scoped>
/* Animations modernes pour le modal */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-enter {
  animation: modal-enter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Transitions Vue */
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Scroll personnalisé moderne */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #94a3b8, #64748b);
}

/* Support pour Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 rgba(241, 245, 249, 0.5);
}

/* Animations personnalisées pour les éléments interactifs */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Focus states améliorés */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Transitions globales pour les éléments interactifs */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Backdrop blur support */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

.backdrop-saturate-150 {
  backdrop-filter: saturate(1.5);
}

/* Dark mode support (si nécessaire) */
@media (prefers-color-scheme: dark) {
  .bg-white\/95 {
    background-color: rgba(31, 41, 55, 0.95);
  }
  
  .text-gray-900 {
    color: rgb(243, 244, 246);
  }
  
  .text-gray-600 {
    color: rgb(156, 163, 175);
  }
}

/* Responsive design amélioré */
@media (max-width: 768px) {
  .max-w-5xl {
    max-width: 95vw;
  }
  
  .p-8 {
    padding: 1.5rem;
  }
  
  .gap-8 {
    gap: 1.5rem;
  }
}

/* Accessibilité améliorée */
@media (prefers-reduced-motion: reduce) {
  .animate-modal-enter,
  .transition-all,
  .transition-colors {
    animation: none;
    transition: none;
  }
}

/* États de hover subtils */
.group:hover .group-hover\:bg-blue-100 {
  background-color: rgb(219, 234, 254);
}

.group:hover .group-hover\:bg-slate-100 {
  background-color: rgb(241, 245, 249);
}

.group:hover .group-hover\:bg-emerald-100 {
  background-color: rgb(209, 250, 229);
}

.group:hover .group-hover\:bg-teal-100 {
  background-color: rgb(204, 251, 241);
}

.group:hover .group-hover\:bg-violet-100 {
  background-color: rgb(237, 233, 254);
}

.group:hover .group-hover\:bg-rose-100 {
  background-color: rgb(255, 228, 230);
}

.group:hover .group-hover\:bg-amber-100 {
  background-color: rgb(254, 243, 199);
}
</style>
