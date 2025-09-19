<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">
              {{ isLike ? 'Confirmer que c\'est une entreprise gabonaise' : 'Signaler une entreprise' }}
            </h3>
            <button
              @click="closeModal"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <div class="mb-6">
            <div class="flex items-center space-x-3 mb-4">
              <img 
                :src="company?.profileImage" 
                :alt="company?.name"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 class="font-semibold text-gray-900">{{ company?.name }}</h4>
                <p class="text-sm text-gray-500">{{ company?.location }}</p>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-700">
                {{ isLike 
                  ? 'En confirmant, vous atteste que cette entreprise est bien gabonaise et mérite d\'être dans notre base de données.' 
                  : 'En signalant, vous indiquez que cette entreprise ne devrait pas être dans notre base de données.' 
                }}
              </p>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitLike" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <InputText
                  id="firstName"
                  v-model="form.firstName"
                  placeholder="Votre prénom"
                  :class="{ 'border-red-500': errors.firstName }"
                  required
                />
                <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
              </div>
              
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <InputText
                  id="lastName"
                  v-model="form.lastName"
                  placeholder="Votre nom"
                  :class="{ 'border-red-500': errors.lastName }"
                  required
                />
                <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone *
              </label>
              <InputText
                id="phone"
                v-model="form.phone"
                placeholder="+241 01 23 45 67"
                :class="{ 'border-red-500': errors.phone }"
                required
              />
              <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
              <p class="text-gray-500 text-xs mt-1">Format: +241 01 23 45 67 ou 01 23 45 67</p>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                placeholder="votre@email.com"
                :class="{ 'border-red-500': errors.email }"
                required
              />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4">
              <Button
                type="button"
                @click="closeModal"
                class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                :disabled="isSubmitting"
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                :class="[
                  'flex-1 text-white font-medium',
                  isLike 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                ]"
                :disabled="isSubmitting"
                :loading="isSubmitting"
              >
                <span v-if="!isSubmitting">
                  {{ isLike ? 'Confirmer' : 'Signaler' }}
                </span>
                <span v-else class="flex items-center">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Envoi...
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Props
interface Props {
  isOpen: boolean
  company: {
    id: string
    name: string
    profileImage: string
    location: string
  } | null
  isLike: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  success: [data: any]
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
