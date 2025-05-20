-- Create compras_gastos table
CREATE TABLE IF NOT EXISTS compras_gastos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  proveedor VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) NOT NULL DEFAULT 0,
  impuesto DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  comprobante TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sucursalId INTEGER NOT NULL,
  validado BOOLEAN DEFAULT FALSE,
  formaPago VARCHAR(100) NOT NULL,
  categoriaId INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index on fecha for faster sorting and filtering
CREATE INDEX IF NOT EXISTS compras_gastos_fecha_idx ON compras_gastos(fecha);

-- Create index on proveedor for faster searching
CREATE INDEX IF NOT EXISTS compras_gastos_proveedor_idx ON compras_gastos(proveedor);

-- Create index on categoriaId for faster filtering
CREATE INDEX IF NOT EXISTS compras_gastos_categoria_id_idx ON compras_gastos(categoriaId);

-- Create index on validado for faster filtering
CREATE INDEX IF NOT EXISTS compras_gastos_validado_idx ON compras_gastos(validado);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS compras_gastos_user_id_idx ON compras_gastos(user_id);

-- Enable Row Level Security
ALTER TABLE compras_gastos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own expenses
CREATE POLICY user_compras_gastos_policy ON compras_gastos
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for admins to see all expenses
CREATE POLICY admin_compras_gastos_policy ON compras_gastos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.role = 'Admin'
    )
  );