import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';

/**
 * Branch store for managing branches
 * @typedef {import('~/types/branch').Branch} Branch
 */
export const useBranchStore = defineStore('branch', {
  state: () => ({
    branches: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getBranchById: (state) => (id) => {
      return state.branches.find(branch => branch.id === id);
    },
    
    totalBranches: (state) => {
      return state.branches.length;
    }
  },

  actions: {
    async fetchBranches() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Fetch branches from Supabase
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('sucursales')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        
        this.branches = data || [];
        
        // If no branches exist in the database, seed with initial data
        if (this.branches.length === 0) {
          await this.useMockData();
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch branches';
        console.error('Error fetching branches:', error);
        
        // Fallback to mock data if Supabase connection fails
        await this.useMockData();
      } finally {
        this.isLoading = false;
      }
    },
    
    async useMockData() {
      // Mock data as fallback
      const mockBranches = [
        {
          id: '1',
          nombre: 'Sucursal Central',
          created_at: '2025-01-15T08:30:00.000Z'
        },
        {
          id: '2',
          nombre: 'Sucursal Norte',
          created_at: '2025-02-20T10:15:00.000Z'
        },
        {
          id: '3',
          nombre: 'Sucursal Sur',
          created_at: '2025-03-10T14:45:00.000Z'
        },
        {
          id: '4',
          nombre: 'Sucursal Oeste',
          created_at: '2025-03-25T09:20:00.000Z'
        },
        {
          id: '5',
          nombre: 'Sucursal Este',
          created_at: '2025-04-05T11:30:00.000Z'
        }
      ];
      
      this.branches = mockBranches;
      console.log('Using mock data as fallback for branches');
    },
    
    async addBranch(branchData) {
      try {
        const now = new Date().toISOString();
        // Format the data for Supabase
        const newBranch = {
          nombre: branchData.nombre,
          created_at: branchData.created_at || now
        };
        
        // Insert the new branch into Supabase
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('sucursales')
          .insert(newBranch)
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add the new branch to the local state
          this.branches.push(data[0]);
          return data[0];
        }
        
        throw new Error('Failed to add branch: No data returned');
      } catch (error) {
        this.error = error.message || 'Failed to add branch';
        console.error('Error adding branch:', error);
        
        // Fallback to local operation if Supabase fails
        const newId = this.branches.length > 0
          ? String(Math.max(...this.branches.map(branch => parseInt(branch.id))) + 1)
          : '1';
        
        const newBranch = {
          id: newId,
          ...branchData,
          created_at: branchData.created_at || new Date().toISOString()
        };
        
        this.branches.push(newBranch);
        return newBranch;
      }
    },
    
    async updateBranch(branchData) {
      try {
        // Format the data for Supabase
        const updatedBranch = {
          nombre: branchData.nombre
        };
        
        // Update the branch in Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('sucursales')
          .update(updatedBranch)
          .eq('id', branchData.id);
        
        if (error) throw error;
        
        // Update the branch in the local state
        const index = this.branches.findIndex(branch => branch.id === branchData.id);
        
        if (index === -1) {
          throw new Error(`Branch with ID ${branchData.id} not found`);
        }
        
        this.branches[index] = {
          ...this.branches[index],
          ...updatedBranch
        };
        
        return this.branches[index];
      } catch (error) {
        this.error = error.message || 'Failed to update branch';
        console.error('Error updating branch:', error);
        
        // Fallback to local operation if Supabase fails
        const index = this.branches.findIndex(branch => branch.id === branchData.id);
        
        if (index === -1) {
          throw new Error(`Branch with ID ${branchData.id} not found`);
        }
        
        this.branches[index] = {
          ...this.branches[index],
          ...branchData
        };
        
        return this.branches[index];
      }
    },
    
    async deleteBranch(branchId) {
      try {
        // Delete the branch from Supabase
        const supabase = useSupabase();
        const { error } = await supabase
          .from('sucursales')
          .delete()
          .eq('id', branchId);
        
        if (error) throw error;
        
        // Remove the branch from the local state
        const index = this.branches.findIndex(branch => branch.id === branchId);
        
        if (index === -1) {
          throw new Error(`Branch with ID ${branchId} not found`);
        }
        
        this.branches.splice(index, 1);
        
        return true;
      } catch (error) {
        this.error = error.message || 'Failed to delete branch';
        console.error('Error deleting branch:', error);
        
        // Fallback to local operation if Supabase fails
        const index = this.branches.findIndex(branch => branch.id === branchId);
        
        if (index === -1) {
          throw new Error(`Branch with ID ${branchId} not found`);
        }
        
        this.branches.splice(index, 1);
        
        return true;
      }
    }
  }
});