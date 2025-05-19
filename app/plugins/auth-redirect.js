import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Add global navigation guard
  nuxtApp.hook('page:start', async () => {
    const route = useRoute();
    
    // Skip redirect for auth page and other public pages
    const publicPages = ['/auth'];
    const isPublicPage = publicPages.includes(route.path);
    
    // Check if user is authenticated
    const isAuthenticated = await authStore.checkAuth();
    
    // If not authenticated and not on a public page, redirect to login
    if (!isAuthenticated && !isPublicPage) {
      // Store the original path to redirect back after login
      sessionStorage.setItem('redirectPath', route.fullPath);
      
      // Redirect to login page
      router.push('/auth');
    }
  });

  // Handle 404 errors and other errors
  nuxtApp.hook('app:error', () => {
    // Check if user is authenticated
    const isAuthenticated = authStore.isAuthenticated;
    
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      // Store current path for potential redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth') {
        sessionStorage.setItem('redirectPath', currentPath);
        router.push('/auth');
      }
    }
  });

  // Handle route changes to catch non-existent routes
  router.beforeEach(async (to) => {
    // Skip for auth page
    if (to.path === '/auth') {
      return true;
    }
    
    // Check if user is authenticated
    const isAuthenticated = await authStore.checkAuth();
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store the target path for redirect after login
      sessionStorage.setItem('redirectPath', to.fullPath);
      return '/auth';
    }
  });
  
  // Provide auth utilities to the app
  return {
    provide: {
      authRedirect: {
        // Function to redirect to the original path after login
        redirectBack: () => {
          const redirectPath = sessionStorage.getItem('redirectPath') || '/';
          sessionStorage.removeItem('redirectPath');
          return router.push(redirectPath);
        }
      }
    }
  };
});