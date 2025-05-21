export interface Supply {
  id: string;
  nombre: string;
  unidad_de_medida: string;
  tipo: string;
  created_at: string; // Formato ISO (ej. "2025-05-20T14:30:00Z")
  updated_at?: string;
}

export interface SupplyFilters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface SupplyPagination {
  page: number;
  itemsPerPage: number;
  total: number;
}
