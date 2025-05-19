import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';

/**
 * User store for managing users
 * @typedef {import('~/types/user').User} User
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === id);
    },
    
    getUsersByRole: (state) => (role) => {
      return state.users.filter(user => user.role === role);
    },
    
    activeUsers: (state) => {
      return state.users.filter(user => user.is_active === true);
    },
    
    inactiveUsers: (state) => {
      return state.users.filter(user => user.is_active === false);
    },
    
    totalUsers: (state) => {
      return state.users.length;
    }
  },

  actions: {
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Fetch users from Supabase
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        
        this.users = data || [];
        
        // If no users exist in the database, seed with initial data
        if (this.users.length === 0) {
          await this.seedInitialUsers();
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch users';
        console.error('Error fetching users:', error);
        
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
          email: 'john.doe@example.com',
          password: 'hashed_password_here', // In a real app, this would be properly hashed
          role: 'Admin',
          is_active: true,
          is_deleted: false,
          created_at: '2025-01-15T08:30:00.000Z',
          updated_at: '2025-01-15T08:30:00.000Z'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          password: 'hashed_password_here', // In a real app, this would be properly hashed
          role: 'User',
          is_active: true,
          is_deleted: false,
          created_at: '2025-02-20T10:15:00.000Z',
          updated_at: '2025-02-20T10:15:00.000Z'
        },
        {
          id: '3',
          name: 'Robert Johnson',
          email: 'robert.johnson@example.com',
          password: 'hashed_password_here', // In a real app, this would be properly hashed
          role: 'Editor',
          is_active: false,
          is_deleted: false,
          created_at: '2025-03-10T14:45:00.000Z',
          updated_at: '2025-03-10T14:45:00.000Z'
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          password: 'hashed_password_here', // In a real app, this would be properly hashed
          role: 'User',
          is_active: true,
          is_deleted: false,
          created_at: '2025-03-25T09:20:00.000Z',
          updated_at: '2025-03-25T09:20:00.000Z'
        },
        {
          id: '5',
          name: 'Michael Wilson',
          email: 'michael.wilson@example.com',
          password: 'hashed_password_here', // In a real app, this would be properly hashed
          role: 'Admin',
          is_active: true,
          is_deleted: false,
          created_at: '2025-04-05T11:30:00.000Z',
          updated_at: '2025-04-05T11:30:00.000Z'
        }
      ];
      
      this.users = mockUsers;
      console.log('Using mock data as fallback');
    },
    
    async addUser(userData) {
      try {
        const now = new Date().toISOString();
        // Format the data for Supabase (snake_case)
        const newUser = {
          name: userData.name,
          email: userData.email,
          password: userData.password, // In a real app, this would be properly hashed
          role: userData.role,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          is_deleted: userData.is_deleted !== undefined ? userData.is_deleted : false,
          created_at: userData.created_at || now,
          updated_at: userData.updated_at || now
        };
        
        // Insert the new user into Supabase
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('profiles')
          .insert(newUser)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add the new user to the local state
          this.users.push(data[0]);
          return data[0];
        }
        
        throw new Error('Failed to add user: No data returned');
      } catch (error) {
        this.error = error.message || 'Failed to add user';
        console.error('Error adding user:', error);
        
        // Fallback to local operation if Supabase fails
        const newId = this.users.length > 0
          ? String(Math.max(...this.users.map(user => parseInt(user.id))) + 1)
          : '1';
        
        const newUser = {
          id: newId,
          ...userData,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString()
        };
        
        this.users.push(newUser);
        return newUser;
      }
    },
    
    async updateUser(userData) {
      try {
        // Format the data for Supabase (snake_case)
        const updatedUser = {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          is_active: userData.is_active,
          is_deleted: userData.is_deleted,
          updated_at: new Date().toISOString()
        };
        
        // Update the user in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('profiles')
          .update(updatedUser)
          .eq('id', userData.id);
        
        if (error) throw error;
        
        // Update the user in the local state
        const index = this.users.findIndex(user => user.id === userData.id);
        
        if (index === -1) {
          throw new Error(`User with ID ${userData.id} not found`);
        }
        
        this.users[index] = {
          ...this.users[index],
          ...updatedUser
        };
        
        return this.users[index];
      } catch (error) {
        this.error = error.message || 'Failed to update user';
        console.error('Error updating user:', error);
        
        // Fallback to local operation if Supabase fails
        const index = this.users.findIndex(user => user.id === userData.id);
        
        if (index === -1) {
          throw new Error(`User with ID ${userData.id} not found`);
        }
        
        this.users[index] = {
          ...this.users[index],
          ...userData
        };
        
        return this.users[index];
      }
    },
    
    async deleteUser(userId) {
      try {
        // Delete the user from Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        
        // Remove the user from the local state
        const index = this.users.findIndex(user => user.id === userId);
        
        if (index === -1) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        this.users.splice(index, 1);
        
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to delete user';
        console.error('Error deleting user:', error);
        
        // Fallback to local operation if Supabase fails
        const index = this.users.findIndex(user => user.id === userId);
        
        if (index === -1) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        this.users.splice(index, 1);
        
        return true;
      }
    },
    
    // Additional utility methods
    async setUserActive(userId, isActive) {
      try {
        // Update the user active status in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('profiles')
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
        console.error(`Failed to update active status for user ${userId}:`, error);
        
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
        // Update the user deleted status in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('profiles')
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
        console.error(`Failed to update deleted status for user ${userId}:`, error);
        
        // Fallback to local operation
        const user = this.getUserById(userId);
        
        if (user) {
          user.is_deleted = isDeleted;
          user.updated_at = new Date().toISOString();
        }
      }
    },
    
    async bulkDeleteUsers(userIds) {
      for (const id of userIds) {
        try {
          await this.deleteUser(id);
        } catch (error) {
          console.error(`Failed to delete user ${id}:`, error);
        }
      }
    }
  }
});