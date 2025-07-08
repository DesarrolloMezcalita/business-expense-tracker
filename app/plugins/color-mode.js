// Plugin to handle color mode persistence and initialization
export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode();

  // Function to get stored preference from localStorage
  const getStoredPreference = () => {
    if (import.meta.client) {
      // Always default to 'light' if no preference is stored
      return localStorage.getItem('nuxt-color-mode') || 'light';
    }
    return 'light';
  };

  // We no longer need the system preference detection since we're ignoring it

  // Initialize color mode on client side
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      // Force light mode as default
      colorMode.value = 'light';
      
      // Get stored preference (will default to 'light')
      const storedPreference = getStoredPreference();
      
      // If there's a stored preference, use it (but ignore system preference)
      if (storedPreference !== 'system') {
        colorMode.value = storedPreference;
      }
      
      // If no preference is set or it's set to 'system', force 'light' mode
      if (!storedPreference || storedPreference === 'system') {
        colorMode.preference = 'light';
        localStorage.setItem('nuxt-color-mode', 'light');
      } else {
        // Otherwise use the stored preference
        colorMode.preference = storedPreference;
      }
      
      // We're ignoring system preference changes as requested
      // No need to listen for system preference changes
    });
  }

  // Watch for preference changes and save to localStorage
  watch(() => colorMode.preference, (newPreference) => {
    if (import.meta.client) {
      // If user tries to set to 'system', force 'light' mode instead
      if (newPreference === 'system') {
        colorMode.preference = 'light';
        localStorage.setItem('nuxt-color-mode', 'light');
        colorMode.value = 'light';
      } else {
        // Otherwise save the preference and update the value
        localStorage.setItem('nuxt-color-mode', newPreference);
        colorMode.value = newPreference;
      }
    }
  });
});