<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { BlurReveal, RadiantText, GlowBorder } from '@/components/ui/inspiria'
import { Twitter, Facebook, Linkedin, Instagram } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const { data: footerContent } = await useAsyncData('footerContent', () => queryContent('/layout/footer').findOne())

const socialIcons = [
  { icon: Twitter, link: '#' },
  { icon: Facebook, link: '#' },
  { icon: Linkedin, link: '#' },
  { icon: Instagram, link: '#' }
]
</script>

<template>
  <BlurReveal :delay="0.2" :duration="0.75" class="w-full">
    <footer class="bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-200">
      <div class="container mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-2">
            <NuxtLink to="/" class="inline-block mb-6">
              <NuxtImg :src="isDark ? '/logo-dark.svg' : '/logo.svg'" width="134" height="78" alt="Logo" />
            </NuxtLink>
            <RadiantText class="text-xl font-semibold mb-4" :duration="5">
              {{ footerContent.businessName }}
            </RadiantText>
            <p class="mb-4">{{ footerContent.slogan }}</p>
            <p class="text-sm">© {{ new Date().getFullYear() }} {{ footerContent.businessName }}. All rights reserved.</p>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">{{ footerContent.mainMenuTitle }}</h3>
            <ul class="space-y-2">
              <li v-for="item in footerContent.mainMenu" :key="item.label">
                <NuxtLink :to="item.link" class="hover:text-primary transition-colors">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-4 text-surface-900 dark:text-surface-100">{{ footerContent.jobListingsTitle }}</h3>
            <ul class="space-y-2">
              <li v-for="item in footerContent.jobListingsMenu" :key="item.label">
                <NuxtLink :to="item.link" class="hover:text-primary transition-colors">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <ul class="flex space-x-4">
              <li v-for="item in footerContent.legalMenu" :key="item.label">
                <NuxtLink :to="item.link" class="text-sm hover:text-primary transition-colors">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div class="flex space-x-4">
            <GlowBorder v-for="(social, index) in socialIcons" :key="index" :color="['#10B981', '#34D399', '#6EE7B7']" class="rounded-full">
              <a :href="social.link" class="p-2 bg-surface-100 dark:bg-surface-800 rounded-full text-surface-900 dark:text-surface-100 hover:text-primary transition-colors">
                <component :is="social.icon" class="w-5 h-5" />
              </a>
            </GlowBorder>
          </div>
        </div>
      </div>
    </footer>
  </BlurReveal>
</template>