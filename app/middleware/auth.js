import { useAuthStore } from '~/stores/auth';

/**
 * Middleware to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  const isAuthenticated = await authStore.checkAuth();
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return navigateTo('/auth');
  }
});