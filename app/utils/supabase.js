import { createClient } from '@supabase/supabase-js';

// Create a singleton instance
let supabaseClient = null;

export const useSupabase = () => {
  // Only create the client if it doesn't exist yet
  if (!supabaseClient) {
    const config = useRuntimeConfig();
    const supabaseUrl = config.public.SUPABASE_URL;
    const supabaseKey = config.public.SUPABASE_KEY;

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
};