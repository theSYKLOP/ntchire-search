// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // PostCSS doit être défini ici (et non via postcss.config.js)
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  },
  
  // Configuration des modules avec ordre optimisé
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module'
  ],
  
  // Configuration PrimeVue optimisée
  primevue: {
    options: {
      unstyled: true,
      ripple: true
    },
    components: {
      include: ['Button', 'InputText', 'Card', 'Tag']
    }
  },
  
  // Configuration CSS optimisée
  css: [
    '@/assets/css/primevue-custom.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  
  // Configuration de build pour éviter les conflits
  build: {
    transpile: ['@fortawesome/vue-fontawesome']
  },
  
  // Configuration Vite pour résoudre les problèmes d'initialisation
  vite: {
    optimizeDeps: {
      include: ['@fortawesome/fontawesome-svg-core', '@fortawesome/vue-fontawesome']
    },
    define: {
      'process.env.DEBUG': false
    }
  },
  
  // Configuration SSR optimisée
  ssr: true,
  
  // Configuration des plugins avec ordre optimisé
  plugins: [
    '~/plugins/primevue.client.ts',
    '~/plugins/fontawesome.client.ts'
  ]
})
