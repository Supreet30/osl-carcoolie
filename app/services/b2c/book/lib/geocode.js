// Free, keyless geocoding helpers built on the browser's Geolocation API and
// OpenStreetMap's Nominatim reverse-geocoding service — good enough for a
// demo; production traffic should route through a paid provider or a proxy
// that respects Nominatim's usage policy (max ~1 request/second).

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation isn't supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export async function reverseGeocode(lat, lng) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

// Used instead of reverseGeocode() when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is
// set, so the "Select on Map" picker's address lookup matches whichever
// map provider it's actually showing. Goes through the JS SDK's Geocoder
// (not the raw REST endpoint) deliberately — Google's server-side REST
// Geocoding API rejects any key with HTTP referrer restrictions, which is
// exactly the restriction type recommended (and used here) for a
// browser-facing Maps JavaScript API key.
export async function reverseGeocodeGoogle(lat, lng) {
  const { importLibrary } = await import("@googlemaps/js-api-loader");
  const { Geocoder } = await importLibrary("geocoding");
  const { results } = await new Geocoder().geocode({ location: { lat, lng } });
  if (!results?.length) throw new Error("No address found for this location");
  return results[0].formatted_address;
}

// Live suggestions for the "Select on Map" search box, as the customer
// types — the real Google Maps site backs this with the Places
// Autocomplete API, but that's a separate API from Geocoding/Maps
// JavaScript and isn't enabled on this project (confirmed: both the new
// and legacy Places endpoints return "not enabled"/REQUEST_DENIED with
// this key). Geocoding a partial query instead and showing whatever
// candidates it returns is a reasonable stand-in — same free/keyless
// Nominatim endpoint forwardGeocode() already uses, just with more than
// one result kept.
export async function searchSuggestions(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.map((d) => ({ lat: Number(d.lat), lng: Number(d.lon), address: d.display_name }));
}

// Same reasoning as reverseGeocodeGoogle() — goes through the JS SDK's
// Geocoder rather than a raw REST call, since a referrer-restricted key
// (correct for a browser-facing Maps JavaScript API key) is rejected by
// Google's server-side REST Geocoding endpoint.
export async function searchSuggestionsGoogle(query) {
  const { importLibrary } = await import("@googlemaps/js-api-loader");
  const { Geocoder } = await importLibrary("geocoding");
  let results;
  try {
    ({ results } = await new Geocoder().geocode({ address: query }));
  } catch {
    // geocode() rejects (rather than resolving with an empty array) on
    // ZERO_RESULTS — a normal "nothing matches yet" state while typing,
    // not a real error.
    return [];
  }
  return (results ?? [])
    .slice(0, 5)
    .map((r) => ({ lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), address: r.formatted_address }));
}

// Forward geocoding for the "Select on Map" picker's search box — turns
// typed text (e.g. "Connaught Place, Delhi") into a pin, the same way
// typing into Google Maps' own search bar and hitting Enter jumps the map
// there. Used as the Enter-key fallback when no suggestion is showing yet.
export async function forwardGeocode(query) {
  const [first] = await searchSuggestions(query);
  if (!first) throw new Error(`No results found for "${query}"`);
  return first;
}

export async function forwardGeocodeGoogle(query) {
  const [first] = await searchSuggestionsGoogle(query);
  if (!first) throw new Error(`No results found for "${query}"`);
  return first;
}
