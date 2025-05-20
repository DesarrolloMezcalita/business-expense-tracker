// Mock users for testing
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  
  // Create a mock admin user if running in development mode
  if (import.meta.dev) {
    // Check if we already have a user in the store
    if (!authStore.isAuthenticated) {
      try {
        // Register a mock admin user if not already registered
        const mockUser = {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'Admin'
        };
        
        // Auto-login with the mock user
        await authStore.login(mockUser.email, mockUser.password).catch(async (error) => {
          // If login fails (user doesn't exist), register the user first
          if (error.message.includes('Invalid email or password')) {
            await authStore.register(mockUser);
          } else {
            console.error('Error logging in with mock user:', error.message);
          }
        });
        
        if (authStore.isAuthenticated) {
          console.log('Logged in with mock admin user for development');
        }
      } catch (error) {
        console.error('Error setting up mock user:', error.message);
      }
    }
  }
  
  return {
    provide: {
      // No need to provide anything, this plugin just sets up the mock user
    }
  };
});