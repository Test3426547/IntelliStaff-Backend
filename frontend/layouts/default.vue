<script setup lang="ts">
import { useHead } from '#app'
import { useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

// Navbar content
const { data: navbarContent } = await useAsyncData('navbarContent', () => queryContent('layout/navbar').findOne())

// Navbar content
const { data: footerContent } = await useAsyncData('footerContent', () => queryContent('layout/footer').findOne())

// SEO Optimization
const route = useRoute()
const title = ref(`${navbarContent.value?.businessName || 'IntelliStaff Solutions'} | Home`)
const description = ref('AI-powered recruitment platform revolutionizing hiring processes')

const metaImage = ref('/og-image.jpg') // Ensure this image exists in your public folder
const siteUrl = 'https://intellistaffsolutions.com' // Replace with your actual domain

onMounted(() => {
  // Update title based on route
  title.value = `${navbarContent.value?.businessName || 'IntelliStaff Solutions'} | ${route.name?.toString().charAt(0).toUpperCase() + route.name?.toString().slice(1) || 'Home'}`
})

const canonicalUrl = computed(() => `${siteUrl}${route.fullPath}`)

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${navbarContent.value?.businessName || 'IntelliStaff Solutions'}` : navbarContent.value?.businessName || 'IntelliStaff Solutions'
  },
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'author', content: navbarContent.value?.businessName || 'IntelliStaff Solutions' },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'og:type', content: 'website' },
    { name: 'og:url', content: canonicalUrl },
    { name: 'og:image', content: `${siteUrl}${metaImage.value}` },
    { name: 'og:site_name', content: navbarContent.value?.businessName || 'IntelliStaff Solutions' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: `${siteUrl}${metaImage.value}` },
    { name: 'robots', content: 'index, follow' },
    { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
    { name: 'bingbot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
    { name: 'keywords', content: 'recruitment, AI-powered hiring, job matching, talent acquisition, career opportunities' },
    { name: 'format-detection', content: 'telephone=no' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

// Dark mode toggle
const isDarkMode = ref(false)
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('color-scheme', isDarkMode.value ? 'dark' : 'light')
}

// Scroll to top button logic
const showScrollTopButton = ref(false)

const handleScroll = () => {
  showScrollTopButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Check for saved color scheme
  const savedScheme = localStorage.getItem('color-scheme')
  isDarkMode.value = savedScheme === 'dark' || (savedScheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDarkMode.value)
})
</script>

<template>
  <div :class="{ 'dark': isDarkMode }" class="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <header class="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow">
      <Navbar :items="navbarContent?.items" @toggle-dark-mode="toggleDarkMode" :is-dark-mode="isDarkMode" />
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-gray-100 dark:bg-gray-800">
      <Footer />
    </footer>

    <!-- Scroll to top button -->
    <button
      v-show="showScrollTopButton"
      @click="scrollToTop"
      class="fixed bottom-4 right-4 p-2 rounded-full bg-primary text-white shadow-lg transition-opacity duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      aria-label="Scroll to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </div>
</template>

<style>
/* Global styles */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom global styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
}

.dark {
  color-scheme: dark;
}
</style>