import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { normalizePlate } from "../../../lib/truckTracking";

// Once-a-day tracking lookup for the carrier truck on a customer's own
// booking — the "In Transit" location card on My Bookings (see
// MyBookingsClient.js's TruckLocationCard). Reads carcoolie-admin's
// truck_daily_updates table (one row per plate per IST day, picked from the
// latest geotag captured before that day's 11:00 AM cutoff — see that
// table's comment in supabase-schema.sql) rather than polling live GPS, so
// the customer sees a stable, once-daily status instead of a jittery
// real-time feed. Always returns the single most recent row on file for
// this plate, whatever its date — if today's daily-update job hasn't run
// yet, that's still the latest genuinely known status, just labelled with
// its own date rather than silently passed off as "now".
//
// POST with { bookingCode, accessToken } rather than a bare plateNo GET
// (unlike carcoolie-admin's equivalent routes, which are behind the admin
// panel's own trust boundary) — this is public-facing, so the plate is
// looked up server-side from the verified booking, not taken from the
// client, so there's no way to query an arbitrary truck by just guessing at
// a plate number.
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
    return NextResponse.json({ error: "Tracking isn't available yet — try again shortly." }, { status: 503 });
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
    return NextResponse.json({ update: null });
  }

  const normalized = normalizePlate(booking.carrier_vehicle_number);
  const { data: row, error: updateError } = await supabaseAdmin
    .from("truck_daily_updates")
    .select("location, area, latitude, longitude, speed, gps_date_time, update_date, captured_at")
    .eq("plate_no", normalized)
    .order("update_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (!row) return NextResponse.json({ update: null });
  return NextResponse.json({
    update: {
      location: row.location,
      area: row.area,
      latitude: row.latitude,
      longitude: row.longitude,
      speed: row.speed,
      gpsDateTime: row.gps_date_time,
      updateDate: row.update_date,
      capturedAt: row.captured_at,
    },
  });
}
