export interface RecurringExpense {
  id: number;
  nombre: string;
  descripcion?: string;
  monto: number;
  frecuencia: string; // 'mensual', 'semanal', 'trimestral', 'anual', etc.
  dia_cobro?: number; // día del mes para cobros mensuales/anuales, día de la semana para semanales
  fecha_inicio: string; // Date format as string (e.g. "2025-05-19")
  fecha_fin?: string; // Date format as string, optional
  proveedor: string;
  categoriaId: number;
  formaPago: string;
  activo: boolean;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
  sucursalId: number;
}

export interface RecurringExpenseInstance {
  id: number;
  gasto_recurrente_id: number;
  fecha: string; // Date format as string
  monto: number;
  pagado: boolean;
  compra_gasto_id?: number; // ID of the related expense if paid
  created_at: string; // ISO timestamp string
}

export type FrecuenciaOption = {
  label: string;
  value: string;
};

export const FRECUENCIAS: FrecuenciaOption[] = [
  { label: "Diaria", value: "diaria" },
  { label: "Semanal", value: "semanal" },
  { label: "Quincenal", value: "quincenal" },
  { label: "Mensual", value: "mensual" },
  { label: "Bimestral", value: "bimestral" },
  { label: "Trimestral", value: "trimestral" },
  { label: "Semestral", value: "semestral" },
  { label: "Anual", value: "anual" },
];
