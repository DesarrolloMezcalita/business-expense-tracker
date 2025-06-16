import { defineStore } from 'pinia';
import { useSupabase } from '~/utils/supabase';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    category: null,
    subcategories: [],
    subcategory: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      sortBy: 'nombre',
      sortOrder: 'asc',
    },
    pagination: {
      page: 1,
      itemsPerPage: 10,
      total: 0,
    },
  }),

  getters: {
    filteredCategories() {
      return this.categories;
    },
  },

  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        // Calcular offset para paginación
        const offset = (this.pagination.page - 1) * this.pagination.itemsPerPage;
        
        // Construir consulta base
        let query = supabase
          .from('categorias_gastos')
          .select('*, subcategorias_gastos(*)', { count: 'exact' });
        
        // Aplicar filtros
        if (this.filters.search) {
          query = query.or(`nombre.ilike.%${this.filters.search}%`);
        }
        
        // Aplicar ordenamiento
        query = query.order(this.filters.sortBy, { ascending: this.filters.sortOrder === 'asc' });
        
        // Aplicar paginación
        const { data, error, count } = await query
          .range(offset, offset + this.pagination.itemsPerPage - 1);
        
        if (error) throw error;
        
        this.categories = data;
        this.pagination.total = count;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching categories:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchCategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('categorias_gastos')
          .select('*, subcategorias_gastos(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        this.category = data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching category:', error);
      } finally {
        this.loading = false;
      }
    },

    async createCategory(category) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('categorias_gastos')
          .insert([category])
          .select();
          
        if (error) throw error;
        
        this.categories.unshift(data[0]);
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error creating category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('categorias_gastos')
          .update(updates)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = data[0];
        }
        
        if (this.category && this.category.id === id) {
          this.category = data[0];
        }
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error updating category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { error } = await supabase
          .from('categorias_gastos')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        this.categories = this.categories.filter(c => c.id !== id);
        
        if (this.category && this.category.id === id) {
          this.category = null;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error deleting category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Subcategory actions
    async fetchSubcategories(categoryId = null) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        
        let query = supabase
          .from('subcategorias_gastos')
          .select('*');
        
        if (categoryId) {
          query = query.eq('categoria_id', categoryId);
        }
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        this.subcategories = data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching subcategories:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSubcategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('subcategorias_gastos')
          .select('*, category:category_id(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        this.subcategory = data;
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching subcategory:', error);
      } finally {
        this.loading = false;
      }
    },

    async createSubcategory(subcategory) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('subcategorias_gastos')
          .insert([subcategory])
          .select();
          
        if (error) throw error;
        
        // Si estamos viendo la categoría padre, actualizamos la lista de subcategorías
        if (this.category && this.category.id === subcategory.category_id) {
          if (!this.category.subcategories) {
            this.category.subcategories = [];
          }
          this.category.subcategories.push(data[0]);
        }
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error creating subcategory:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSubcategory(id, updates) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { data, error } = await supabase
          .from('subcategorias_gastos')
          .update(updates)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        
        // Actualizar en la lista de subcategorías si existe
        if (this.subcategories.length > 0) {
          const index = this.subcategories.findIndex(s => s.id === id);
          if (index !== -1) {
            this.subcategories[index] = data[0];
          }
        }
        
        // Actualizar en la categoría padre si estamos viéndola
        if (this.category && this.category.subcategories) {
          const index = this.category.subcategories.findIndex(s => s.id === id);
          if (index !== -1) {
            this.category.subcategories[index] = data[0];
          }
        }
        
        if (this.subcategory && this.subcategory.id === id) {
          this.subcategory = data[0];
        }
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        console.error('Error updating subcategory:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSubcategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const supabase = useSupabase();
        const { error } = await supabase
          .from('subcategorias_gastos')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Eliminar de la lista de subcategorías si existe
        this.subcategories = this.subcategories.filter(s => s.id !== id);
        
        // Eliminar de la categoría padre si estamos viéndola
        if (this.category && this.category.subcategories) {
          this.category.subcategories = this.category.subcategories.filter(s => s.id !== id);
        }
        
        if (this.subcategory && this.subcategory.id === id) {
          this.subcategory = null;
        }
      } catch (error) {
        this.error = error.message;
        console.error('Error deleting subcategory:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Resetear a la primera página cuando se cambian los filtros
      this.fetchCategories();
    },

    resetFilters() {
      this.filters = {
        search: '',
        sortBy: 'nombre',
        sortOrder: 'asc',
      };
      this.pagination.page = 1;
      this.fetchCategories();
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchCategories();
    },

    setItemsPerPage(itemsPerPage) {
      this.pagination.itemsPerPage = itemsPerPage;
      this.pagination.page = 1;
      this.fetchCategories();
    }
  }
});