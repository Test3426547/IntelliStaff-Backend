<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const logoContainerRef = ref(null)

const { data: content } = await useAsyncData('homeLogosContent', () => queryContent('/home/logos').findOne())

// Dynamically import icon components
const iconComponents = {
  'Notion': defineAsyncComponent(() => import('@/components/ui/common/icons/NotionIcon.vue')),
  'GitHub': defineAsyncComponent(() => import('@/components/ui/common/icons/GitHubIcon.vue')),
  'Google': defineAsyncComponent(() => import('@/components/ui/common/icons/GoogleDriveIcon.vue')),
  'OpenAI': defineAsyncComponent(() => import('@/components/ui/common/icons/OpenAIIcon.vue')),
  'WhatsApp': defineAsyncComponent(() => import('@/components/ui/common/icons/WhatsAppIcon.vue')),
}

onMounted(() => {
  gsap.from(logoContainerRef.value.children, {
    opacity: 0,
    x: -50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: logoContainerRef.value,
      start: 'top 80%',
    },
  })
})
</script>

<template>
  <div class="bg-surface-0 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20">
    <div ref="logoContainerRef" class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
      <component
        v-for="logo in content.logos"
        :key="logo.name"
        :is="iconComponents[logo.name]"
        class="h-12 w-auto transition-all duration-300 filter grayscale opacity-50 hover:filter-none hover:opacity-100"
      />
    </div>
  </div>
</template>
