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
  faInstagram,
  faTwitter,
  faLinkedin
} from '@fortawesome/free-brands-svg-icons'

// Configuration optimisée pour éviter les conflits d'initialisation
config.autoAddCss = false

// Ajout des icônes de manière optimisée
library.add(
  faThumbsUp,
  faThumbsDown,
  faSearch,
  faHeart,
  faFacebook,
  faTiktok,
  faInstagram,
  faTwitter,
  faLinkedin
)

export default defineNuxtPlugin((nuxtApp) => {
  // Enregistrement global du composant FontAwesome (les deux formats)
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
