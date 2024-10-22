"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = defineNuxtConfig({
    ssr: true,
    devtools: { enabled: true },
    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxt/image',
        '@nuxt/content',
        'shadcn-nuxt',
        'nuxt-gtag',
        '@vueuse/motion/nuxt'
    ],
    plugins: [{ src: "~/plugins/clarity.js", mode: "client" }],
    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],
    runtimeConfig: {
        public: {
            NUXT_CLARITY_ID: process.env.NUXT_CLARITY_ID,
        },
    },
    tailwindcss: {
        cssPath: '~/assets/css/tailwind.css',
        configPath: 'tailwind.config.ts',
        exposeConfig: false,
        viewer: true,
    },
    build: {
        transpile: ['gsap'],
    },
    vite: {
        optimizeDeps: {
            exclude: ['fsevents']
        }
    },
    nitro: {
        esbuild: {
            options: {
                target: 'esnext'
            }
        }
    },
    compatibilityDate: '2024-10-18',
    watchers: {
        webpack: {
            ignored: /node_modules/,
        },
        chokidar: {
            usePolling: true,
            interval: 300,
        },
    },
});
//# sourceMappingURL=nuxt.config.js.map