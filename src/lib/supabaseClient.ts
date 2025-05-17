import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;  // Reads from .env
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;  // Reads from .env

export const supabase = createClient(supabaseUrl, supabaseKey)
