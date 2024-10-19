<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CardContainer, CardBody, CardItem } from "@/components/ui/inspiria"

gsap.registerPlugin(ScrollTrigger)

const formRef = ref(null)
const cardRef = ref(null)

const { data: content } = await useAsyncData('sharedContactFormContent', () => queryContent('/shared/contact-form').findOne())

const contact = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: ''
})

onMounted(() => {
  gsap.from(formRef.value.children, {
    opacity: 0,
    y: -50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: formRef.value,
      start: 'top 80%',
    },
  })

  gsap.from(cardRef.value, {
    opacity: 0,
    y: -50,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: cardRef.value,
      start: 'top 80%',
    },
  })
})
</script>

<template>
  <div class="bg-surface-0 dark:bg-surface-950">
    <div class="flex lg:flex-row flex-col">
      <div class="relative overflow-hidden flex-1 p-8 sm:p-12 xl:p-20">
        <NuxtImg class="absolute top-0 left-0 w-full h-full object-cover" :src="content.backgroundImage" :alt="content.imageAlt" />
        <div ref="cardRef" class="relative z-20">
          <CardContainer>
            <CardBody class="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
              <CardItem :translateZ="50" class="text-3xl font-medium mb-12 text-neutral-600 dark:text-white">
                {{ content.title }}
              </CardItem>
              <CardItem as="p" :translateZ="60" class="text-gray-300 leading-normal mb-12 dark:text-neutral-300">
                {{ content.description }}
              </CardItem>
              <CardItem :translateZ="70" as="a" :href="content.mapLink" target="_blank" class="inline-flex items-center text-primary-400 font-bold no-underline cursor-pointer">
                <span class="mr-4">{{ content.mapLinkText }}</span>
                <i class="pi pi-arrow-right" />
              </CardItem>
              <CardItem :translateZ="80" as="ul" class="list-none p-0 m-0 mt-12 text-neutral-600 dark:text-white">
                <li v-for="(item, index) in content.contactInfo" :key="index" class="flex items-center mb-4">
                  <i :class="`pi ${item.icon} mr-2`" />
                  <span>{{ item.text }}</span>
                </li>
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </div>
      <div ref="formRef" class="flex-1 p-8 sm:p-12 xl:p-20 flex flex-col gap-6">
        <div class="w-full flex items-center gap-3">
          <InputText v-model="contact.first_name" class="w-full flex-1" type="text" :placeholder="content.form.firstName" />
          <InputText v-model="contact.last_name" class="w-full flex-1" type="text" :placeholder="content.form.lastName" />
        </div>
        <InputText v-model="contact.email" class="w-full" type="text" :placeholder="content.form.email" />
        <InputText v-model="contact.phone" class="w-full" type="text" :placeholder="content.form.phone" />
        <Textarea v-model="contact.message" rows="5" cols="30" :placeholder="content.form.message" />
        <div class="w-full text-right">
          <Button type="button" :label="content.form.submitButton" icon="pi pi-envelope" class="px-8 py-4 w-auto" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>