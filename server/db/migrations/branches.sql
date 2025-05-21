-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on nombre for faster searches
CREATE INDEX IF NOT EXISTS idx_branches_nombre ON branches(nombre);

-- Add RLS (Row Level Security) policies
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view all branches
CREATE POLICY "Authenticated users can view all branches"
  ON branches
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to insert branches
CREATE POLICY "Authenticated users can insert branches"
  ON branches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update their own branches
CREATE POLICY "Authenticated users can update branches"
  ON branches
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy for authenticated users to delete branches
CREATE POLICY "Authenticated users can delete branches"
  ON branches
  FOR DELETE
  TO authenticated
  USING (true);