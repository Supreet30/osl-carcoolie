// Shared mock booking data — there's no backend wired up yet, so the
// estimate modal and the /services/b2c/book page both read from this one
// illustrative example so the numbers never drift out of sync between them.

export const MOCK_QUOTE = {
  pickupCity: "New Delhi, DL",
  pickupPin: "110001",
  dropCity: "Mumbai, MH",
  dropPin: "400001",
  distance: "1,400 km",
  distanceApprox: "~1,420 km",
  vehicleType: "Premium Sedan",
  pickupMethod: "Driver Pickup",
  date: "20 Aug, 2026",
  timeSlot: "11:00 AM",
  transportation: 20000,
  serviceCharges: 1000,
  valueAddedServices: 2000,
  gstRate: 0.18,
  couponCode: "WELCOME10",
  couponDiscount: 2500,
};

export function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function computeQuoteTotals(couponApplied = true) {
  const base = MOCK_QUOTE.transportation + MOCK_QUOTE.serviceCharges + MOCK_QUOTE.valueAddedServices;
  const gst = Math.round(base * MOCK_QUOTE.gstRate);
  const subtotal = base + gst;
  const discount = couponApplied ? MOCK_QUOTE.couponDiscount : 0;
  const total = subtotal - discount;
  return { base, gst, subtotal, discount, total };
}
