<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button, BubblesBg } from '@/components/ui/inspiria'

gsap.registerPlugin(ScrollTrigger)

const ctaRef = ref(null)

const { data: content } = await useAsyncData('sharedCTAContent', () => queryContent('/shared/cta').findOne())

onMounted(() => {
  gsap.from(ctaRef.value.children, {
    opacity: 0,
    y: -50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: ctaRef.value,
      start: 'top 80%',
    },
  })
})
</script>

<template>
  <div class="relative bg-surface-900 p-20 flex justify-center md:justify-end overflow-hidden">
    <BubblesBg class="absolute inset-0 w-full h-full" />
    <div ref="ctaRef" class="relative z-10 px-8">
      <h2 class="text-white font-bold text-6xl">{{ content.title1 }}</h2>
      <h2 class="text-primary-200 font-bold text-6xl">{{ content.title2 }}</h2>
      <p class="mt-4 mb-8 text-gray-200 font-medium leading-normal">{{ content.description }}</p>
      <Button @click="content.buttonAction">
        <span class="font-bold">{{ content.buttonText }}</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>