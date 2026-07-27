<script setup lang="ts">
import Button from 'primevue/button'

defineEmits<{ retry: [] }>()
</script>

<template>
  <section class="catalogue-error" role="alert" aria-labelledby="catalogue-error-title">
    <h2 id="catalogue-error-title">We could not load the catalogue</h2>
    <p>Please check your connection and try again.</p>
    <Button severity="contrast" label="Try again" @click="$emit('retry')" />
  </section>
</template>
