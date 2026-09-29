import { NextResponse } from "next/server";
import { computeEstimate, inclusiveBreakdown } from "../../services/b2c/lib/pricing";
import { CORS_HEADERS } from "../_cors";

export { OPTIONS } from "../_cors";

// The one true source of a quote — wraps the exact same computeEstimate()
// this site's own "Get an Estimate" modal calls, so a partner app never has
// to reimplement route pricing, the vehicle-type multiplier, the luxury
// surcharge, GST, or coupon math itself. Anything we change here (a new GST
// rate, a tweaked multiplier) is picked up by every caller automatically —
// nothing to keep in sync on the partner's end.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: CORS_HEADERS });
  }

  const { fromCity, toCity, vehicleType, make, selectedAddOns, couponCode, pickupMethod, dropoffMethod } = body;

  if (!fromCity || !toCity || !vehicleType) {
    return NextResponse.json(
      { error: "fromCity, toCity, and vehicleType are required." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const estimate = await computeEstimate({
    fromCity,
    toCity,
    vehicleType,
    make,
    selectedAddOns: Array.isArray(selectedAddOns) ? selectedAddOns : [],
    couponCode,
    pickupMethod,
    dropoffMethod,
  });

  if (!estimate) {
    return NextResponse.json(
      { available: false, message: "No route between these cities yet." },
      { headers: CORS_HEADERS }
    );
  }

  // Both the tax-exclusive internals (subtotal/gst as separate figures —
  // matches what the admin panel shows) and the customer-facing inclusive
  // breakdown (GST folded into each line — matches what a customer actually
  // sees on this site) are included, since a partner app displaying prices
  // to its own end users almost certainly wants the latter.
  const inclusive = inclusiveBreakdown(estimate);

  return NextResponse.json({ available: true, estimate, inclusive }, { headers: CORS_HEADERS });
}
