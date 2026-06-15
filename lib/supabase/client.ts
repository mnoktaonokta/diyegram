import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL tanımlı olmalıdır");
  }

  return supabaseUrl;
}

export function createSupabaseClient() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalıdır");
  }

  return createClient(getSupabaseUrl(), supabaseAnonKey);
}

export function createSupabaseStorageClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceRoleKey ?? supabaseAnonKey;

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY veya NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalıdır",
    );
  }

  return createClient(getSupabaseUrl(), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
