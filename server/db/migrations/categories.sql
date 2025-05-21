-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de subcategorías
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_subcategories_name ON subcategories(name);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- Insertar datos de ejemplo para categorías
INSERT INTO categories (name, description)
VALUES
  ('Gastos Operativos', 'Gastos relacionados con la operación diaria del negocio'),
  ('Gastos Administrativos', 'Gastos relacionados con la administración del negocio'),
  ('Gastos de Marketing', 'Gastos relacionados con publicidad y promoción'),
  ('Gastos de Personal', 'Gastos relacionados con el personal y recursos humanos'),
  ('Gastos de Infraestructura', 'Gastos relacionados con instalaciones y equipamiento');

-- Insertar datos de ejemplo para subcategorías
INSERT INTO subcategories (name, description, category_id)
VALUES
  ('Servicios Públicos', 'Agua, luz, gas, internet, etc.', 1),
  ('Materiales', 'Materiales para la operación diaria', 1),
  ('Mantenimiento', 'Mantenimiento de equipos e instalaciones', 1),
  ('Papelería', 'Material de oficina y papelería', 2),
  ('Servicios Contables', 'Honorarios de contadores y servicios fiscales', 2),
  ('Servicios Legales', 'Honorarios de abogados y servicios legales', 2),
  ('Publicidad Digital', 'Anuncios en redes sociales y Google', 3),
  ('Publicidad Impresa', 'Folletos, carteles, tarjetas, etc.', 3),
  ('Eventos', 'Organización de eventos promocionales', 3),
  ('Sueldos', 'Sueldos y salarios del personal', 4),
  ('Bonos', 'Bonos y comisiones', 4),
  ('Capacitación', 'Cursos y capacitaciones', 4),
  ('Renta', 'Renta de locales y oficinas', 5),
  ('Equipamiento', 'Compra de equipos y mobiliario', 5),
  ('Remodelaciones', 'Remodelaciones y mejoras a instalaciones', 5);