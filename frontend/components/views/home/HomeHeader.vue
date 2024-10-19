<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { Globe, TextGenerateEffect, ShimmerButton } from '@/components/ui/inspiria'

const headerRef = ref(null)

const { data: content } = await useAsyncData('headerHomeContent', () => queryContent('/home/header').findOne())

onMounted(() => {
  gsap.from(headerRef.value.children, {
    opacity: 0,
    y: -20,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out'
  })
})
</script>

<template>
  <div ref="headerRef" class="p-12 text-center bg-gradient-to-t from-primary/10 from-10% to-transparent">
    <ShimmerButton class="bg-surface-900 dark:bg-surface-0 text-surface-0 dark:text-surface-900 p-2 mx-auto mb-6 rounded-full max-w-64">
      <span class="text-sm font-medium">{{ content.topPill }}</span>
    </ShimmerButton>

    <div class="mb-6">
      <TextGenerateEffect
        :words="content.mainHeading"
        class="text-4xl md:text-6xl text-surface-900 dark:text-surface-0 font-bold"
      />
    </div>

    <div class="mb-6">
      <TextGenerateEffect
        :words="content.subHeading"
        class="text-4xl md:text-6xl text-primary font-bold"
      />
    </div>

    <ShimmerButton class="shadow-2xl font-extrabold">
      <span class="text-lg text-white dark:text-surface-900">
        {{ content.ctaText }}
      </span>
    </ShimmerButton>

    <div class="mt-12 -mb-12">
      <div class="relative flex flex-col items-center justify-center overflow-hidden rounded-lg border bg-background px-4 md:px-40 pb-40 pt-8 md:pb-60 md:shadow-xl">
        <Globe class="w-full max-w-3xl" />
        <div class="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
      </div>
    </div>
  </div>
</template>