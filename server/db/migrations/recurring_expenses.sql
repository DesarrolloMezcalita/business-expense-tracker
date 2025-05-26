-- Create gastos_recurrentes table
CREATE TABLE IF NOT EXISTS gastos_recurrentes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  frecuencia VARCHAR(50) NOT NULL, -- 'mensual', 'semanal', 'trimestral', 'anual', etc.
  dia_cobro INTEGER, -- día del mes para cobros mensuales/anuales, día de la semana para semanales
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE, -- NULL si no tiene fecha de finalización
  proveedor VARCHAR(255) NOT NULL,
  categoriaId INTEGER NOT NULL,
  formaPago VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sucursalId INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index on frecuencia for faster filtering
CREATE INDEX IF NOT EXISTS gastos_recurrentes_frecuencia_idx ON gastos_recurrentes(frecuencia);

-- Create index on fecha_inicio for faster sorting and filtering
CREATE INDEX IF NOT EXISTS gastos_recurrentes_fecha_inicio_idx ON gastos_recurrentes(fecha_inicio);

-- Create index on proveedor for faster searching
CREATE INDEX IF NOT EXISTS gastos_recurrentes_proveedor_idx ON gastos_recurrentes(proveedor);

-- Create index on categoriaId for faster filtering
CREATE INDEX IF NOT EXISTS gastos_recurrentes_categoria_id_idx ON gastos_recurrentes(categoriaId);

-- Create index on activo for faster filtering
CREATE INDEX IF NOT EXISTS gastos_recurrentes_activo_idx ON gastos_recurrentes(activo);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS gastos_recurrentes_user_id_idx ON gastos_recurrentes(user_id);

-- Enable Row Level Security
ALTER TABLE gastos_recurrentes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own recurring expenses
CREATE POLICY user_gastos_recurrentes_policy ON gastos_recurrentes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for admins to see all recurring expenses
CREATE POLICY admin_gastos_recurrentes_policy ON gastos_recurrentes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.role = 'Admin'
    )
  );

-- Create table for tracking instances of recurring expenses
CREATE TABLE IF NOT EXISTS instancias_gastos_recurrentes (
  id SERIAL PRIMARY KEY,
  gasto_recurrente_id INTEGER REFERENCES gastos_recurrentes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  pagado BOOLEAN DEFAULT FALSE,
  compra_gasto_id INTEGER REFERENCES compras_gastos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index on gasto_recurrente_id for faster queries
CREATE INDEX IF NOT EXISTS instancias_gastos_recurrentes_gasto_id_idx ON instancias_gastos_recurrentes(gasto_recurrente_id);

-- Create index on fecha for faster sorting and filtering
CREATE INDEX IF NOT EXISTS instancias_gastos_recurrentes_fecha_idx ON instancias_gastos_recurrentes(fecha);

-- Create index on pagado for faster filtering
CREATE INDEX IF NOT EXISTS instancias_gastos_recurrentes_pagado_idx ON instancias_gastos_recurrentes(pagado);

-- Enable Row Level Security
ALTER TABLE instancias_gastos_recurrentes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own recurring expense instances
CREATE POLICY user_instancias_gastos_recurrentes_policy ON instancias_gastos_recurrentes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for admins to see all recurring expense instances
CREATE POLICY admin_instancias_gastos_recurrentes_policy ON instancias_gastos_recurrentes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.role = 'Admin'
    )
  );