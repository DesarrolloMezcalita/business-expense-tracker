// This plugin initializes the Pinia stores when the app starts
import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(() => {
  // Import the user store
  const userStore = useUserStore();
  
  // Initialize the user store by fetching users
  userStore.fetchUsers();
  
  return {
    provide: {
      initStores: () => {
        // This function can be used to re-initialize stores if needed
        userStore.fetchUsers();
      }
    }
  };
});