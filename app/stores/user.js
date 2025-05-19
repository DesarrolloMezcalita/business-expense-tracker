import { defineStore } from 'pinia';

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
      return state.users.filter(user => user.status === 'Active');
    },
    
    inactiveUsers: (state) => {
      return state.users.filter(user => user.status === 'Inactive');
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
        // In a real application, this would be an API call
        // For this demo, we'll use mock data
        const mockUsers = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            status: 'Active',
            address: '123 Main St, Anytown, USA',
            notes: 'System administrator with full access',
            createdAt: '2025-01-15T08:30:00.000Z'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            status: 'Active',
            address: '456 Oak Ave, Somewhere, USA',
            notes: 'Marketing department staff',
            createdAt: '2025-02-20T10:15:00.000Z'
          },
          {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            role: 'Editor',
            status: 'Inactive',
            address: '789 Pine Rd, Elsewhere, USA',
            notes: 'Content editor, currently on leave',
            createdAt: '2025-03-10T14:45:00.000Z'
          },
          {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            role: 'User',
            status: 'Active',
            address: '321 Elm St, Nowhere, USA',
            notes: 'Sales department representative',
            createdAt: '2025-03-25T09:20:00.000Z'
          },
          {
            id: 5,
            name: 'Michael Wilson',
            email: 'michael.wilson@example.com',
            role: 'Admin',
            status: 'Active',
            address: '654 Maple Dr, Anyplace, USA',
            notes: 'IT department manager',
            createdAt: '2025-04-05T11:30:00.000Z'
          },
          {
            id: 6,
            name: 'Sarah Brown',
            email: 'sarah.brown@example.com',
            role: 'User',
            status: 'Active',
            address: '987 Cedar Ln, Somewhere, USA',
            notes: 'Human resources specialist',
            createdAt: '2025-04-15T13:10:00.000Z'
          },
          {
            id: 7,
            name: 'David Miller',
            email: 'david.miller@example.com',
            role: 'Editor',
            status: 'Active',
            address: '159 Birch Blvd, Elsewhere, USA',
            notes: 'Content creator for blog posts',
            createdAt: '2025-04-30T15:45:00.000Z'
          },
          {
            id: 8,
            name: 'Jennifer Taylor',
            email: 'jennifer.taylor@example.com',
            role: 'User',
            status: 'Inactive',
            address: '753 Spruce St, Nowhere, USA',
            notes: 'Accounting department, on maternity leave',
            createdAt: '2025-05-10T08:50:00.000Z'
          },
          {
            id: 9,
            name: 'Thomas Anderson',
            email: 'thomas.anderson@example.com',
            role: 'Admin',
            status: 'Active',
            address: '951 Walnut Ave, Anyplace, USA',
            notes: 'System architect and developer',
            createdAt: '2025-05-20T10:30:00.000Z'
          },
          {
            id: 10,
            name: 'Lisa Martinez',
            email: 'lisa.martinez@example.com',
            role: 'User',
            status: 'Active',
            address: '357 Pineapple Way, Somewhere, USA',
            notes: 'Customer support representative',
            createdAt: '2025-06-01T14:15:00.000Z'
          },
          {
            id: 11,
            name: 'Kevin White',
            email: 'kevin.white@example.com',
            role: 'Editor',
            status: 'Active',
            address: '246 Orange Rd, Elsewhere, USA',
            notes: 'Graphics designer and content editor',
            createdAt: '2025-06-15T09:40:00.000Z'
          },
          {
            id: 12,
            name: 'Amanda Clark',
            email: 'amanda.clark@example.com',
            role: 'User',
            status: 'Inactive',
            address: '135 Lemon St, Nowhere, USA',
            notes: 'Project manager, currently on sabbatical',
            createdAt: '2025-06-30T11:20:00.000Z'
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.users = mockUsers;
      } catch (error) {
        this.error = error.message || 'Failed to fetch users';
        console.error('Error fetching users:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    addUser(userData) {
      try {
        // Generate a new ID (in a real app, the server would do this)
        const newId = this.users.length > 0 
          ? Math.max(...this.users.map(user => user.id)) + 1 
          : 1;
        
        const newUser = {
          id: newId,
          ...userData,
          createdAt: userData.createdAt || new Date().toISOString()
        };
        
        this.users.push(newUser);
        return newUser;
      } catch (error) {
        this.error = error.message || 'Failed to add user';
        console.error('Error adding user:', error);
        throw error;
      }
    },
    
    updateUser(userData) {
      try {
        const index = this.users.findIndex(user => user.id === userData.id);
        
        if (index === -1) {
          throw new Error(`User with ID ${userData.id} not found`);
        }
        
        // Update the user data
        this.users[index] = {
          ...this.users[index],
          ...userData
        };
        
        return this.users[index];
      } catch (error) {
        this.error = error.message || 'Failed to update user';
        console.error('Error updating user:', error);
        throw error;
      }
    },
    
    deleteUser(userId) {
      try {
        const index = this.users.findIndex(user => user.id === userId);
        
        if (index === -1) {
          throw new Error(`User with ID ${userId} not found`);
        }
        
        // Remove the user
        this.users.splice(index, 1);
        
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to delete user';
        console.error('Error deleting user:', error);
        throw error;
      }
    },
    
    // Additional utility methods
    setUserStatus(userId, status) {
      const user = this.getUserById(userId);
      
      if (user) {
        user.status = status;
        this.updateUser(user);
      }
    },
    
    bulkDeleteUsers(userIds) {
      userIds.forEach(id => {
        try {
          this.deleteUser(id);
        } catch (error) {
          console.error(`Failed to delete user ${id}:`, error);
        }
      });
    }
  }
});