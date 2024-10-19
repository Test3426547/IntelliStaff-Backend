<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GlowBorder, Confetti } from '@/components/ui/inspiria'
import { useColorMode } from '@vueuse/core'

gsap.registerPlugin(ScrollTrigger)

const blogRef = ref(null)
const isDark = computed(() => useColorMode().value === 'dark')

const { data: blogs } = await useAsyncData('sharedBlogContent', () => queryContent('/shared/blog').findOne())

onMounted(() => {
  gsap.from(blogRef.value.children, {
    opacity: 0,
    x: -50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: blogRef.value,
      start: 'top 80%',
    },
  })
})

const triggerFireworks = () => {
  const duration = 5 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      clearInterval(interval)
      return
    }

    const particleCount = 50 * (timeLeft / duration)

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}

const meteors = computed(() => Array(20).fill(null).map(() => ({
  left: `${Math.floor(Math.random() * (400 - -400) + -400)}px`,
  animationDelay: `${Math.random() * (0.8 - 0.2) + 0.2}s`,
  animationDuration: `${Math.floor(Math.random() * (10 - 2) + 2)}s`,
})))
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-10 xl:px-20">
    <h2 class="font-bold text-3xl lg:text-5xl text-surface-900 dark:text-surface-0 mb-12 text-center">
      Featured Articles
    </h2>
    <div ref="blogRef" class="flex flex-col lg:flex-row gap-10 lg:gap-4 xl:gap-12">
      <GlowBorder
        v-for="(item, index) in blogs"
        :key="index"
        class="relative w-full h-60 lg:h-40"
      >
        <NuxtImg
          v-if="item.cover"
          :src="item.cover"
          :alt="item.title"
          class="block w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <span
              v-for="(meteor, i) in meteors"
              :key="i"
              class="absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]"
              :class="{ 'invert': !isDark }"
              :style="{
                top: '0px',
                left: meteor.left,
                animationDelay: meteor.animationDelay,
                animationDuration: meteor.animationDuration,
              }"
            />
          </div>
        </div>
        <div class="p-6">
          <span
            :class="{
              'text-blue-600': item.color === 'blue',
              'text-orange-600': item.color === 'orange',
              'text-pink-600': item.color === 'pink',
              'text-primary': !['blue', 'orange', 'pink'].includes(item.color),
            }"
            class="text-xl block font-medium mb-2"
          >
            {{ item.category }}
          </span>
          <div class="flex items-start gap-2" v-if="item.author">
            <Avatar
              v-if="item.author.image"
              :image="item.author.image"
              :alt="item.author.name"
              shape="circle"
              size="large"
            />
            <div>
              <div class="text-sm font-bold text-surface-900 dark:text-surface-0 mb-1">
                {{ item.author.name }}
              </div>
              <div class="text-sm flex items-center text-surface-700 dark:text-surface-200 gap-2">
                <i class="pi pi-calendar text-sm" />
                <span>{{ item.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </GlowBorder>
    </div>
  </div>
</template>

<style scoped>
@keyframes meteor {
  0% {
    transform: rotate(215deg) translateX(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(215deg) translateX(-500px);
    opacity: 0;
  }
}

.animate-meteor {
  animation: meteor 5s linear infinite;
}
</style>
