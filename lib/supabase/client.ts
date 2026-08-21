import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey);
}
