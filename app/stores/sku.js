import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';

export const useSkuStore = defineStore('sku', {
  state: () => ({
    skus: [],
    sku: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      // sortBy: 'created_at',
      // sortOrder: 'desc',
    },
    pagination: {
      page: 1,
      pageCount: 1,
      itemsPerPage: 10,
      total: 0,
    },
  }),

  actions: {
    async fetchSkus() {
      this.loading = true;
      this.error = null;

      try {
        const supabase = useSupabase();

        // Calcular offset para paginación
        const offset = (this.pagination.page - 1) * this.pagination.itemsPerPage;

        // Construir consulta base
        let query = supabase
          .from('sku_insumos')
          .select(`
            *,
            insumo:insumos(id, nombre)
          `, { count: 'exact' });

        // Aplicar filtros
        if (this.filters.search) {
          query = query.or(`sku.ilike.%${this.filters.search}%,proveedor.ilike.%${this.filters.search}%`);
        }

        // Aplicar ordenamiento
        // query = query.order(this.filters.sortBy, { ascending: this.filters.sortOrder === 'asc' });

        // Aplicar paginación
        const { data, error, count } = await query
          .range(offset, offset + this.pagination.itemsPerPage - 1);

        if (error) throw error;

        this.skus = data;
        this.pagination.pageCount = count / this.pagination.itemsPerPage;
        this.pagination.total = count;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching SKUs:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSku(id) {

      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('sku_insumos')
          .select(`
            *,
            insumo:insumos(id, nombre)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        this.sku = data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching SKU:', error);
      }
    },

    async createSku(sku) {
      this.error = null;

      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('sku_insumos')
          .insert([sku])
          .select();

        if (error) throw error;

        this.skus.unshift(data[0]);
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error creating SKU:', error);
        throw error;
      }
    },

    async updateSku(id, updates) {
      this.error = null;

      delete updates.id;
      delete updates.insumo;

      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('sku_insumos')
          .update(updates)
          .eq('id', id)
          .select();

        if (error) throw error;

        const index = this.skus.findIndex(s => s.id === id);
        if (index !== -1) {
          this.skus[index] = data[0];
        }

        if (this.sku && this.sku.id === id) {
          this.sku = data[0];
        }

        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error updating SKU:', error);
        throw error;
      }
    },

    async deleteSku(id) {
      this.error = null;

      try {
        const supabase = useSupabase();
        const { error } = await supabase
          .from('sku_insumos')
          .delete()
          .eq('id', id);

        if (error) throw error;

        this.skus = this.skus.filter(s => s.id !== id);

        if (this.sku && this.sku.id === id) {
          this.sku = null;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error deleting SKU:', error);
        throw error;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Resetear a la primera página cuando se cambian los filtros
      this.fetchSkus();
    },

    resetFilters() {
      this.filters = {
        search: '',
        // sortBy: 'created_at',
        // sortOrder: 'desc',
      };
      this.pagination.page = 1;
      this.fetchSkus();
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchSkus();
    },

    setItemsPerPage(itemsPerPage) {
      this.pagination.itemsPerPage = itemsPerPage;
      this.pagination.page = 1;
      this.fetchSkus();
    }
  }
});