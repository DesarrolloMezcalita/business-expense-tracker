-- Create password_resets table for storing password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS password_resets_user_id_idx ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);

-- Add last_login column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;