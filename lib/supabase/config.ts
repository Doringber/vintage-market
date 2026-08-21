type SupabaseEnv = {
  url: string;
  anonKey: string;
};

function getEnvValue(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        "Add it to your .env.local file.",
    );
  }

  return value;
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: getEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
