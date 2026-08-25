"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabels,
  placeSourceLabels,
  placeTypeLabels,
  type PlaceCategory,
  type PlaceType,
  type SecondHandPlace,
} from "../data/places";

type Props = {
  places: SecondHandPlace[];
};

type UserLocation = {
  lat: number;
  lng: number;
};

function buildPopupHtml(place: SecondHandPlace): string {
  const categories = place.categories
    .map((category) => categoryLabels[category])
    .join(" · ");

  const phoneLine = place.phone
    ? `<p><strong>טלפון:</strong> ${place.phone}</p>`
    : "";
  const hoursLine = place.hours
    ? `<p><strong>שעות:</strong> ${place.hours}</p>`
    : "";
  const sourceLine = place.source
    ? `<span class="mapPopupSource">${placeSourceLabels[place.source]}</span>`
    : "";

  return `
    <div class="mapPopup" dir="rtl">
      <span class="mapPopupBadge">${placeTypeLabels[place.placeType]}</span>
      ${sourceLine}
      <h3>${place.name}</h3>
      <p class="mapPopupMeta">${place.city} · ${categories}</p>
      <p>${place.address}</p>
      <p>${place.description}</p>
      ${hoursLine}
      ${phoneLine}
    </div>
  `;
}

export function SecondHandMap({ places }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const userMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);

  const [sourceFilter, setSourceFilter] = useState<
    NonNullable<SecondHandPlace["source"]> | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<PlaceType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | "all">(
    "all",
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "error" | "denied"
  >("idle");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const availableSources = useMemo(() => {
    const sources = new Set<NonNullable<SecondHandPlace["source"]>>();
    for (const place of places) {
      if (place.source) {
        sources.add(place.source);
      }
    }
    return [...sources];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesSource =
        sourceFilter === "all" || place.source === sourceFilter;
      const matchesType =
        typeFilter === "all" || place.placeType === typeFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        place.categories.includes(categoryFilter);
      return matchesSource && matchesType && matchesCategory;
    });
  }, [places, sourceFilter, typeFilter, categoryFilter]);

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const L = (await import("leaflet")).default;

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const defaultCenter: [number, number] = [31.8, 34.9];
    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: true,
    }).setView(defaultCenter, 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setMapReady(true);
  }, []);

  useEffect(() => {
    void initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      userMarkerRef.current = null;
    };
  }, [initMap]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !markersLayerRef.current) {
      return;
    }

    void (async () => {
      const L = (await import("leaflet")).default;
      markersLayerRef.current?.clearLayers();

      filteredPlaces.forEach((place) => {
        const marker = L.marker([place.lat, place.lng]).bindPopup(
          buildPopupHtml(place),
          { maxWidth: 320, className: "mapPopupWrapper" },
        );

        marker.on("click", () => {
          setSelectedSlug(place.slug);
        });

        markersLayerRef.current?.addLayer(marker);
      });

      if (filteredPlaces.length === 1) {
        mapRef.current?.setView(
          [filteredPlaces[0].lat, filteredPlaces[0].lng],
          13,
        );
      } else if (filteredPlaces.length > 1) {
        const bounds = L.latLngBounds(
          filteredPlaces.map((place) => [place.lat, place.lng]),
        );
        mapRef.current?.fitBounds(bounds, { padding: [40, 40] });
      }
    })();
  }, [filteredPlaces, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !userLocation) {
      return;
    }

    void (async () => {
      const L = (await import("leaflet")).default;

      userMarkerRef.current?.remove();
      userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        fillOpacity: 0.85,
        weight: 2,
      })
        .bindPopup('<div dir="rtl" class="mapPopup"><strong>המיקום שלך</strong></div>')
        .addTo(mapRef.current!);

      mapRef.current?.setView([userLocation.lat, userLocation.lng], 13, {
        animate: true,
      });
    })();
  }, [userLocation, mapReady]);

  const requestMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("idle");
      },
      (error) => {
        setLocationStatus(error.code === 1 ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const focusPlace = (place: SecondHandPlace) => {
    setSelectedSlug(place.slug);
    mapRef.current?.setView([place.lat, place.lng], 15, { animate: true });
  };

  return (
    <div className="mapExperience">
      <div className="mapToolbar">
        <div className="mapFilters">
          <label className="mapFilterGroup">
            <span>מקור</span>
            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(
                  event.target.value as
                    | NonNullable<SecondHandPlace["source"]>
                    | "all",
                )
              }
            >
              <option value="all">הכל</option>
              {availableSources.map((source) => (
                <option key={source} value={source}>
                  {placeSourceLabels[source]}
                </option>
              ))}
            </select>
          </label>

          <label className="mapFilterGroup">
            <span>סוג מקום</span>
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as PlaceType | "all")
              }
            >
              <option value="all">הכל</option>
              <option value="sell">{placeTypeLabels.sell}</option>
              <option value="give">{placeTypeLabels.give}</option>
              <option value="both">{placeTypeLabels.both}</option>
            </select>
          </label>

          <label className="mapFilterGroup">
            <span>קטגוריה</span>
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as PlaceCategory | "all",
                )
              }
            >
              <option value="all">הכל</option>
              {(Object.keys(categoryLabels) as PlaceCategory[]).map(
                (category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="button miniButton mapLocationButton"
          onClick={requestMyLocation}
          disabled={locationStatus === "loading"}
        >
          {locationStatus === "loading" ? "מאתר מיקום..." : "המיקום שלי"}
        </button>
      </div>

      {locationStatus === "denied" ? (
        <p className="mapStatus mapStatusError">
          לא ניתן לגשת למיקום — אפשר לאשר הרשאת מיקום בדפדפן.
        </p>
      ) : null}
      {locationStatus === "error" ? (
        <p className="mapStatus mapStatusError">
          לא הצלחנו לאתר את המיקום. נסו שוב או בחרו מקום מהרשימה.
        </p>
      ) : null}

      <div className="mapLayout">
        <aside className="mapSidebar" aria-label="רשימת מקומות">
          <p className="mapSidebarCount">
            {filteredPlaces.length} מקומות על המפה
          </p>
          <ul className="mapPlaceList">
            {filteredPlaces.map((place) => (
              <li key={place.slug}>
                <button
                  type="button"
                  className={`mapPlaceCard${
                    selectedSlug === place.slug ? " mapPlaceCardActive" : ""
                  }`}
                  onClick={() => focusPlace(place)}
                >
                  <span className="mapPlaceBadge">
                    {place.source
                      ? `${placeSourceLabels[place.source]} · `
                      : ""}
                    {placeTypeLabels[place.placeType]}
                  </span>
                  <strong>{place.name}</strong>
                  <span>{place.city}</span>
                  <span>
                    {place.categories
                      .map((category) => categoryLabels[category])
                      .join(" · ")}
                  </span>
                  <span>{place.address}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div
          ref={mapContainerRef}
          className="mapCanvas"
          role="application"
          aria-label="מפת מקומות יד שנייה בישראל"
        />
      </div>
    </div>
  );
}
