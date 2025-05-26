import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';
import { useAuthStore } from './auth';

export const useRecurringExpenseStore = defineStore('recurring-expense', {
  state: () => ({
    recurringExpenses: [],
    instances: [],
    loading: false,
    error: null,
    currentRecurringExpense: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    },
    filters: {
      search: '',
      status: '',
      frequency: '',
      minAmount: '',
      maxAmount: '',
      active: true
    },
    sorting: {
      field: 'created_at',
      descending: true
    }
  }),

  getters: {
    paginatedRecurringExpenses: (state) => {
      // Apply filters
      let filtered = [...state.recurringExpenses];
      
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(expense =>
          expense.nombre.toLowerCase().includes(searchLower) ||
          expense.proveedor.toLowerCase().includes(searchLower)
        );
      }
      
      if (state.filters.frequency) {
        filtered = filtered.filter(expense => 
          expense.frecuencia === state.filters.frequency
        );
      }
      
      if (state.filters.active !== null && state.filters.active !== undefined) {
        filtered = filtered.filter(expense => 
          expense.activo === state.filters.active
        );
      }
      
      if (state.filters.minAmount) {
        filtered = filtered.filter(expense => 
          parseFloat(expense.monto) >= parseFloat(state.filters.minAmount)
        );
      }
      
      if (state.filters.maxAmount) {
        filtered = filtered.filter(expense => 
          parseFloat(expense.monto) <= parseFloat(state.filters.maxAmount)
        );
      }
      
      // Apply sorting
      const { field, descending } = state.sorting;
      filtered.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle special cases for different field types
        if (field === 'monto') {
          valueA = parseFloat(valueA);
          valueB = parseFloat(valueB);
        } else if (field === 'created_at' || field === 'updated_at') {
          valueA = new Date(valueA || '9999-12-31').getTime();
          valueB = new Date(valueB || '9999-12-31').getTime();
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }
        
        // Apply sort direction
        if (descending) {
          return valueB > valueA ? 1 : valueB < valueA ? -1 : 0;
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
      });
      
      // Update total for pagination
      state.pagination.total = filtered.length;
      
      // Apply pagination
      const start = (state.pagination.page - 1) * state.pagination.limit;
      const end = start + state.pagination.limit;
      
      return filtered.slice(start, end);
    },
    
    totalPages: (state) => {
      return Math.ceil(state.pagination.total / state.pagination.limit);
    },
    
    frequencies: (state) => {
      const frequencies = new Set(state.recurringExpenses.map(expense => expense.frecuencia));
      return Array.from(frequencies);
    }
  },

  actions: {
    async fetchRecurringExpenses() {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        let query = supabase
          .from('gastos_recurrentes')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching recurring expenses:', error);
          throw error;
        } else {
          this.recurringExpenses = data;
        }
        
        this.pagination.total = this.recurringExpenses.length;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching recurring expenses:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchRecurringExpense(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { data, error } = await supabase
          .from('gastos_recurrentes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error(`Error fetching recurring expense with ID ${id}:`, error);
          throw error;
        } else {
          this.currentRecurringExpense = data;
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error(`Error fetching recurring expense with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchInstances(recurringExpenseId) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { data, error } = await supabase
          .from('instancias_gastos_recurrentes')
          .select('*')
          .eq('gasto_recurrente_id', recurringExpenseId)
          .order('fecha', { ascending: false });
        
        if (error) {
          console.error(`Error fetching instances for recurring expense ID ${recurringExpenseId}:`, error);
          throw error;
        } else {
          this.instances = data;
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error(`Error fetching instances for recurring expense ID ${recurringExpenseId}:`, error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async createRecurringExpense(recurringExpense) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const authStore = useAuthStore();
        
        // Add user_id to the recurring expense
        const newRecurringExpense = {
          ...recurringExpense,
          categoriaId: 1, // Default category ID
          descripcion: '', // Empty description
          fecha_inicio: new Date().toISOString().split("T")[0], // Current date
          fecha_fin: null, // No end date
          user_id: authStore.user?.id
        };
        
        const { data, error } = await supabase
          .from('gastos_recurrentes')
          .insert(newRecurringExpense)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating recurring expense:', error);
          throw error;
        } else {
          // Add to local state
          this.recurringExpenses.unshift(data);
          this.pagination.total++;
          
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error creating recurring expense:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateRecurringExpense(id, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { data, error } = await supabase
          .from('gastos_recurrentes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error(`Error updating recurring expense with ID ${id}:`, error);
          throw error;
        } else {
          // Update in local state
          const index = this.recurringExpenses.findIndex(e => e.id === id);
          if (index !== -1) {
            this.recurringExpenses[index] = data;
          }
          
          if (this.currentRecurringExpense && this.currentRecurringExpense.id === id) {
            this.currentRecurringExpense = data;
          }
          
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error(`Error updating recurring expense with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteRecurringExpense(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { error } = await supabase
          .from('gastos_recurrentes')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error(`Error deleting recurring expense with ID ${id}:`, error);
          throw error;
        } else {
          // Remove from local state
          this.recurringExpenses = this.recurringExpenses.filter(e => e.id !== id);
          this.pagination.total--;
          
          if (this.currentRecurringExpense && this.currentRecurringExpense.id === id) {
            this.currentRecurringExpense = null;
          }
          
          return true;
        }
      } catch (error) {
        this.error = error.message;
        console.error(`Error deleting recurring expense with ID ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Pagination actions
    setPage(page) {
      this.pagination.page = page;
    },
    
    setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1; // Reset to first page when changing limit
    },
    
    // Filter actions
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Reset to first page when applying filters
    },
    
    setSorting(field, descending = false) {
      this.sorting.field = field;
      this.sorting.descending = descending;
      this.pagination.page = 1; // Reset to first page when changing sorting
    },
    
    clearFilters() {
      this.filters = {
        search: '',
        status: '',
        frequency: '',
        minAmount: '',
        maxAmount: '',
        active: true
      };
      this.sorting = {
        field: 'created_at',
        descending: true
      };
      this.pagination.page = 1;
    },
    
    // Toggle active status
    async toggleActive(id, active) {
      return this.updateRecurringExpense(id, { activo: active });
    }
  }
});