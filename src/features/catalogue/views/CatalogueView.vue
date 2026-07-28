<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { BasketSummary, useBasketStore } from '@/features/basket'

import { useProductsQuery } from '../api/use-products-query'
import ArtworkCard from '../ui/ArtworkCard.vue'
import CatalogueEmptyState from '../ui/CatalogueEmptyState.vue'
import CatalogueErrorState from '../ui/CatalogueErrorState.vue'
import CatalogueHeader from '../ui/CatalogueHeader.vue'
import CatalogueLoadingState from '../ui/CatalogueLoadingState.vue'
import CatalogueRefreshWarning from '../ui/CatalogueRefreshWarning.vue'

const { data, isError, isFetching, isPending, refetch } = useProductsQuery()
const products = computed(() => data.value ?? [])
const hasRefreshFailure = computed(() => isError.value && data.value !== undefined)
const isRefreshingCatalogue = computed(
  () => data.value !== undefined && isFetching.value && !hasRefreshFailure.value,
)
const basket = useBasketStore()
const router = useRouter()

const savedBasketRecoveryMessage =
  'Your saved basket could not be restored. You can continue with a new basket.'

function retryLoadingProducts(): void {
  void refetch()
}

function beginCheckout(): void {
  if (basket.isEmpty) {
    return
  }

  void router.push({ name: 'checkout' })
}
</script>

<template>
  <section class="catalogue" aria-labelledby="catalogue-title">
    <CatalogueHeader :is-refreshing="isRefreshingCatalogue" />

    <CatalogueLoadingState v-if="isPending" />

    <CatalogueErrorState v-else-if="isError && !hasRefreshFailure" @retry="retryLoadingProducts" />

    <CatalogueEmptyState v-else-if="products.length === 0" />

    <template v-else>
      <p v-if="basket.hasDiscardedPersistedBasket" class="catalogue__recovery" role="status">
        {{ savedBasketRecoveryMessage }}
      </p>

      <CatalogueRefreshWarning
        v-if="hasRefreshFailure"
        :is-retrying="isFetching"
        @retry="retryLoadingProducts"
      />
      <BasketSummary @checkout="beginCheckout" />

      <ul class="catalogue__grid" aria-label="Available Artworks">
        <li v-for="product in products" :key="product.id">
          <ArtworkCard :product="product" />
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
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

.catalogue__recovery {
  margin: 0;
}
</style>
