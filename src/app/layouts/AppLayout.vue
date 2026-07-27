<template>
  <main class="app-layout">
    <slot />
  </main>
</template>

<style scoped>
.app-layout {
  width: min(100% - 2rem, 72rem);
  margin: 0 auto;
  padding: 2rem 0;
}
</style>
