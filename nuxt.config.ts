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
  
  // Configuration Nitro pour Vercel
  nitro: {
    experimental: {
      wasm: true
    }
  },
  
  // Hook pour générer Prisma Client avant le build
  hooks: {
    'build:before': async () => {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execPromise = promisify(exec)
      
      try {
        console.log('🔧 Generating Prisma Client...')
        await execPromise('npx prisma generate')
        console.log('✅ Prisma Client generated successfully')
      } catch (error) {
        console.error('❌ Failed to generate Prisma Client:', error)
        throw error
      }
    }
  },
  
  // Configuration Vite pour résoudre les problèmes d'initialisation
  vite: {
    optimizeDeps: {
      include: ['@fortawesome/fontawesome-svg-core', '@fortawesome/vue-fontawesome']
    },
    define: {
      'process.env.DEBUG': false
    },
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    server: {
      fs: {
        // Autoriser uniquement ce workspace pour éviter les erreurs "outside of serving allow list"
        strict: true,
        allow: [
          // Workspace root
          process.cwd(),
          // Node modules du projet
          require('path').join(process.cwd(), 'node_modules')
        ]
      },
      hmr: {
        overlay: true,
      },
    },
  },
  
  // Configuration SSR optimisée
  ssr: true,
  
  // Configuration du routeur pour éviter les warnings dev-sw.js
  router: {
    options: {
      strict: false
    }
  },
  
  // Configuration des plugins avec ordre optimisé
  plugins: [
    '~/plugins/primevue.client.ts',
    '~/plugins/fontawesome.client.ts'
  ]
})
