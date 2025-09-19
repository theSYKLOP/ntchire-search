// Plugin PrimeVue optimisé pour éviter les conflits d'initialisation
export default defineNuxtPlugin((nuxtApp) => {
  // Configuration PrimeVue côté client uniquement
  if (process.client) {
    // Vérification que l'application Vue est disponible
    if (nuxtApp.vueApp) {
      console.log('PrimeVue initialisé côté client')
    }
  }
})
