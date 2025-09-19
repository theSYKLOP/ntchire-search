<template>
  <main class="min-h-screen bg-gray-50 py-16">
    <div class="container mx-auto max-w-3xl px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Politique de confidentialité</h1>
      <p class="text-gray-700 leading-relaxed mb-4">
        Cette politique décrit comment <strong>Ntchiré</strong> collecte, utilise et protège les informations lors de l'utilisation du moteur de recherche d'entreprises gabonaises.
      </p>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">Données collectées</h2>
        <ul class="list-disc pl-6 text-gray-700 space-y-2">
          <li>Informations publiques des Pages (Facebook, Instagram, TikTok, etc.) accessibles via leurs API ou leurs profils publics.</li>
          <li>Données fournies volontairement par les utilisateurs dans les formulaires (nom, prénom, e‑mail, téléphone) pour les fonctionnalités de validation (like/dislike).</li>
          <li>Données techniques minimales (logs serveur anonymisés) pour la sécurité et l'amélioration du service.</li>
        </ul>
      </section>

      <section class="space-y-4 mt-8">
        <h2 class="text-xl font-semibold text-gray-900">Base légale et finalités</h2>
        <p class="text-gray-700">Les données sont traitées sur la base de l’intérêt légitime à référencer des entreprises gabonaises et de votre consentement (likes / soumissions).</p>
      </section>

      <section class="space-y-4 mt-8">
        <h2 class="text-xl font-semibold text-gray-900">Conservation</h2>
        <p class="text-gray-700">Les données sont conservées le temps nécessaire à la fourniture du service, puis supprimées ou anonymisées.</p>
      </section>

      <section class="space-y-4 mt-8">
        <h2 class="text-xl font-semibold text-gray-900">Partage</h2>
        <p class="text-gray-700">Nous ne vendons pas vos données. Les informations publiques de Pages restent soumises aux conditions de leurs plateformes.</p>
      </section>

      <section class="space-y-4 mt-8">
        <h2 class="text-xl font-semibold text-gray-900">Vos droits</h2>
        <p class="text-gray-700">Conformément au RGPD, vous pouvez demander l’accès, la rectification ou la suppression de vos données.</p>
      </section>

      <section class="space-y-4 mt-8">
        <h2 class="text-xl font-semibold text-gray-900">Contact</h2>
        <p class="text-gray-700">Pour toute demande, écrivez‑nous à <a class="text-blue-600 underline" href="mailto:privacy@ntchire.ga">privacy@ntchire.ga</a>.</p>
      </section>

      <section class="space-y-4 mt-8">
        <h2 class="text-xl font-semibold text-gray-900">Suppression des données</h2>
        <p class="text-gray-700">Consultez la procédure de suppression ici : <NuxtLink class="text-blue-600 underline" to="/data-deletion">/data-deletion</NuxtLink>.</p>
      </section>

      <p class="text-gray-500 text-sm mt-10">Dernière mise à jour : {{ lastUpdated }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const lastUpdated = computed(() => new Date().toISOString().slice(0, 10))
</script>

<script lang="ts">
export default { name: 'PrivacyPolicyPage' }
</script>

<style scoped>
</style>


