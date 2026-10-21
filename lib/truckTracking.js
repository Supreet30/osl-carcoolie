// Server-side only — used by the customer-facing "In Transit" location card
// on My Bookings (see app/api/truck-tracking/route.js and
// MyBookingsClient.js's TruckLocationCard), which reads carcoolie-admin's
// once-a-day truck_daily_updates table rather than polling enmovil's live
// feed directly (that live call now only happens on the admin side — see
// carcoolie-admin's lib/truckTracking.js and /api/truck-tracking/snapshot).

// Registration numbers get typed inconsistently (spaces, lowercase) —
// normalize both sides the same way before comparing.
export function normalizePlate(value) {
  return (value ?? "").replace(/\s+/g, "").toUpperCase();
}
