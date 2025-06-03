export interface GastoRecurrente {
  id: number;
  nombre: string;
  monto: number;
  dia_cobro: number;
  proveedor: string;
  categoriaid: number;
  formapago: string;
  activo: boolean;
  created_at: string; // o Date si usas objetos Date en lugar de strings ISO
  updated_at: string; // idem arriba
  sucursalid: number;
  frecuencia?: string; // Tipo de frecuencia (mensual, semanal, etc.)
  descripcion?: string; // Descripción opcional
  fecha_inicio?: string; // Fecha de inicio del gasto recurrente
  fecha_fin?: string | null; // Fecha de fin del gasto recurrente (opcional)
  user_id?: string; // ID del usuario que creó el gasto
  sucursal?: {
    id: number;
    nombre: string;
  };
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
