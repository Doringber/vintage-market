import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { getSupabaseEnv } from "./config";

export const getSupabaseServerClient = cache(() => {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey);
});
