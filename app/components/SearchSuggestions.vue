<template>
  <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
    <div class="suggestions-header">
      <h3 class="suggestions-title">
        <i class="pi pi-sparkles"></i>
        Suggestions IA
      </h3>
      <Button 
        icon="pi pi-times" 
        class="p-button-text p-button-sm"
        @click="closeSuggestions"
        aria-label="Fermer"
      />
    </div>

    <div class="suggestions-list">
      <div 
        v-for="(suggestion, index) in suggestions" 
        :key="index"
        class="suggestion-item"
        :class="{ 'active': selectedIndex === index }"
        @click="selectSuggestion(suggestion)"
        @mouseenter="selectedIndex = index"
      >
        <div class="suggestion-content">
          <i class="pi pi-search suggestion-icon"></i>
          <span class="suggestion-text">{{ suggestion }}</span>
        </div>
        <i class="pi pi-arrow-right suggestion-arrow"></i>
      </div>
    </div>

    <div class="suggestions-footer">
      <span class="suggestions-hint">
        <i class="pi pi-info-circle"></i>
        Suggestions générées par IA pour vous aider à trouver des entreprises gabonaises
      </span>
    </div>

    <!-- Prévisualisation optionnelle -->
    <div v-if="previewResults && previewResults.length > 0" class="suggestions-preview">
      <h4 class="preview-title">Aperçu des résultats</h4>
      <div class="preview-grid">
        <div 
          v-for="(result, index) in previewResults.slice(0, 3)" 
          :key="index"
          class="preview-card"
        >
          <img 
            v-if="result.profileImage" 
            :src="result.profileImage" 
            :alt="result.name"
            class="preview-image"
            @error="handleImageError"
          />
          <div v-else class="preview-placeholder">
            <i class="pi pi-building"></i>
          </div>
          <div class="preview-info">
            <h5 class="preview-name">{{ result.name }}</h5>
            <p class="preview-category">{{ result.activityDomain }}</p>
            <div class="preview-meta">
              <span class="preview-platform">
                <i :class="getPlatformIcon(result.platform)"></i>
                {{ result.platform }}
              </span>
              <span class="preview-score" :style="{ color: getScoreColor(result.gabonScore) }">
                {{ result.gabonScore }}% 🇬🇦
              </span>
            </div>
          </div>
        </div>
      </div>
      <Button 
        v-if="previewResults.length > 3"
        label="Voir tous les résultats"
        icon="pi pi-arrow-right"
        class="p-button-sm p-button-text"
        @click="viewAllResults"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import Button from 'primevue/button';

interface SearchSuggestionsProps {
  query: string;
  suggestions?: string[];
  previewResults?: any[];
  loading?: boolean;
}

const props = withDefaults(defineProps<SearchSuggestionsProps>(), {
  suggestions: () => [],
  previewResults: () => [],
  loading: false
});

const emit = defineEmits<{
  (e: 'select', suggestion: string): void;
  (e: 'close'): void;
  (e: 'viewAll'): void;
}>();

const showSuggestions = ref(true);
const selectedIndex = ref(0);

// Fermer les suggestions
const closeSuggestions = () => {
  showSuggestions.value = false;
  emit('close');
};

// Sélectionner une suggestion
const selectSuggestion = (suggestion: string) => {
  emit('select', suggestion);
  showSuggestions.value = false;
};

// Voir tous les résultats
const viewAllResults = () => {
  emit('viewAll');
};

// Icône de plateforme
const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    facebook: 'pi pi-facebook',
    instagram: 'pi pi-instagram',
    tiktok: 'pi pi-video',
    google: 'pi pi-google',
    twitter: 'pi pi-twitter',
    linkedin: 'pi pi-linkedin'
  };
  return icons[platform] || 'pi pi-globe';
};

// Couleur du score
const getScoreColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Vert
  if (score >= 60) return '#FF9800'; // Orange
  return '#F44336'; // Rouge
};

// Gérer les erreurs d'images
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const placeholder = img.nextElementSibling as HTMLElement;
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
};

// Navigation clavier
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showSuggestions.value) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % props.suggestions.length;
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = selectedIndex.value === 0 ? props.suggestions.length - 1 : selectedIndex.value - 1;
      break;
    case 'Enter':
      event.preventDefault();
      if (props.suggestions[selectedIndex.value]) {
        selectSuggestion(props.suggestions[selectedIndex.value]);
      }
      break;
    case 'Escape':
      closeSuggestions();
      break;
  }
};

// Écouter les événements clavier
if (process.client) {
  window.addEventListener('keydown', handleKeyDown);
}

// Réinitialiser l'index sélectionné quand les suggestions changent
watch(() => props.suggestions, () => {
  selectedIndex.value = 0;
});

// Réouvrir automatiquement quand de nouvelles suggestions arrivent
watch(() => props.suggestions, (newSuggestions) => {
  if (newSuggestions.length > 0) {
    showSuggestions.value = true;
  }
});
</script>

<style scoped>
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.suggestions-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.suggestions-title i {
  font-size: 1.25rem;
  animation: sparkle 2s infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}

.suggestions-list {
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.suggestion-icon {
  color: #667eea;
  font-size: 1rem;
}

.suggestion-text {
  font-size: 0.95rem;
  color: #333;
}

.suggestion-arrow {
  color: #999;
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.suggestion-item:hover .suggestion-arrow,
.suggestion-item.active .suggestion-arrow {
  opacity: 1;
}

.suggestions-footer {
  padding: 0.75rem 1.25rem;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.suggestions-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.suggestions-hint i {
  color: #667eea;
}

/* Prévisualisation des résultats */
.suggestions-preview {
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.preview-title {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.preview-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.preview-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2rem;
}

.preview-info {
  padding: 0.75rem;
}

.preview-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-category {
  margin: 0 0 0.5rem 0;
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
}

.preview-platform {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #888;
  text-transform: capitalize;
}

.preview-score {
  font-weight: 600;
}

/* Scrollbar personnalisée */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

/* Responsive */
@media (max-width: 768px) {
  .search-suggestions {
    margin-top: 0.25rem;
    border-radius: 8px;
  }

  .suggestions-header,
  .suggestions-footer {
    padding: 0.75rem 1rem;
  }

  .suggestion-item {
    padding: 0.75rem 1rem;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
