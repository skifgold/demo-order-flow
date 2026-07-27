<script setup lang="ts">
import { computed } from 'vue'
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
  <section aria-labelledby="catalogue-title">
    <p>Discover the collection</p>
    <h1 id="catalogue-title">Artwork catalogue</h1>

    <section v-if="isPending" aria-busy="true" aria-label="Loading catalogue">
      <p class="visually-hidden" role="status">Loading the catalogue…</p>
      <ul class="catalogue-grid" aria-hidden="true">
        <li v-for="index in 3" :key="index">
          <article class="artwork-card">
            <Skeleton height="7rem" />
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
      <button type="button" @click="retryLoadingProducts">Try again</button>
    </section>

    <p v-else-if="products.length === 0">No Artworks are currently available.</p>

    <ul v-else class="catalogue-grid" aria-label="Available Artworks">
      <li v-for="product in products" :key="product.id">
        <article class="artwork-card">
          <p>{{ product.category }}</p>
          <h2>{{ product.name }}</h2>
          <p>From {{ formatGbp(getLowestAvailablePrice(product.pricesBySize)) }}</p>
          <p>{{ product.availableQuantity }} available</p>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.catalogue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.artwork-card {
  display: grid;
  gap: 0.75rem;
  min-height: 12rem;
  padding: 1.5rem;
  border: 1px solid #d9cfc0;
  background: #fffdf9;
}

.visually-hidden {
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
