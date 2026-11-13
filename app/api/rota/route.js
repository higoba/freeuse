import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

function isLatLngString(str) {
  if (!str || typeof str !== "string") return false;
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(str.trim());
}

function parseLatLng(str) {
  const [lat, lng] = str.split(",").map((s) => Number(s.trim()));
  return { latitude: lat, longitude: lng };
}

// Geocodificação reversa de coordenadas (latitude, longitude) para nome legível
async function reverseGeocode(lat, lng, googleKey) {
  if (googleKey) {
    try {
      const url = `${GOOGLE_GEOCODE_URL}?latlng=${lat},${lng}&key=${googleKey}&language=pt-BR`;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = await response.json();
      if (data.status === "OK" && data.results?.[0]) {
        // Tenta achar componente de cidade e estado
        const result = data.results[0];
        const cityComp = result.address_components?.find((c) => c.types.includes("administrative_area_level_2") || c.types.includes("locality"));
        const stateComp = result.address_components?.find((c) => c.types.includes("administrative_area_level_1"));
        if (cityComp && stateComp) {
          return `${cityComp.long_name} - ${stateComp.short_name}`;
        }
        return result.formatted_address.split(",").slice(0, 2).join(",").trim();
      }
    } catch {
      // Fallback para Nominatim
    }
  }

  // Fallback para OpenStreetMap Nominatim
  try {
    const url = `${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt-BR`;
    const response = await fetch(url, {
      headers: { "User-Agent": "FreeUseStore-TravelCalculator/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    const data = await response.json();
    if (data?.address) {
      const city = data.address.city || data.address.town || data.address.municipality || data.address.village || data.address.county;
      const state = data.address.state_code || data.address.state;
      if (city && state) return `${city} - ${state}`;
      if (city) return city;
    }
    if (data?.display_name) {
      return data.display_name.split(",").slice(0, 2).join(",").trim();
    }
  } catch {
    // Ignora erro
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Geocodifica texto para lat/lng via Nominatim quando não há chave Google
async function geocodeText(query) {
  try {
    const url = `${NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
    const response = await fetch(url, {
      headers: { "User-Agent": "FreeUseStore-TravelCalculator/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    const data = await response.json();
    if (data && data[0]) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    }
  } catch {
    // Ignora erro
  }
  return null;
}

// Consulta de rota via Google Routes API v2
async function calculateGoogleRoute(origin, destination, apiKey) {
  const originWaypoint = isLatLngString(origin)
    ? { location: { latLng: parseLatLng(origin) } }
    : { address: origin };

  const destWaypoint = isLatLngString(destination)
    ? { location: { latLng: parseLatLng(destination) } }
    : { address: destination };

  const response = await fetch(GOOGLE_ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.travelAdvisory.tollInfo,routes.description",
    },
    body: JSON.stringify({
      origin: originWaypoint,
      destination: destWaypoint,
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      extraComputations: ["TOLLS"],
    }),
    signal: AbortSignal.timeout(10000),
  });

  const data = await response.json();
  if (!response.ok || !data.routes?.[0]) {
    throw new Error(data.error?.message || "Não foi possível calcular a rota no Google Maps.");
  }

  const route = data.routes[0];
  const distanceKm = Number(((route.distanceMeters || 0) / 1000).toFixed(1));
  const durationSeconds = Number.parseInt(String(route.duration || "0").replace("s", ""), 10) || 0;
  const durationMinutes = Math.round(durationSeconds / 60);
  const averageSpeedKmh = durationMinutes > 0 ? Math.round(distanceKm / (durationMinutes / 60)) : null;

  // Extrai valor de pedágios
  let tollCost = 0;
  let hasTolls = false;
  const tollInfo = route.travelAdvisory?.tollInfo;
  if (tollInfo?.estimatedPrice && Array.isArray(tollInfo.estimatedPrice)) {
    for (const price of tollInfo.estimatedPrice) {
      const units = Number(price.units || 0);
      const nanos = Number(price.nanos || 0);
      const value = units + nanos / 1e9;
      tollCost += value;
      hasTolls = true;
    }
  }
  tollCost = Number(tollCost.toFixed(2));

  return {
    distanceKm,
    durationMinutes,
    averageSpeedKmh,
    tollCost,
    hasTolls,
    routeDescription: route.description || null,
    source: "google",
    sourceName: "Google Maps Platform (Routes API)",
  };
}

// Fallback gratuito usando OSRM quando não há chave Google
async function calculateOsrmRoute(origin, destination) {
  let originCoords = isLatLngString(origin) ? parseLatLng(origin) : null;
  let destCoords = isLatLngString(destination) ? parseLatLng(destination) : null;

  if (!originCoords) originCoords = await geocodeText(origin);
  if (!destCoords) destCoords = await geocodeText(destination);

  if (!originCoords || !destCoords) {
    throw new Error("Não foi possível localizar os endereços informados. Digite cidade e estado ou informe a distância manualmente.");
  }

  const originLat = originCoords.latitude || originCoords.lat;
  const originLng = originCoords.longitude || originCoords.lng;
  const destLat = destCoords.latitude || destCoords.lat;
  const destLng = destCoords.longitude || destCoords.lng;

  const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
  const response = await fetch(url, {
    headers: { "User-Agent": "FreeUseStore-TravelCalculator/1.0" },
    signal: AbortSignal.timeout(8000),
  });

  const data = await response.json();
  if (!response.ok || data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error("Não foi possível traçar a rota entre esses pontos.");
  }

  const route = data.routes[0];
  const distanceKm = Number(((route.distance || 0) / 1000).toFixed(1));
  const durationMinutes = Math.round((route.duration || 0) / 60);
  const averageSpeedKmh = durationMinutes > 0 ? Math.round(distanceKm / (durationMinutes / 60)) : null;

  return {
    distanceKm,
    durationMinutes,
    averageSpeedKmh,
    tollCost: 0,
    hasTolls: false,
    routeDescription: null,
    source: "osrm",
    sourceName: "Cálculo automático de rota",
    notice: "Distância e tempo calculados automaticamente. Para obter o valor exato dos pedágios via Google Maps, configure GOOGLE_MAPS_API_KEY no arquivo .env.local.",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  // Caso 1: Geolocalização reversa (lat, lng -> nome amigável)
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (lat && lng) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return NextResponse.json({ error: "Coordenadas inválidas." }, { status: 400 });
    }
    const address = await reverseGeocode(latNum, lngNum, apiKey);
    return NextResponse.json({ address, lat: latNum, lng: lngNum });
  }

  // Caso 2: Cálculo de rota entre origem e destino
  const origin = (searchParams.get("origin") || "").trim();
  const destination = (searchParams.get("destination") || "").trim();

  if (!origin || !destination) {
    return NextResponse.json({ error: "Informe a origem e o destino para calcular a rota." }, { status: 400 });
  }

  if (origin.length > 200 || destination.length > 200) {
    return NextResponse.json({ error: "Origem ou destino muito longos (máximo 200 caracteres)." }, { status: 400 });
  }

  try {
    if (apiKey) {
      try {
        const result = await calculateGoogleRoute(origin, destination, apiKey);
        return NextResponse.json(result);
      } catch (googleError) {
        // Se a chamada do Google falhar (ex: chave sem quota), tenta o fallback
        const fallback = await calculateOsrmRoute(origin, destination);
        return NextResponse.json({
          ...fallback,
          warning: `Google Routes indisponível (${googleError.message}). Usando cálculo alternativo de distância.`,
        });
      }
    }

    // Sem chave: usa cálculo automático alternativo
    const fallback = await calculateOsrmRoute(origin, destination);
    return NextResponse.json(fallback);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Não foi possível calcular a rota." }, { status: 422 });
  }
}
