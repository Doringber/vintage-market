import type { PlaceCategory, PlaceType, SecondHandPlace } from "./places";
import wizoData from "./wizo-places.json";

type WizoPlaceRow = {
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
  source?: string;
  sourceUrl?: string;
};

export type WizoPlacesFile = {
  syncedAt: string;
  source: string;
  count: number;
  places: WizoPlaceRow[];
};

const data = wizoData as WizoPlacesFile;

export function getWizoPlaces(): SecondHandPlace[] {
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
    source: "wizo",
  }));
}

export const wizoPlacesSyncedAt = data.syncedAt;
export const wizoPlacesSource = data.source;
