export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    // Primary and neutral colors for the application
    colors: {
      neutral: "slate",
    },
    // Dark mode configuration
    dark: true,
    // Color mode configuration
    colorMode: {
      preference: "light", // default value of $colorMode.preference (ignoring system preference)
      fallback: "light", // fallback value if not system preference found
      classSuffix: "", // optional suffix for color-mode classes
      storageKey: "nuxt-color-mode", // localStorage key
    },
  },
});
