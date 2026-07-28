<script setup lang="ts">
import CatalogueRefreshStatus from './CatalogueRefreshStatus.vue'

withDefaults(defineProps<{ isRefreshing?: boolean }>(), {
  isRefreshing: false,
})
</script>

<template>
  <header class="catalogue-header">
    <p class="catalogue-header__eyebrow typography typography--overline">Discover the collection</p>
    <div class="catalogue-header__heading">
      <h1 id="catalogue-title" class="catalogue-header__title typography typography--display">
        Artwork catalogue
      </h1>
      <CatalogueRefreshStatus v-if="isRefreshing" />
    </div>
  </header>
</template>

<style scoped>
.catalogue-header {
  margin-bottom: var(--space-8);
}

.catalogue-header__eyebrow {
  margin-bottom: var(--space-2);
}

.catalogue-header__heading {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}
</style>
