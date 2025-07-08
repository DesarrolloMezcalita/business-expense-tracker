<template>
  <UApp class="transition-colors duration-300 ease-in-out">
    <!-- Skip rendering the layout on auth pages -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup>
import { useColorMode } from "#imports";
import { onMounted, watch } from "vue";

const colorMode = useColorMode();

// Initialize color mode based on user preference or system preference
onMounted(() => {
  if (import.meta.client) {
    // Apply initial color mode class to html element for Tailwind dark mode
    updateHtmlClass();

    // Add transition class to prevent flash during theme change
    document.documentElement.classList.add(
      "transition-colors",
      "duration-300",
      "ease-in-out"
    );
  }
});

// Watch for color mode changes
watch(
  () => colorMode.value,
  () => {
    if (import.meta.client) {
      updateHtmlClass();
    }
  }
);

// Update HTML class based on current color mode for Tailwind dark mode
const updateHtmlClass = () => {
  if (import.meta.client) {
    if (colorMode.value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};
</script>