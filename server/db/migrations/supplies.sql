-- Crear tabla de insumos
CREATE TABLE IF NOT EXISTS supplies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_supplies_name ON supplies(name);
CREATE INDEX IF NOT EXISTS idx_supplies_category ON supplies(category);
CREATE INDEX IF NOT EXISTS idx_supplies_status ON supplies(status);
CREATE INDEX IF NOT EXISTS idx_supplies_supplier ON supplies(supplier);

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_supplies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS update_supplies_updated_at_trigger ON supplies;
CREATE TRIGGER update_supplies_updated_at_trigger
BEFORE UPDATE ON supplies
FOR EACH ROW
EXECUTE FUNCTION update_supplies_updated_at();

-- Insertar algunos datos de ejemplo
INSERT INTO supplies (name, description, category, quantity, unit, price, supplier, status)
VALUES
  ('Harina de trigo', 'Harina de trigo para todo uso', 'Materia prima', 50, 'kg', 25.50, 'Distribuidora Alimentos S.A.', 'available'),
  ('Azúcar', 'Azúcar refinada', 'Materia prima', 30, 'kg', 22.00, 'Distribuidora Alimentos S.A.', 'available'),
  ('Aceite vegetal', 'Aceite vegetal para cocina', 'Materia prima', 20, 'l', 45.75, 'Aceites del Norte', 'low_stock'),
  ('Chocolate en polvo', 'Chocolate en polvo para repostería', 'Materia prima', 5, 'kg', 120.00, 'Chocolates Finos', 'low_stock'),
  ('Levadura', 'Levadura seca instantánea', 'Materia prima', 2, 'kg', 85.30, 'Insumos Panaderos', 'out_of_stock'),
  ('Batidora industrial', 'Batidora industrial de 20 litros', 'Equipos', 1, 'unidad', 12500.00, 'Equipos Industriales', 'available'),
  ('Espátulas de silicona', 'Set de espátulas de silicona', 'Herramientas', 5, 'set', 350.00, 'Utensilios Pro', 'available'),
  ('Papel para hornear', 'Rollo de papel para hornear', 'Oficina', 10, 'rollo', 120.00, 'Papelería Industrial', 'available'),
  ('Detergente industrial', 'Detergente para limpieza de equipos', 'Limpieza', 15, 'l', 85.00, 'Productos de Limpieza S.A.', 'available'),
  ('Moldes para pastel', 'Moldes redondos para pastel', 'Herramientas', 8, 'unidad', 180.00, 'Utensilios Pro', 'available');