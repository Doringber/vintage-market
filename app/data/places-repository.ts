import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import {
  type PlaceCategory,
  type PlaceType,
  type SecondHandPlace,
} from "./places";
import { getCuratedPlaces } from "./curated-places";
import { getWizoPlaces } from "./wizo-places";

type PlaceRow = {
  slug: string;
  name: string;
  place_type: PlaceType;
  categories: PlaceCategory[] | null;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string | null;
  phone: string | null;
  hours: string | null;
  is_active: boolean | null;
};

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function mapRowToPlace(row: PlaceRow): SecondHandPlace {
  return {
    slug: row.slug,
    name: row.name,
    placeType: row.place_type,
    categories: row.categories?.length ? row.categories : ["general"],
    address: row.address,
    city: row.city,
    lat: row.lat,
    lng: row.lng,
    description: row.description ?? "מקום ליד שנייה ותרומות.",
    phone: row.phone ?? undefined,
    hours: row.hours ?? undefined,
    source: "custom",
  };
}

function mergePlaces(lists: SecondHandPlace[][]): SecondHandPlace[] {
  const bySlug = new Map<string, SecondHandPlace>();

  for (const list of lists) {
    for (const place of list) {
      bySlug.set(place.slug, place);
    }
  }

  return [...bySlug.values()].sort((a, b) =>
    a.city.localeCompare(b.city, "he"),
  );
}

async function getCustomPlacesFromSupabase(): Promise<SecondHandPlace[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("second_hand_places")
      .select(
        "slug, name, place_type, categories, address, city, lat, lng, description, phone, hours, is_active",
      )
      .eq("is_active", true)
      .order("city", { ascending: true });

    if (error || !data?.length) {
      return [];
    }

    return data.map(mapRowToPlace);
  } catch (error) {
    console.error("Failed to load custom places from Supabase.", error);
    return [];
  }
}

export async function getPlaces(): Promise<SecondHandPlace[]> {
  noStore();

  const wizoPlaces = getWizoPlaces();
  const curatedPlaces = getCuratedPlaces();
  const customPlaces = await getCustomPlacesFromSupabase();

  return mergePlaces([wizoPlaces, curatedPlaces, customPlaces]);
}
