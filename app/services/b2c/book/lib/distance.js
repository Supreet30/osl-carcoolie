// Real driving distance between two points via Google's Routes API — backs
// the automatic CarCoolie-pickup/drop-off distance surcharge (see
// driverLegCharge in ../../lib/pricing.js and its use in BookingForm.js).
//
// Called directly from the browser, not proxied through our own server —
// same reasoning as carcoolie-admin's CarriersMap.js: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
// is HTTP-referrer-restricted, so a plain server-side request with no
// Referer header gets rejected, but a real browser fetch from this site
// passes. Requires the Routes API enabled on the same Google Cloud project
// (already turned on for the admin panel's breadcrumb-trail feature).

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

// `origin`/`destination` are { lat, lng }. Returns the driving distance in
// km, or null if either point is missing, the key isn't configured, or the
// API call fails/returns nothing usable — callers treat null as "distance
// not known yet", not an error to surface loudly (see driverLegCharge's own
// null handling).
export async function fetchDrivingDistanceKm(origin, destination) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key || !origin || !destination) return null;
  if (typeof origin.lat !== "number" || typeof origin.lng !== "number") return null;
  if (typeof destination.lat !== "number" || typeof destination.lng !== "number") return null;

  try {
    const res = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: "DRIVE",
      }),
    });
    const json = await res.json();
    const meters = json?.routes?.[0]?.distanceMeters;
    return typeof meters === "number" ? meters / 1000 : null;
  } catch {
    return null;
  }
}
