import { useAuthStore } from '~/stores/auth';

/**
 * Middleware to prevent authenticated users from accessing guest-only pages
 * like login, register, etc.
 */
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  const isAuthenticated = await authStore.checkAuth();
  
  // If authenticated, redirect to home page
  if (isAuthenticated) {
    return navigateTo('/');
  }
});