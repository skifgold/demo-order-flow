<template>
  <main class="app-layout">
    <slot />
  </main>
</template>

<style scoped>
.app-layout {
  width: min(
    100% - (var(--layout-content-inline-padding) * 2),
    var(--layout-content-max-inline-size)
  );
  margin: 0 auto;
  padding: var(--layout-content-block-padding) 0;
}
</style>
