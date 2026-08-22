import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readEnv } from "../catalog/backend";

export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey);
}
