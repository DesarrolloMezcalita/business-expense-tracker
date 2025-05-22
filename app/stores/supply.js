import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';

export const useSupplyStore = defineStore('supply', {
  state: () => ({
    supplies: [],
    supply: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    pagination: {
      page: 1,
      itemsPerPage: 10,
      total: 0,
    },
    categories: ['Materia prima', 'Herramientas', 'Equipos', 'Oficina', 'Limpieza', 'Otros'],
    statuses: ['available', 'low_stock', 'out_of_stock'],
    suppliers: [],
  }),

  getters: {
    filteredSupplies() {
      return this.supplies;
    },
  },

  actions: {
    async fetchSupplies() {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        // Calcular offset para paginación
        const offset = (this.pagination.page - 1) * this.pagination.itemsPerPage;
        
        // Construir consulta base
        let query = supabase
          .from('insumos')
          .select('*', { count: 'exact' });
        
        // Aplicar filtros
        if (this.filters.search) {
          query = query.or(`nombre.ilike.%${this.filters.search}%,tipo.ilike.%${this.filters.search}%`);
        }
        
        // Aplicar ordenamiento
        query = query.order(this.filters.sortBy, { ascending: this.filters.sortOrder === 'asc' });
        
        // Aplicar paginación
        const { data, error, count } = await query
          .range(offset, offset + this.pagination.itemsPerPage - 1);
        
        if (error) throw error;
        
        this.supplies = data;
        this.pagination.total = count;
        
        // Obtener lista de proveedores únicos para los filtros
        const { data: suppliersData } = await supabase
          .from('insumos')
          .select('supplier')
          .order('supplier');
          
        if (suppliersData) {
          this.suppliers = [...new Set(suppliersData.map(item => item.supplier))];
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching supplies:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSupply(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('insumos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        this.supply = data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching supply:', error);
      } finally {
        this.loading = false;
      }
    },

    async createSupply(supply) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('insumos')
          .insert([supply])
          .select();
          
        if (error) throw error;
        
        this.supplies.unshift(data[0]);
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error creating supply:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSupply(id, updates) {
      this.loading = true;
      this.error = null;

      delete updates.id;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('insumos')
          .update(updates)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        
        const index = this.supplies.findIndex(s => s.id === id);
        if (index !== -1) {
          this.supplies[index] = data[0];
        }
        
        if (this.supply && this.supply.id === id) {
          this.supply = data[0];
        }
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error updating supply:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSupply(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { error } = await supabase
          .from('insumos')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        this.supplies = this.supplies.filter(s => s.id !== id);
        
        if (this.supply && this.supply.id === id) {
          this.supply = null;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error deleting supply:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Resetear a la primera página cuando se cambian los filtros
      this.fetchSupplies();
    },

    resetFilters() {
      this.filters = {
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      this.pagination.page = 1;
      this.fetchSupplies();
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchSupplies();
    },

    setItemsPerPage(itemsPerPage) {
      this.pagination.itemsPerPage = itemsPerPage;
      this.pagination.page = 1;
      this.fetchSupplies();
    }
  }
});