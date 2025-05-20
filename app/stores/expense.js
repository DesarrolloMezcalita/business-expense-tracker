import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';
import { useAuthStore } from './auth';
import { useNuxtApp } from '#app';
// We're using the Expense interface from ~/types/expense.ts

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    loading: false,
    error: null,
    currentExpense: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    },
    filters: {
      search: '',
      category: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    },
    sorting: {
      field: 'date',
      descending: true
    }
  }),

  getters: {
    paginatedExpenses: (state) => {
      // Apply filters
      let filtered = [...state.expenses];
      
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(expense => 
          expense.description.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower)
        );
      }
      
      if (state.filters.category) {
        filtered = filtered.filter(expense => 
          expense.category === state.filters.category
        );
      }
      
      if (state.filters.status) {
        filtered = filtered.filter(expense => 
          expense.status === state.filters.status
        );
      }
      
      if (state.filters.dateFrom) {
        const fromDate = new Date(state.filters.dateFrom);
        filtered = filtered.filter(expense => 
          new Date(expense.date) >= fromDate
        );
      }
      
      if (state.filters.dateTo) {
        const toDate = new Date(state.filters.dateTo);
        filtered = filtered.filter(expense => 
          new Date(expense.date) <= toDate
        );
      }
      
      if (state.filters.minAmount) {
        filtered = filtered.filter(expense => 
          parseFloat(expense.amount) >= parseFloat(state.filters.minAmount)
        );
      }
      
      if (state.filters.maxAmount) {
        filtered = filtered.filter(expense => 
          parseFloat(expense.amount) <= parseFloat(state.filters.maxAmount)
        );
      }
      
      // Apply sorting
      const { field, descending } = state.sorting;
      filtered.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle special cases for different field types
        if (field === 'amount') {
          valueA = parseFloat(valueA);
          valueB = parseFloat(valueB);
        } else if (field === 'date') {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
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
    
    categories: (state) => {
      const categories = new Set(state.expenses.map(expense => expense.category));
      return Array.from(categories);
    }
  },

  actions: {
    async fetchExpenses() {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        let query = supabase
          .from('compras_gastos')
          .select('*')
          .order('fecha', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.warn('Error fetching expenses from Supabase, using mock data:', error);
          // Usar datos de prueba si falla la consulta a Supabase
          const authStore = useAuthStore();
          const userId = authStore.user?.id || 'user-id-1';
          
          // Obtener los datos de prueba del plugin
          const nuxtApp = useNuxtApp();
          const mockData = nuxtApp.$mockExpenses || [];
          
          // Reemplazar el user_id en los datos de prueba con el ID del usuario actual
          this.expenses = mockData.map(expense => ({
            ...expense,
            user_id: userId
          }));
        } else {
          this.expenses = data;
        }
        
        this.pagination.total = this.expenses.length;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching expenses:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchExpense(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { data, error } = await supabase
          .from('compras_gastos')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.warn(`Error fetching expense with ID ${id} from Supabase, using mock data:`, error);
          // Obtener los datos de prueba del plugin
          const nuxtApp = useNuxtApp();
          const mockData = nuxtApp.$mockExpenses || [];
          
          // Buscar en los datos de prueba
          const mockExpense = mockData.find(expense => expense.id === id);
          
          if (mockExpense) {
            const authStore = useAuthStore();
            const userId = authStore.user?.id || 'user-id-1';
            
            // Reemplazar el user_id con el ID del usuario actual
            const expense = {
              ...mockExpense,
              user_id: userId
            };
            
            this.currentExpense = expense;
            return expense;
          } else {
            throw new Error('Expense not found in mock data');
          }
        } else {
          this.currentExpense = data;
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error(`Error fetching expense with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async createExpense(expense) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const authStore = useAuthStore();
        
        // Add user_id to the expense
        const newExpense = {
          ...expense,
          user_id: authStore.user?.id || 'user-id-1'
        };
        
        const { data, error } = await supabase
          .from('compras_gastos')
          .insert(newExpense)
          .select()
          .single();
        
        if (error) {
          console.warn('Error creating expense in Supabase, using mock data:', error);
          
          // Crear un nuevo gasto con datos de prueba
          const mockExpense = {
            ...newExpense,
            id: `mock-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Agregar al estado local
          this.expenses.unshift(mockExpense);
          this.pagination.total++;
          
          return mockExpense;
        } else {
          // Agregar al estado local
          this.expenses.unshift(data);
          this.pagination.total++;
          
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error creating expense:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateExpense(id, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { data, error } = await supabase
          .from('compras_gastos')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.warn(`Error updating expense with ID ${id} in Supabase, using mock data:`, error);
          
          // Buscar el gasto en el estado local
          const index = this.expenses.findIndex(e => e.id === id);
          
          if (index === -1) {
            throw new Error('Expense not found in local state');
          }
          
          // Actualizar el gasto en el estado local
          const updatedExpense = {
            ...this.expenses[index],
            ...updates,
            updated_at: new Date().toISOString()
          };
          
          this.expenses[index] = updatedExpense;
          
          if (this.currentExpense && this.currentExpense.id === id) {
            this.currentExpense = updatedExpense;
          }
          
          return updatedExpense;
        } else {
          // Actualizar en el estado local
          const index = this.expenses.findIndex(e => e.id === id);
          if (index !== -1) {
            this.expenses[index] = data;
          }
          
          if (this.currentExpense && this.currentExpense.id === id) {
            this.currentExpense = data;
          }
          
          return data;
        }
      } catch (error) {
        this.error = error.message;
        console.error(`Error updating expense with ID ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteExpense(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        const { error } = await supabase
          .from('compras_gastos')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.warn(`Error deleting expense with ID ${id} from Supabase, using mock data:`, error);
          
          // Eliminar del estado local de todos modos
          this.expenses = this.expenses.filter(e => e.id !== id);
          this.pagination.total--;
          
          if (this.currentExpense && this.currentExpense.id === id) {
            this.currentExpense = null;
          }
        } else {
          // Eliminar del estado local
          this.expenses = this.expenses.filter(e => e.id !== id);
          this.pagination.total--;
          
          if (this.currentExpense && this.currentExpense.id === id) {
            this.currentExpense = null;
          }
        }
        
        return true;
      } catch (error) {
        this.error = error.message;
        console.error(`Error deleting expense with ID ${id}:`, error);
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
        category: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: ''
      };
      this.sorting = {
        field: 'date',
        descending: true
      };
      this.pagination.page = 1;
    }
  }
});