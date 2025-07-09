import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';
import { useAuthStore } from '~/stores/auth';

/**
 * User store for managing users
 * @typedef {import('~/types/wauser').WAUser} WAUser
 */
export const useWAUserStore = defineStore('wauser', {
  state: () => ({
    wausers: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getUserById: (state) => (id) => {
      return state.wausers.find(user => user.id === id);
    },
    
    activeUsers: (state) => {
      return state.wausers.filter(user => user.is_active === true);
    },
    
    inactiveUsers: (state) => {
      return state.wausers.filter(user => user.is_active === false);
    },
    
    totalUsers: (state) => {
      return state.wausers.length;
    }
  },

  actions: {
    // Helper method to check if current user has admin permissions
    checkAdminPermission() {
      const authStore = useAuthStore();
      if (!authStore.isAdmin) {
        throw new Error('Permission denied: Admin privileges required for WhatsApp user management');
      }
      return true;
    },
    
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Fetch users from Supabase
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('wa_profiles')
          .select('id, name, phone, is_active, created_at, updated_at')
          .order('id', { ascending: true });
        
        if (error) throw error;
        
        this.wausers = data || [];
      } catch (error) {
        this.error = error.message || 'Failed to fetch wa users';
        console.error('Error fetching wa users:', error);
        
        // Fallback to mock data if Supabase connection fails
        await this.useMockData();
      } finally {
        this.isLoading = false;
      }
    },
    
    async useMockData() {
      // Mock data as fallback
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          phone: 5555555555,
          is_active: true,
          created_at: '2025-01-15T08:30:00.000Z'
        },
        {
          id: '2',
          name: 'Jane Smith',
          phone: 5555555555,
          is_active: true,
          created_at: '2025-02-20T10:15:00.000Z'
        },
        {
          id: '3',
          name: 'Robert Johnson',
          phone: 5555555555,
          is_active: false,
          created_at: '2025-03-10T14:45:00.000Z'
        },
        {
          id: '4',
          name: 'Emily Davis',
          phone: 5555555555,
          is_active: true,
          created_at: '2025-03-25T09:20:00.000Z'
        },
        {
          id: '5',
          name: 'Michael Wilson',
          phone: 5555555555,
          is_active: true,
          created_at: '2025-04-05T11:30:00.000Z'
        }
      ];
      
      this.wausers = mockUsers;
      console.log('Using mock data as fallback');
    },
    
    async addUser(userData) {
      try {
        // Check if user has admin permissions
        this.checkAdminPermission();
        
        const now = new Date().toISOString();
        // Format the data for Supabase (snake_case)
        const newUser = {
          name: userData.name,
          phone: userData.phone,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          is_deleted: userData.is_deleted !== undefined ? userData.is_deleted : false,
          created_at: userData.created_at || now,
          updated_at: userData.updated_at || now
        };
        
        // Insert the new user into Supabase
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('wa_profiles')
          .insert(newUser)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add the new user to the local state
          this.wausers.push(data[0]);
          return data[0];
        }
        
        throw new Error('Failed to add wa user: No data returned');
      } catch (error) {
        this.error = error.message || 'Failed to add wa user';
        console.error('Error adding wa user:', error);
        
        // Fallback to local operation if Supabase fails
        const newId = this.wausers.length > 0
          ? String(Math.max(...this.wausers.map(user => parseInt(user.id))) + 1)
          : '1';
        
        const newUser = {
          id: newId,
          ...userData,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString()
        };
        
        this.wausers.push(newUser);
        return newUser;
      }
    },
    
    async updateUser(userData) {
      try {
        // Check if user has admin permissions
        this.checkAdminPermission();
        
        // Format the data for Supabase (snake_case)
        const updatedUser = {
          name: userData.name,
          phone: userData.phone,
          is_active: userData.is_active,
          is_deleted: userData.is_deleted,
          updated_at: new Date().toISOString()
        };
        
        // Update the user in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('wa_profiles')
          .update(updatedUser)
          .eq('id', userData.id);
        
        if (error) throw error;
        
        // Update the user in the local state
        const index = this.wausers.findIndex(user => user.id === userData.id);
        
        if (index === -1) {
          throw new Error(`WAUser with ID ${userData.id} not found`);
        }
        
        this.wausers[index] = {
          ...this.wausers[index],
          ...updatedUser
        };
        
        return this.wausers[index];
      } catch (error) {
        this.error = error.message || 'Failed to update wa user';
        console.error('Error updating wa user:', error);
        
        // Fallback to local operation if Supabase fails
        const index = this.wausers.findIndex(user => user.id === userData.id);
        
        if (index === -1) {
          throw new Error(`WAUser with ID ${userData.id} not found`);
        }
        
        this.wausers[index] = {
          ...this.wausers[index],
          ...userData
        };
        
        return this.wausers[index];
      }
    },
    
    async deleteUser(userId) {
      try {
        // Check if user has admin permissions
        this.checkAdminPermission();
        
        // Delete the user from Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('wa_profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        
        // Remove the user from the local state
        const index = this.wausers.findIndex(user => user.id === userId);
        
        if (index === -1) {
          throw new Error(`WAUser with ID ${userId} not found`);
        }
        
        this.wausers.splice(index, 1);
        
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to delete wa user';
        console.error('Error deleting wa user:', error);
        
        // Fallback to local operation if Supabase fails
        const index = this.wausers.findIndex(user => user.id === userId);
        
        if (index === -1) {
          throw new Error(`WAUser with ID ${userId} not found`);
        }
        
        this.wausers.splice(index, 1);
        
        return true;
      }
    },
    
    // Additional utility methods
    async setUserActive(userId, isActive) {
      try {
        // Check if user has admin permissions
        this.checkAdminPermission();
        
        // Update the user active status in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('wa_profiles')
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) throw error;
        
        // Update the user status in the local state
        const user = this.getUserById(userId);
        
        if (user) {
          user.is_active = isActive;
          user.updated_at = new Date().toISOString();
        }
      } catch (error) {
        console.error(`Failed to update active status for wa user ${userId}:`, error);
        
        // Fallback to local operation
        const user = this.getUserById(userId);
        
        if (user) {
          user.is_active = isActive;
          user.updated_at = new Date().toISOString();
        }
      }
    },
    
    async setUserDeleted(userId, isDeleted) {
      try {
        // Check if user has admin permissions
        this.checkAdminPermission();
        
        // Update the user deleted status in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('wa_profiles')
          .update({
            is_deleted: isDeleted,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) throw error;
        
        // Update the user status in the local state
        const user = this.getUserById(userId);
        
        if (user) {
          user.is_deleted = isDeleted;
          user.updated_at = new Date().toISOString();
        }
      } catch (error) {
        console.error(`Failed to update deleted status for wa user ${userId}:`, error);
        
        // Fallback to local operation
        const user = this.getUserById(userId);
        
        if (user) {
          user.is_deleted = isDeleted;
          user.updated_at = new Date().toISOString();
        }
      }
    },
    
    async bulkDeleteUsers(userIds) {
      // Check if user has admin permissions
      this.checkAdminPermission();
      
      for (const id of userIds) {
        try {
          await this.deleteUser(id);
        } catch (error) {
          console.error(`Failed to delete wa user ${id}:`, error);
        }
      }
    }
  }
});