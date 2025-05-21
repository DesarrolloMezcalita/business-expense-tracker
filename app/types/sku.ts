export interface Sku {
  id: number;
  sku: string;
  proveedor: string;
  unidad_de_medida: string;
  cantidad: number;
  created_at: string; // Timestamp en formato ISO
  insumoId: number;
}

export interface SkuFilters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface SkuPagination {
  page: number;
  itemsPerPage: number;
  total: number;
}
