<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BlurReveal } from '@/components/ui/inspiria'

gsap.registerPlugin(ScrollTrigger)

const faqRef = ref(null)

const { data: content } = await useAsyncData('sharedFAQContent', () => queryContent('/shared/faq').findOne())

onMounted(() => {
  gsap.from(faqRef.value.children, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: faqRef.value,
      start: 'top 80%',
    },
  })
})
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-12 md:px-12">
    <h2 class="block font-bold text-3xl mb-8 text-center text-surface-900 dark:text-surface-0">
      {{ content.title }}
    </h2>
    <div ref="faqRef" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-8 md:gap-x-4 md:gap-y-8 lg:gap-8">
      <BlurReveal
        v-for="(item, index) in content.faqs"
        :key="index"
        :delay="index * 0.1"
        :duration="0.75"
        class="p-4 rounded-border h-full bg-surface-0 dark:bg-surface-900 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.03),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_2px_6px_0px_rgba(0,0,0,0.12)]"
      >
        <h3 class="font-medium text-xl text-surface-900 dark:text-surface-0 mb-4">
          {{ item.title }}
        </h3>
        <p class="text-surface-700 dark:text-surface-100 leading-normal">
          {{ item.description }}
        </p>
      </BlurReveal>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>