<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CardSpotlight, HyperText } from '@/components/ui/inspiria'
import { useColorMode } from '@vueuse/core'

gsap.registerPlugin(ScrollTrigger)

const featureRef = ref(null)
const isDark = computed(() => useColorMode().value === 'dark')

const { data: content } = await useAsyncData('homeFeatureContent', () => queryContent('/home/feature').findOne())

onMounted(() => {
  gsap.from(featureRef.value.children, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: featureRef.value,
      start: 'top 80%',
    },
  })
})
</script>

<template>
  <div ref="featureRef" class="bg-surface-0 px-6 py-20 md:px-12 lg:px-20 dark:bg-surface-950 overflow-hidden">
    <HyperText :text="content.title" class="text-surface-900 font-bold text-center text-5xl mb-4 dark:text-surface-0" :duration="800" />
    <HyperText :text="content.description" class="text-xl leading-7 text-surface-600 dark:text-surface-400 text-center max-w-[96%] lg:max-w-[75%] mx-auto mb-14" :duration="800" />
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <CardSpotlight
        v-for="feature in content.features"
        :key="feature.title"
        class="p-6 bg-surface-50 dark:bg-surface-800 rounded-xl cursor-pointer"
        :gradientColor="isDark ? '#363636' : '#C9C9C9'"
      >
        <span class="w-[3.25rem] h-[3.25rem] bg-surface-900 dark:bg-surface-0 flex items-center justify-center rounded-lg mb-6">
          <NuxtImg :src="feature.icon" class="w-[1.8rem] h-[1.8rem]" :alt="feature.title" />
        </span>
        <HyperText :text="feature.title" class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-3" :duration="800" />
        <HyperText :text="feature.description" class="text-surface-600 dark:text-surface-400 text-lg leading-6" :duration="800" />
      </CardSpotlight>
    </div>
  </div>
</template>