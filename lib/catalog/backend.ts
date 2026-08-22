export type CatalogBackend = "remote" | "local" | "blocked";

export type CatalogStatus = {
  backend: CatalogBackend;
  hasAdminPassword: boolean;
  hasSupabaseUrl: boolean;
  hasAnonKey: boolean;
  hasServiceRole: boolean;
  hasSupabaseRead: boolean;
  siteAdminUrl: string | null;
};

export function isEphemeralHost(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function readEnv(name: string): string | null {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return null;
  }

  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1).trim() || null;
  }

  return raw;
}

export function hasSupabaseUrl(): boolean {
  return Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL"));
}

export function hasSupabaseAnonKey(): boolean {
  return Boolean(readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function hasSupabaseServiceRole(): boolean {
  return Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export function canUseRemoteCatalog(): boolean {
  return hasSupabaseUrl() && hasSupabaseServiceRole();
}

export function getCatalogBackend(): CatalogBackend {
  if (canUseRemoteCatalog()) {
    return "remote";
  }

  if (isEphemeralHost()) {
    return "blocked";
  }

  return "local";
}

export function getSiteAdminUrl(): string | null {
  const siteUrl = readEnv("NEXT_PUBLIC_SITE_URL")?.replace(/\/$/, "");
  return siteUrl ? `${siteUrl}/admin` : null;
}

export function getCatalogStatus(): CatalogStatus {
  const supabaseUrl = hasSupabaseUrl();
  const anonKey = hasSupabaseAnonKey();
  return {
    backend: getCatalogBackend(),
    hasAdminPassword: Boolean(readEnv("ADMIN_PASSWORD")),
    hasSupabaseUrl: supabaseUrl,
    hasAnonKey: anonKey,
    hasServiceRole: hasSupabaseServiceRole(),
    hasSupabaseRead: supabaseUrl && anonKey,
    siteAdminUrl: getSiteAdminUrl(),
  };
}
