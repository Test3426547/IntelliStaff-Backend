<script setup lang="ts">
import { ref, computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { BlurReveal, RadiantText, GlowBorder } from '@/components/ui/inspiria'
import { Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const hoveredItem = ref(null)
const selectedItem = ref(null)

const activeItem = computed(() => hoveredItem.value || selectedItem.value)

const setActiveItem = (item) => {
  if (item?.subMenu) {
    hoveredItem.value = item
    selectedItem.value = item
  } else {
    hoveredItem.value = null
    selectedItem.value = null
  }
}

const closeMenu = () => {
  hoveredItem.value = null
  selectedItem.value = null
}

const selectedCategory = ref(0)
const { data: navItems } = await useAsyncData('navItems', () => queryContent('/layout/navbar').findOne())

const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <BlurReveal :delay="0.2" :duration="0.75" class="w-full">
    <nav class="relative w-full flex items-center px-8 lg:px-20 gap-6 py-6 lg:py-2 bg-surface-0 dark:bg-surface-950" @mouseleave="closeMenu">
      <NuxtLink to="/" class="relative z-20 flex items-center gap-4">
        <NuxtImg :src="isDark ? '/logo-dark.svg' : '/logo.svg'" width="35" height="35" alt="Logo" />
        <RadiantText class="text-surface-900 dark:text-surface-0 text-lg font-semibold" :duration="5">
          {{ navItems.businessName }}
        </RadiantText>
      </NuxtLink>

      <button @click="toggleColorMode" class="p-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-0">
        <Sun v-if="isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>

      <div class="flex-1 hidden lg:flex items-center justify-between">
        <ul class="flex items-center gap-8">
          <li v-for="item in navItems.items" :key="item.label" class="relative">
            <button
              @mouseenter="setActiveItem(item)"
              @click="setActiveItem(item)"
              class="font-medium text-surface-700 dark:text-surface-300 hover:text-primary p-2"
            >
              {{ item.label }}
            </button>
            <div
              v-if="item.subMenu && activeItem?.label === item.label"
              class="absolute top-full left-0 bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg p-4 animate-fadein"
            >
              <NuxtLink
                v-for="subItem in item.subMenu"
                :key="subItem.label"
                :to="subItem.to"
                class="block p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded"
              >
                {{ subItem.label }}
              </NuxtLink>
            </div>
          </li>
        </ul>

        <div class="flex items-center gap-4">
          <button class="px-4 py-2 text-surface-700 dark:text-surface-300">Login</button>
          <GlowBorder :color="['#10B981', '#34D399', '#6EE7B7']" class="rounded-lg">
            <button class="px-4 py-2 bg-primary text-white font-medium rounded-lg">Register</button>
          </GlowBorder>
        </div>
      </div>

      <button class="lg:hidden ml-auto text-surface-700 dark:text-surface-300">
        <i class="pi pi-bars text-2xl" />
      </button>
    </nav>
  </BlurReveal>
</template>

<style scoped>
/* Add any additional styles here */
</style>