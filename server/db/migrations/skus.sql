-- Crear tabla de SKUs
CREATE TABLE IF NOT EXISTS skus (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  proveedor VARCHAR(100) NOT NULL,
  unidad_de_medida VARCHAR(50) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  insumo_id INTEGER NOT NULL REFERENCES insumos(id) ON DELETE CASCADE
);

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_skus_sku ON skus(sku);
CREATE INDEX IF NOT EXISTS idx_skus_proveedor ON skus(proveedor);
CREATE INDEX IF NOT EXISTS idx_skus_insumo_id ON skus(insumo_id);

-- Insertar datos de ejemplo
INSERT INTO skus (sku, proveedor, unidad_de_medida, cantidad, insumo_id)
VALUES
  ('SKU001', 'Proveedor A', 'kg', 100, 1),
  ('SKU002', 'Proveedor A', 'litro', 50, 2),
  ('SKU003', 'Proveedor B', 'unidad', 200, 3),
  ('SKU004', 'Proveedor C', 'kg', 75, 4),
  ('SKU005', 'Proveedor B', 'caja', 30, 5),
  ('SKU006', 'Proveedor D', 'paquete', 25, 6),
  ('SKU007', 'Proveedor A', 'kg', 60, 7),
  ('SKU008', 'Proveedor E', 'litro', 40, 8),
  ('SKU009', 'Proveedor C', 'unidad', 150, 9),
  ('SKU010', 'Proveedor D', 'kg', 90, 10);