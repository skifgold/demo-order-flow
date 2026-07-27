<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

import { useBasketStore } from '@/features/basket'
import { formatGbp } from '@/shared/money/format-gbp'

import type { Product } from '../api/product.contract'
import { getLowestAvailablePrice } from '../domain/get-lowest-available-price'

const props = defineProps<{
  product: Product
}>()

const basket = useBasketStore()
const quantity = computed(() => basket.quantityFor(props.product.id))
const isUnavailable = computed(() => props.product.availableQuantity === 0)
const hasReachedAvailability = computed(
  () => quantity.value >= props.product.availableQuantity,
)

function addToBasket(): void {
  basket.add(props.product.id, props.product.availableQuantity)
}

function decreaseQuantity(): void {
  basket.setQuantity({
    productId: props.product.id,
    quantity: quantity.value - 1,
    availableQuantity: props.product.availableQuantity,
  })
}

function increaseQuantity(): void {
  basket.setQuantity({
    productId: props.product.id,
    quantity: quantity.value + 1,
    availableQuantity: props.product.availableQuantity,
  })
}
</script>

<template>
  <article class="artwork-card">
    <div class="artwork-card__image-frame">
      <img class="artwork-card__image" :src="product.imagePath" :alt="`Artwork: ${product.name}`" width="1122"
        height="1402" loading="lazy" />
    </div>
    <p class="artwork-card__category typography typography--overline">
      {{ product.category }}
    </p>
    <h2 class="artwork-card__title typography typography--heading">
      {{ product.name }}
    </h2>
    <p class="artwork-card__price typography typography--body">
      From {{ formatGbp(getLowestAvailablePrice(product.pricesBySize)) }}
    </p>
    <p class="artwork-card__availability typography typography--meta">
      <template v-if="isUnavailable">Unavailable</template>
      <template v-else>{{ product.availableQuantity }} available</template>
    </p>
    <p class="artwork-card__selection typography typography--meta">
      <template v-if="quantity > 0">Selected: {{ quantity }}</template>
      <template v-else>Not yet selected</template>
    </p>
    <Button label="Add to basket" :disabled="isUnavailable || hasReachedAvailability"
      :aria-label="`Add ${product.name} to basket`" @click="addToBasket" />
    <div v-if="quantity > 0" class="artwork-card__quantity" role="group" :aria-label="`Quantity for ${product.name}`">
      <Button label="−" severity="secondary" :aria-label="`Decrease quantity of ${product.name}`"
        @click="decreaseQuantity" />
      <output :aria-label="`${product.name} quantity`">{{ quantity }}</output>
      <Button label="+" severity="secondary" :disabled="hasReachedAvailability"
        :aria-label="`Increase quantity of ${product.name}`" @click="increaseQuantity" />
    </div>
    <p v-if="quantity > 0 && hasReachedAvailability" class="artwork-card__limit typography typography--meta">
      Maximum available quantity selected.
    </p>
  </article>
</template>

<style scoped>
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

.artwork-card__selection,
.artwork-card__limit {
  margin: 0;
}

.artwork-card__quantity {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.artwork-card__quantity output {
  min-inline-size: 2ch;
  text-align: center;
}
</style>
