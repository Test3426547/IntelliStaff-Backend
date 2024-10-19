<script setup>
import { useAsyncData } from '#app'
import HomeHeader from '@/components/views/home/HomeHeader.vue'
import HomeLogos from '@/components/views/home/HomeLogos.vue'
import HomeFeature from '@/components/views/home/HomeFeature.vue'
import SharedBlog from '@/components/shared/SharedBlog.vue'
import SharedCTA from '@/components/shared/SharedCTA.vue'
import SharedContactForm from '@/components/shared/SharedContactForm.vue'
import SharedFAQ from '@/components/shared/SharedFAQ.vue'

// Fetch all necessary content
const { data: headerContent } = await useAsyncData('headerContent', () => queryContent('/home/header').findOne())
const { data: logosContent } = await useAsyncData('logosContent', () => queryContent('/home/logos').findOne())
const { data: featureContent } = await useAsyncData('featureContent', () => queryContent('/home/feature').findOne())
const { data: blogContent } = await useAsyncData('blogContent', () => queryContent('/shared/blog').findOne())
const { data: ctaContent } = await useAsyncData('ctaContent', () => queryContent('/shared/cta').findOne())
const { data: contactFormContent } = await useAsyncData('contactFormContent', () => queryContent('/shared/contact-form').findOne())
const { data: faqContent } = await useAsyncData('faqContent', () => queryContent('/shared/faq').findOne())
</script>

<template>
  <main>
    <HomeHeader v-if="headerContent" :content="headerContent" />
    <HomeLogos v-if="logosContent" :content="logosContent" />
    <HomeFeature v-if="featureContent" :content="featureContent" />
    <SharedBlog v-if="blogContent" :content="blogContent" />
    <SharedCTA v-if="ctaContent" :content="ctaContent" />
    <SharedContactForm v-if="contactFormContent" :content="contactFormContent" />
    <SharedFAQ v-if="faqContent" :content="faqContent" />
  </main>
</template>

<style scoped>
/* Add any page-specific styles here */
</style>