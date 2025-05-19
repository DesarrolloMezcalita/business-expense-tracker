// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: true },

  modules: [
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@pinia/nuxt",
  ],

  css: ["~/assets/css/main.css"],

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2024-11-27",

  app: {
    head: {
      title: "Mi SPA con Nuxt",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Una app tipo SPA con Nuxt" },
      ],
    },
  },
});
