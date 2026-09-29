import { NextResponse } from "next/server";
import { getAddOnServices, getCities, getGstRate, getVehicleModels, getVehicleTypes } from "../../services/b2c/lib/pricing";

// Read-only bootstrap data for a third-party integration (e.g. a partner
// app) — everything needed to render the same "Get an Estimate" form this
// site has, without that app needing its own Supabase credentials or
// reimplementing which tables back which dropdown. Cities/vehicle types/
// vehicle models/add-ons/GST rate are all public-readable in Supabase
// already (RLS is `using (true)` on every one of these), so this endpoint
// isn't exposing anything that wasn't already reachable — it's just one
// call instead of five, and it doesn't hand out the Supabase project URL
// or anon key to do it.
export async function GET() {
  const [cities, vehicleTypes, vehicleModels, addOns, gstRate] = await Promise.all([
    getCities(),
    getVehicleTypes(),
    getVehicleModels(),
    getAddOnServices(),
    getGstRate(),
  ]);

  return NextResponse.json({ cities, vehicleTypes, vehicleModels, addOns, gstRate });
}
