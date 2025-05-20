export interface Expense {
  id: number;
  fecha: string; // Date format as string (e.g. "2025-05-19")
  proveedor: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  comprobante: string;
  created_at: string; // ISO timestamp string (e.g. "2025-05-19T12:34:56Z")
  sucursalId: number;
  validado: boolean;
  formaPago: string;
  categoriaId: number;
}
