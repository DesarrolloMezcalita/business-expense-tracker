export interface ExpenseItem {
  id?: number;
  expense_id: number;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descripcion?: string;
  descuento?: number;
  impuesto?: number;
  total?: number;
  created_at?: string; // formato ISO de timestamptz
  updated_at?: string;
  compraGastold?: number;
  insumoid?: number;
  skuid?: number;
  categoryid?: number;

  // Campos para compatibilidad con componentes
  nombre?: string; // Alias para concepto
  precio_unitario?: number; // Alias para precioUnitario
}
