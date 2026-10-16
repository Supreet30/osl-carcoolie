// Server-side only — proxies enmovil's live GPS feed for the customer-facing
// "In Transit" location card on My Bookings (see
// app/api/truck-tracking/route.js and MyBookingsClient.js's
// TruckLocationCard). Trimmed mirror of carcoolie-admin's lib/truckTracking.js:
// that file also tracks "every plate any booking has ever used" for its
// Carriers dashboard, which has no equivalent here — a customer only ever
// looks up the one plate on their own booking.

const TRACKING_API_URL = "https://enmovil.io/haka/api/sendAllDataToHyundai";

// Registration numbers get typed inconsistently (spaces, lowercase) —
// normalize both sides the same way before comparing.
export function normalizePlate(value) {
  return (value ?? "").replace(/\s+/g, "").toUpperCase();
}

// Throws on failure — the caller (the API route) decides how to turn that
// into a response. No CORS headers on enmovil's end (confirmed by testing
// in carcoolie-admin), so this can never be called directly from the
// browser — same reasoning as there.
export async function fetchAllTrucks() {
  const res = await fetch(TRACKING_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Tracking service returned an error (${res.status}).`);
  const trucks = await res.json().catch(() => null);
  if (!Array.isArray(trucks)) throw new Error("Tracking service returned an unexpected response.");
  return trucks;
}
