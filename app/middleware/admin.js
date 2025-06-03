import { useAuthStore } from '~/stores/auth';

/**
 * Middleware to protect routes that require admin privileges
 * Redirects to home page if user is not an admin
 */
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  const isAuthenticated = await authStore.checkAuth();
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return navigateTo('/auth');
  }
  
  // If authenticated but not admin, redirect to home page
  if (!authStore.isAdmin) {
    console.warn('Access denied: Admin privileges required');
    return navigateTo('/');
  }
});