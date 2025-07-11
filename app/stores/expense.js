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
      maxAmount: '',
      sucursalId: ''
    },
    sorting: {
      field: 'fecha',
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
          expense.proveedor.toLowerCase().includes(searchLower)
        );
      }

      if (state.filters.category) {
        filtered = filtered.filter(expense =>
          expense.category === state.filters.category
        );
      }

      if (state.filters.sucursalId) {
        filtered = filtered.filter(expense =>
          expense.sucursalId === parseInt(state.filters.sucursalId)
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
          new Date(expense.fecha) >= fromDate
        );
      }

      if (state.filters.dateTo) {
        const toDate = new Date(state.filters.dateTo);
        filtered = filtered.filter(expense =>
          new Date(expense.fecha) <= toDate
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
        let valueA, valueB;

        // Handle special case for sucursal field
        if (field === 'sucursal') {
          valueA = a.sucursal?.nombre || '';
          valueB = b.sucursal?.nombre || '';
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        } else {
          valueA = a[field];
          valueB = b[field];

          // Handle special cases for different field types
          if (field === 'amount') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
          } else if (field === 'fecha') {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
          } else if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
          }
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
          .select(`
            *,
            items:compra_gasto_detalles(*),
            sucursal:sucursales(id, nombre)
          `);

        // Aplicar filtros de rango de fechas a la consulta
        if (this.filters.dateFrom) {
          query = query.gte('fecha', this.filters.dateFrom);
        }
        if (this.filters.dateTo) {
          query = query.lte('fecha', this.filters.dateTo);
        }


        // Aplicar filtros de fecha a la consulta
        if (this.filters.sucursalId) {
          query = query.eq('sucursalId', this.filters.sucursalId);
        }

        // Aplicar ordenación
        query = query.order('fecha', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.warn('Error fetching expenses from Supabase:', error);
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
          .select(`
            *,
            items:compra_gasto_detalles(*),
            sucursal:sucursales(id, nombre)
          `)
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

    async fetchExpensesTotals() {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        let query = supabase
          .from('compras_gastos')
          .select(`*`);

        // Aplicar filtros de fecha a la consulta
        if (this.filters.date) {
          const date = new Date(this.filters.date);
          // Formatear la fecha como YYYY-MM-DD para la consulta SQL
          const formattedDate = date.toISOString().split('T')[0];
          query = query.eq('fecha', formattedDate);
        }

        // Aplicar filtros de sucursal a la consulta
        if (this.filters.sucursalId) {
          query = query.eq('sucursalId', this.filters.sucursalId);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('Error fetching expenses from Supabase:', error);
        } else {
          this.expenses = data;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching expenses totals:', error);
      } finally {
        this.loading = false;
      }
    },

    async createExpense(expense) {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        // Extraer los items del gasto
        const { items, ...expenseData } = expense;

        // Add user_id to the expense
        const newExpense = {
          ...expenseData
        };

        // Iniciar una transacción para crear el gasto y sus detalles
        // Primero, crear el gasto
        const { data: createdExpense, error: expenseError } = await supabase
          .from('compras_gastos')
          .insert(newExpense)
          .select()
          .single();

        if (expenseError) {
          console.warn('Error creating expense in Supabase, using mock data:', expenseError);

          // Crear un nuevo gasto con datos de prueba
          const mockExpense = {
            ...newExpense,
            id: `mock-${Date.now()}`,
            created_at: new Date().toISOString(),
            items: []
          };

          // Si hay items, agregarlos al mock
          if (items && items.length > 0) {
            mockExpense.items = items.map((item, index) => ({
              ...item,
              id: `mock-item-${Date.now()}-${index}`,
              expenseId: mockExpense.id
            }));
          }

          // Agregar al estado local
          this.expenses.unshift(mockExpense);
          this.pagination.total++;

          return mockExpense;
        } else {
          // Si el gasto se creó correctamente, crear los detalles
          let itemsData = [];

          if (items && items.length > 0) {
            // Preparar los items con el ID del gasto
            const itemsToInsert = items.map(item => {
              return {
              ...item,
              compraGastoId: createdExpense.id
            }
          });



            // Insertar los items
            const { data: createdItems, error: itemsError } = await supabase
              .from('compra_gasto_detalles')
              .insert(itemsToInsert)
              .select();

            if (itemsError) {
              console.warn('Error creating expense items:', itemsError);
            } else {
              itemsData = createdItems;
            }
          }

          // Crear el objeto completo con los items
          const completeExpense = {
            ...createdExpense,
            items: itemsData
          };

          // Agregar al estado local
          this.expenses.unshift(completeExpense);
          this.pagination.total++;

          return completeExpense;
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

        // Extraer los items del gasto
        const { items, ...expenseData } = updates;

        // Actualizar el gasto principal
        const { data: updatedExpense, error: expenseError } = await supabase
          .from('compras_gastos')
          .update(expenseData)
          .eq('id', id)
          .select()
          .single();

        if (expenseError) {
          console.warn(`Error updating expense with ID ${id} in Supabase, using mock data:`, expenseError);

          // Buscar el gasto en el estado local
          const index = this.expenses.findIndex(e => e.id === id);

          if (index === -1) {
            throw new Error('Expense not found in local state');
          }

          // Actualizar el gasto en el estado local
          const updatedExpense = {
            ...this.expenses[index],
            ...expenseData,
          };

          // Actualizar los items si existen
          if (items) {
            updatedExpense.items = items;
          }

          this.expenses[index] = updatedExpense;

          if (this.currentExpense && this.currentExpense.id === id) {
            this.currentExpense = updatedExpense;
          }

          return updatedExpense;
        } else {
          let itemsData = [];

          // Si hay items para actualizar
          if (items && items.length > 0) {
            // Primero, eliminar todos los items existentes
            await supabase
              .from('compra_gasto_detalles')
              .delete()
              .eq('compraGastoId', id);

            // Luego, insertar los nuevos items
            const itemsToInsert = items.map(item => ({
              ...item,
              compraGastoId: id
            }));

            const { data: createdItems, error: itemsError } = await supabase
              .from('compra_gasto_detalles')
              .insert(itemsToInsert)
              .select();

            if (itemsError) {
              console.warn('Error updating expense items:', itemsError);
            } else {
              itemsData = createdItems;
            }
          }

          // Crear el objeto completo con los items actualizados
          const completeExpense = {
            ...updatedExpense,
            items: itemsData
          };

          // Actualizar en el estado local
          const index = this.expenses.findIndex(e => e.id === id);
          if (index !== -1) {
            this.expenses[index] = completeExpense;
          }

          if (this.currentExpense && this.currentExpense.id === id) {
            this.currentExpense = completeExpense;
          }

          return completeExpense;
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

        // Primero eliminar los detalles del gasto
        await supabase
          .from('compra_gasto_detalles')
          .delete()
          .eq('compraGastoId', id);

        // Luego eliminar el gasto principal
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
    async setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Reset to first page when applying filters

      // Volver a cargar los datos con los nuevos filtros
      await this.fetchExpenses();
    },


    // Filter actions
    async setFilters2(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Reset to first page when applying filters

      // Volver a cargar los datos con los nuevos filtros
      await this.fetchExpenses();
      // Si necesitas los totales, puedes descomentar la siguiente línea:
      // await this.fetchExpensesTotals();
    },

    setSorting(field, descending = false) {
      this.sorting.field = field;
      this.sorting.descending = descending;
      this.pagination.page = 1; // Reset to first page when changing sorting
    },

    async clearFilters() {
      this.filters = {
        search: '',
        category: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: '',
        sucursalId: ''
      };
      this.sorting = {
        field: 'fecha',
        descending: true
      };
      this.pagination.page = 1;

      // Volver a cargar los datos sin filtros
      await this.fetchExpenses();
    }
  }
});