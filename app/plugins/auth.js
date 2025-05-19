import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async () => {
  // Initialize auth state
  const authStore = useAuthStore();
  
  // Check if user is authenticated on app startup
  await authStore.checkAuth();
  
  // Add auth state to the Nuxt context
  return {
    provide: {
      auth: {
        isAuthenticated: () => authStore.isAuthenticated,
        currentUser: () => authStore.currentUser,
        userRole: () => authStore.userRole,
        isAdmin: () => authStore.isAdmin,
        isEditor: () => authStore.isEditor,
        isUser: () => authStore.isUser,
      }
    }
  };
});