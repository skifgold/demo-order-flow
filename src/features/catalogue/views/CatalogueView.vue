<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

import { formatGbp } from '@/shared/money/format-gbp'

import { useProductsQuery } from '../api/use-products-query'
import { getLowestAvailablePrice } from '../domain/get-lowest-available-price'

const { data, isError, isPending, refetch } = useProductsQuery()
const products = computed(() => data.value ?? [])

function retryLoadingProducts(): void {
  void refetch()
}
</script>

<template>
  <section class="catalogue" aria-labelledby="catalogue-title">
    <header class="catalogue__header">
      <p class="catalogue__eyebrow typography typography--overline">Discover the collection</p>
      <h1 id="catalogue-title" class="catalogue__title typography typography--display">
        Artwork catalogue
      </h1>
    </header>

    <section v-if="isPending" aria-busy="true" aria-label="Loading catalogue">
      <p class="catalogue__status" role="status">Loading the catalogue…</p>
      <ul class="catalogue__grid" aria-hidden="true">
        <li v-for="index in 3" :key="index">
          <article class="artwork-card">
            <div class="artwork-card__image-frame">
              <Skeleton class="artwork-card__image-skeleton" width="100%" height="100%" />
            </div>
            <Skeleton width="35%" />
            <Skeleton width="70%" height="1.5rem" />
            <Skeleton width="45%" />
          </article>
        </li>
      </ul>
    </section>

    <section v-else-if="isError" role="alert" aria-labelledby="catalogue-error-title">
      <h2 id="catalogue-error-title">We could not load the catalogue</h2>
      <p>Please check your connection and try again.</p>
      <Button severity="contrast" label="Try again" @click="retryLoadingProducts" />
    </section>

    <p v-else-if="products.length === 0">No Artworks are currently available.</p>

    <ul v-else class="catalogue__grid" aria-label="Available Artworks">
      <li v-for="product in products" :key="product.id">
        <article class="artwork-card">
          <div class="artwork-card__image-frame">
            <img
              class="artwork-card__image"
              :src="product.imagePath"
              :alt="`Artwork: ${product.name}`"
              width="1122"
              height="1402"
              loading="lazy"
            />
          </div>
          <p class="artwork-card__category typography typography--overline">{{ product.category }}</p>
          <h2 class="artwork-card__title typography typography--heading">{{ product.name }}</h2>
          <p class="artwork-card__price typography typography--body">
            From {{ formatGbp(getLowestAvailablePrice(product.pricesBySize)) }}
          </p>
          <p class="artwork-card__availability typography typography--meta">
            {{ product.availableQuantity }} available
          </p>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.catalogue__header {
  margin-bottom: var(--space-8);
}

.catalogue__eyebrow {
  margin-bottom: var(--space-2);
}

.catalogue__grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, var(--catalogue-card-min-inline-size)), 1fr)
  );
  gap: var(--space-4);
  padding: 0;
  list-style: none;
}

.artwork-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 192px;
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.artwork-card__image-frame {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--color-border);
}

.artwork-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artwork-card__availability {
  margin-top: auto;
}

.catalogue__status {
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
