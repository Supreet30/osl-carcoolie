import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { fetchAllTrucks, normalizePlate } from "../../../lib/truckTracking";

// Live GPS lookup for the carrier truck on a customer's own booking — the
// "In Transit" location card on My Bookings (see MyBookingsClient.js's
// TruckLocationCard). POST with { bookingCode, accessToken } rather than a
// bare plateNo GET (unlike carcoolie-admin's equivalent route, which is
// behind the admin panel's own trust boundary) — this is public-facing, so
// the plate is looked up server-side from the verified booking, not taken
// from the client, so there's no way to query an arbitrary truck by just
// guessing at a plate number.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Same pattern as /api/select-booking-benefit's resolveRequesterId — no
// session cookie to read server-side, so the client sends its own access
// token, verified here with the anon key.
async function resolveRequesterId(accessToken) {
  if (!accessToken) return null;
  const supabaseAnon = createClient(url, anonKey);
  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  if (error) return null;
  return data.user?.id ?? null;
}

export async function POST(request) {
  if (!url || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: "Live tracking isn't available yet — try again shortly." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const bookingCode = body?.bookingCode;
  if (!bookingCode) {
    return NextResponse.json({ error: "Missing booking." }, { status: 400 });
  }

  const supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("customer_id, carrier_vehicle_number")
    .eq("booking_code", bookingCode)
    .single();
  if (bookingError) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const requesterId = await resolveRequesterId(body?.accessToken);
  if (booking.customer_id !== null && booking.customer_id !== requesterId) {
    return NextResponse.json({ error: "This booking isn't linked to your account." }, { status: 403 });
  }

  if (!booking.carrier_vehicle_number) {
    return NextResponse.json({ truck: null });
  }

  let trucks;
  try {
    trucks = await fetchAllTrucks();
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  const normalized = normalizePlate(booking.carrier_vehicle_number);
  const truck = trucks.find((t) => normalizePlate(t.plateNo) === normalized) ?? null;
  return NextResponse.json({ truck });
}
