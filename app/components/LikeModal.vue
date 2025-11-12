<template>
  <!-- Modal Overlay avec backdrop blur -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Overlay amélioré -->
      <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out" 
        @click="closeModal"
      />
      
      <!-- Modal Container compact -->
      <div class="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div 
          class="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 ease-out scale-100"
          :class="isOpen ? 'animate-modal-enter' : 'animate-modal-leave'"
        >
          <!-- Header compact -->
          <div class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 py-3 sm:px-6 sm:py-4">
            <!-- Gradient overlay pour effet de profondeur -->
            <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            
            <div class="relative flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-base sm:text-lg font-bold text-white leading-tight">
                  {{ isLike ? 'Confirmer l\'entreprise' : 'Signaler l\'entreprise' }}
                </h3>
              </div>
              
              <button
                class="flex-shrink-0 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 ease-out"
                :disabled="isSubmitting"
                @click="closeModal"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content compact -->
          <div class="px-4 py-4 sm:px-6 sm:py-5">
            <!-- Company Info compacte -->
            <div class="mb-4 sm:mb-5">
              <div class="flex flex-col sm:flex-row items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-gray-100">
                <div class="relative flex-shrink-0 mx-auto sm:mx-0">
                  <div 
                    class="w-12 h-12 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white platform-icon" 
                    :class="getPlatformIconClass(company?.platform)"
                  >
                    <font-awesome-icon 
                      :icon="getPlatformIcon(company?.platform)" 
                      class="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    />
                  </div>
                  <!-- Badge de vérification -->
                  <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0 text-center sm:text-left">
                  <h4 class="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate">{{ company?.name }}</h4>
                  <p class="text-gray-600 text-xs sm:text-sm mb-2">📍 {{ company?.location }}</p>
                  
                  <!-- Message d'information compact -->
                  <div 
                    class="p-2.5 sm:p-3 rounded-lg text-xs leading-relaxed"
                    :class="isLike 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'"
                  >
                    <p class="font-medium">
                      {{ isLike 
                        ? 'Confirmez que cette entreprise est gabonaise' 
                        : 'Signalez un problème avec cette entreprise' 
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulaire compact -->
            <form class="space-y-3 sm:space-y-4" @submit.prevent="submitLike">
              <!-- En-tête du formulaire -->
              <div class="border-b border-gray-100 pb-2 sm:pb-3">
                <h5 class="text-sm sm:text-base font-semibold text-gray-900">Vos informations</h5>
              </div>

              <!-- Champs nom et prénom -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label for="firstName" class="block text-sm font-medium text-gray-900">
                    Prénom <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    id="firstName"
                    v-model="form.firstName"
                    placeholder="Prénom"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                    :class="{ 
                      'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.firstName,
                      'bg-gray-50': isSubmitting
                    }"
                    :disabled="isSubmitting"
                    required
                  />
                  <p v-if="errors.firstName" class="text-red-600 text-xs">{{ errors.firstName }}</p>
                </div>
                
                <div class="space-y-1">
                  <label for="lastName" class="block text-sm font-medium text-gray-900">
                    Nom <span class="text-red-500">*</span>
                  </label>
                  <InputText
                    id="lastName"
                    v-model="form.lastName"
                    placeholder="Nom"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                    :class="{ 
                      'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.lastName,
                      'bg-gray-50': isSubmitting
                    }"
                    :disabled="isSubmitting"
                    required
                  />
                  <p v-if="errors.lastName" class="text-red-600 text-xs">{{ errors.lastName }}</p>
                </div>
              </div>

              <!-- Téléphone -->
              <div class="space-y-1">
                <label for="phone" class="block text-sm font-medium text-gray-900">
                  Téléphone <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="phone"
                  v-model="form.phone"
                  placeholder="+241 01 23 45 67"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                  :class="{ 
                    'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.phone,
                    'bg-gray-50': isSubmitting
                  }"
                  :disabled="isSubmitting"
                  required
                />
                <p v-if="errors.phone" class="text-red-600 text-xs">{{ errors.phone }}</p>
              </div>

              <!-- Email -->
              <div class="space-y-1">
                <label for="email" class="block text-sm font-medium text-gray-900">
                  Email <span class="text-red-500">*</span>
                </label>
                <InputText
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="votre@email.com"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                  :class="{ 
                    'border-red-300 focus:border-red-500 focus:ring-red-500/20': errors.email,
                    'bg-gray-50': isSubmitting
                  }"
                  :disabled="isSubmitting"
                  required
                />
                <p v-if="errors.email" class="text-red-600 text-xs">{{ errors.email }}</p>
              </div>

              <!-- Action Buttons compacts -->
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  class="flex-1 px-4 py-2 sm:py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-1 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 text-sm"
                  :disabled="isSubmitting"
                  @click="closeModal"
                >
                  Annuler
                </Button>
                
                <Button
                  type="submit"
                  class="flex-1 px-4 py-2 sm:py-2 font-medium rounded-lg focus:ring-1 transition-all duration-200 disabled:opacity-50 text-sm"
                  :class="[
                    isLike 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/30' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/30'
                  ]"
                  :disabled="isSubmitting"
                >
                  <span v-if="!isSubmitting">
                    {{ isLike ? 'Confirmer' : 'Signaler' }}
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi...
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Props
interface Props {
  isOpen: boolean
  company: {
    id: string
    name: string
    profileImage: string
    location: string
    platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin'
  } | null
  isLike: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  success: [data: unknown]
}>()

// State
const isSubmitting = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: ''
})

// Platform icon functions
function getPlatformIcon(platform?: string) {
  const iconMap: Record<string, string[]> = {
    facebook: ['fab', 'facebook'],
    instagram: ['fab', 'instagram'],
    tiktok: ['fab', 'tiktok'],
    twitter: ['fab', 'twitter'],
    linkedin: ['fab', 'linkedin']
  }
  return iconMap[platform || 'facebook'] || ['fab', 'facebook']
}

function getPlatformIconClass(platform?: string) {
  const classMap: Record<string, string> = {
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    tiktok: 'bg-black',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700'
  }
  return classMap[platform || 'facebook'] || 'bg-gray-500'
}

// Methods
function closeModal() {
  if (isSubmitting.value) return
  emit('close')
  resetForm()
}

function resetForm() {
  form.firstName = ''
  form.lastName = ''
  form.phone = ''
  form.email = ''
  errors.firstName = ''
  errors.lastName = ''
  errors.phone = ''
  errors.email = ''
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Validate firstName
  if (!form.firstName.trim()) {
    errors.firstName = 'Le prénom est requis'
    isValid = false
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'Le prénom doit contenir au moins 2 caractères'
    isValid = false
  }

  // Validate lastName
  if (!form.lastName.trim()) {
    errors.lastName = 'Le nom est requis'
    isValid = false
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Le nom doit contenir au moins 2 caractères'
    isValid = false
  }

  // Validate phone
  const phoneRegex = /^(\+241|0)[0-9]{8}$/
  if (!form.phone.trim()) {
    errors.phone = 'Le numéro de téléphone est requis'
    isValid = false
  } else if (!phoneRegex.test(form.phone.trim())) {
    errors.phone = 'Format invalide. Utilisez +241 01 23 45 67 ou 01 23 45 67'
    isValid = false
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) {
    errors.email = 'L\'email est requis'
    isValid = false
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = 'Format d\'email invalide'
    isValid = false
  }

  return isValid
}

async function submitLike() {
  if (!validateForm() || !props.company) return

  isSubmitting.value = true

  try {
    const response = await fetch('/api/companies/like', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId: props.company.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        isLike: props.isLike
      })
    })

    const data = await response.json()

    if (response.ok) {
      emit('success', data)
      closeModal()
    } else {
      throw new Error(data.statusMessage || 'Erreur lors de l\'envoi')
    }
  } catch (error) {
    console.error('Erreur lors du like:', error)
    // Afficher une erreur à l'utilisateur
    alert('Erreur lors de l\'envoi. Veuillez réessayer.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Animations pour le modal */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-leave {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}

.animate-modal-enter {
  animation: modal-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-modal-leave {
  animation: modal-leave 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
}

/* Amélioration des focus states */
input:focus, button:focus {
  outline: none;
}

/* Transition fluide pour les champs de formulaire */
input {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Animation pour les boutons */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Amélioration des états d'erreur */
.border-red-300 {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Smooth hover pour les éléments interactifs */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Effet de gradient animé pour les boutons principaux */
.bg-gradient-to-r {
  background-size: 200% 200%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-gradient-to-r:hover {
  background-position: right center;
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .animate-modal-enter,
  .animate-modal-leave,
  .transition-all,
  button,
  input {
    animation: none;
    transition: none;
  }
}

/* Responsive design pour petits écrans */
@media (max-width: 640px) {
  .grid-cols-1.sm\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .flex-col.sm\:flex-row {
    flex-direction: column;
  }
}

/* Focus visible pour l'accessibilité */
button:focus-visible,
input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
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
</style>
