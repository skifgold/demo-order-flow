<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <section class="catalogue-loading" aria-busy="true" aria-label="Loading catalogue">
    <p class="catalogue-loading__status" role="status">Loading the catalogue…</p>
    <ul class="catalogue-loading__grid" aria-hidden="true">
      <li v-for="index in 3" :key="index">
        <article class="catalogue-loading__card">
          <div class="catalogue-loading__image-frame">
            <Skeleton width="100%" height="100%" />
          </div>
          <Skeleton width="35%" />
          <Skeleton width="70%" height="1.5rem" />
          <Skeleton width="45%" />
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.catalogue-loading__grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, var(--catalogue-card-min-inline-size)), 1fr)
  );
  gap: var(--space-4);
  padding: 0;
  list-style: none;
}

.catalogue-loading__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 192px;
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.catalogue-loading__image-frame {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--color-border);
}

.catalogue-loading__status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
