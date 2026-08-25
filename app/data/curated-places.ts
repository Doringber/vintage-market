import type { PlaceCategory, PlaceType, SecondHandPlace } from "./places";
import curatedData from "./curated-places.json";

type CuratedPlaceRow = {
  slug: string;
  name: string;
  placeType: PlaceType;
  categories: PlaceCategory[];
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  phone?: string;
  hours?: string;
  source?: SecondHandPlace["source"];
  sourceUrl?: string;
};

export type CuratedPlacesFile = {
  syncedAt: string;
  sources: Record<string, string>;
  count: number;
  places: CuratedPlaceRow[];
};

const data = curatedData as CuratedPlacesFile;

export function getCuratedPlaces(): SecondHandPlace[] {
  return data.places.map((place) => ({
    slug: place.slug,
    name: place.name,
    placeType: place.placeType,
    categories: place.categories,
    address: place.address,
    city: place.city,
    lat: place.lat,
    lng: place.lng,
    description: place.description,
    phone: place.phone,
    hours: place.hours,
    source: place.source,
    sourceUrl: place.sourceUrl,
  }));
}

export const curatedPlacesSyncedAt = data.syncedAt;
export const curatedPlacesSources = data.sources;
