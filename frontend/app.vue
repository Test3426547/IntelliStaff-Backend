<template>
  <div id="app" class="font-inter">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'

// Global head meta
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'format-detection', content: 'telephone=no' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    },
  ],
})

// Error handling
const handleError = (error: any) => {
  console.error('Global error handler:', error)
  // You can add more error handling logic here
}

// Lifecycle hooks
onMounted(() => {
  console.log('App mounted')
})
</script>

<style>
html, body {
  font-family: 'Inter', sans-serif;
}

#app {
  @apply min-h-screen flex flex-col;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>