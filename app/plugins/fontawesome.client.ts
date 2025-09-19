import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faThumbsUp, 
  faThumbsDown, 
  faSearch,
  faHeart
} from '@fortawesome/free-solid-svg-icons'
import {
  faFacebook,
  faTiktok,
  faInstagram
} from '@fortawesome/free-brands-svg-icons'

// Configuration optimisée pour éviter les conflits d'initialisation
config.autoAddCss = false
config.autoReplaceSvg = 'nest'

// Ajout des icônes de manière optimisée
library.add(
  faThumbsUp,
  faThumbsDown,
  faSearch,
  faHeart,
  faFacebook,
  faTiktok,
  faInstagram
)

export default defineNuxtPlugin((nuxtApp) => {
  // Enregistrement sécurisé du composant avec vérification
  if (nuxtApp.vueApp && !nuxtApp.vueApp.component('font-awesome-icon')) {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
  }
})
