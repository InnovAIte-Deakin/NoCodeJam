// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL in .env.local");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
