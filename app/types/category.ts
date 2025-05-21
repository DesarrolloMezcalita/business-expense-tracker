export interface Category {
  id?: string | number;
  nombre: string;
  created_at?: string;
  subcategories?: Subcategory[]; // Opcional, para cuando se cargan las subcategorías
}

export interface Subcategory {
  id?: string | number;
  nombre: string;
  created_at?: string;
  categoria_id?: number;
  category?: Category; // Opcional, para cuando se carga la categoría padre
}

export interface CategoryFilters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface CategoryPagination {
  page: number;
  itemsPerPage: number;
  total: number;
}
