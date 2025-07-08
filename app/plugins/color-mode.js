// Plugin to handle color mode persistence and initialization
export default defineNuxtPlugin((nuxtApp) => {
  const colorMode = useColorMode();

  // Function to get stored preference from localStorage
  const getStoredPreference = () => {
    if (import.meta.client) {
      return localStorage.getItem('nuxt-color-mode') || 'system';
    }
    return 'system';
  };

  // Function to detect system preference
  const getSystemPreference = () => {
    if (import.meta.client && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Initialize color mode on client side
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      // Get stored preference
      const storedPreference = getStoredPreference();
      
      // If preference is 'system', use system preference
      if (storedPreference === 'system') {
        colorMode.value = getSystemPreference();
      } else {
        colorMode.value = storedPreference;
      }
      
      // Set preference
      colorMode.preference = storedPreference;
      
      // Listen for system preference changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
          if (colorMode.preference === 'system') {
            colorMode.value = e.matches ? 'dark' : 'light';
          }
        };
        
        // Add event listener
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
        } else if (mediaQuery.addListener) {
          // Fallback for older browsers
          mediaQuery.addListener(handleChange);
        }
      }
    });
  }

  // Watch for preference changes and save to localStorage
  watch(() => colorMode.preference, (newPreference) => {
    if (import.meta.client) {
      localStorage.setItem('nuxt-color-mode', newPreference);
      
      // Update value based on preference
      if (newPreference === 'system') {
        colorMode.value = getSystemPreference();
      } else {
        colorMode.value = newPreference;
      }
    }
  });
});