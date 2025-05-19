# Supabase Setup for User Management System

This document explains how to set up Supabase for the user management system.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

## Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Create the users table by executing the following SQL:

```sql
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to all users" ON public.users
  FOR SELECT USING (true);

-- Create policy to allow insert access to authenticated users
CREATE POLICY "Allow insert access to authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow update access to authenticated users
CREATE POLICY "Allow update access to authenticated users" ON public.users
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow delete access to authenticated users
CREATE POLICY "Allow delete access to authenticated users" ON public.users
  FOR DELETE USING (auth.role() = 'authenticated');
```

## Environment Variables

Update the `.env` file with your Supabase URL and anon key:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under "API".

## Authentication (Optional)

If you want to implement authentication:

1. Go to the Authentication settings in your Supabase dashboard
2. Configure the authentication providers you want to use (Email, Google, GitHub, etc.)
3. Update the client code to handle authentication

## Testing the Connection

After setting up Supabase and updating the environment variables, restart the application and verify that:

1. The users table is created in Supabase
2. The application can connect to Supabase
3. CRUD operations work correctly

## Troubleshooting

If you encounter issues:

1. Check that your Supabase URL and key are correct
2. Verify that the users table is created correctly
3. Check the browser console for error messages
4. Ensure that RLS policies are configured correctly if you're using authentication
