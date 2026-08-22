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

export function hasSupabaseUrl(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
}

export function hasSupabaseAnonKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
}

export function hasSupabaseServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return siteUrl ? `${siteUrl}/admin` : null;
}

export function getCatalogStatus(): CatalogStatus {
  const supabaseUrl = hasSupabaseUrl();
  const anonKey = hasSupabaseAnonKey();
  return {
    backend: getCatalogBackend(),
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD?.trim()),
    hasSupabaseUrl: supabaseUrl,
    hasAnonKey: anonKey,
    hasServiceRole: hasSupabaseServiceRole(),
    hasSupabaseRead: supabaseUrl && anonKey,
    siteAdminUrl: getSiteAdminUrl(),
  };
}
