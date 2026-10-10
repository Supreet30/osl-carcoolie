import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Records which benefit (if any — the choice is optional, see
// ReviewCard's BenefitChooser) a customer picked in "Choose Your Benefit",
// and claims one of its uploaded codes for them atomically where a pool
// exists. Runs server-side with the service_role key for two reasons: (1)
// benefit_codes has no RLS policy at all (not even read), so claiming a
// code has to happen where RLS doesn't apply; (2) booking_reviews' benefit_*
// columns are locked down by protect_review_benefit_fields() to
// service_role writes only, same as the admin Reviews page's PATCH route —
// see supabase-schema.sql for both.
//
// Because the service_role key bypasses RLS entirely, this route has to
// redo the ownership check RLS would otherwise do for the anon/
// authenticated key ("booking_reviews owner insert"/"owner read" in
// supabase-schema.sql: the booking's own signed-in customer, or anyone for
// a guest booking with customer_id null) — see resolveRequesterId/the
// customer_id check below.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// The browser has no session cookie this server route could read (sessions
// live in local/sessionStorage — see lib/supabaseClient.js) — the client
// sends its own access token instead, verified here with the anon key
// (verifying a JWT doesn't need service_role). No token (or an invalid
// one) resolves to null, same as a signed-out visitor.
async function resolveRequesterId(accessToken) {
  if (!accessToken) return null;
  const supabaseAnon = createClient(url, anonKey);
  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  if (error) return null;
  return data.user?.id ?? null;
}

export async function POST(request) {
  if (!url || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: "Benefits aren't available yet — try again shortly." }, { status: 503 });
  }

  const { bookingCode, benefitId, accessToken } = await request.json();
  if (!bookingCode) {
    return NextResponse.json({ error: "Missing booking." }, { status: 400 });
  }

  const supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("id, customer_id")
    .eq("booking_code", bookingCode)
    .single();
  if (bookingError) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const requesterId = await resolveRequesterId(accessToken);
  if (booking.customer_id !== null && booking.customer_id !== requesterId) {
    return NextResponse.json({ error: "This booking isn't linked to your account." }, { status: 403 });
  }

  const { data: review, error: reviewError } = await supabaseAdmin
    .from("booking_reviews")
    .select("benefit_selected_at")
    .eq("booking_id", booking.id)
    .maybeSingle();
  if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 });
  if (!review) {
    return NextResponse.json({ error: "Submit your review before choosing a benefit." }, { status: 400 });
  }
  if (review.benefit_selected_at) {
    return NextResponse.json({ error: "A benefit has already been chosen for this review." }, { status: 400 });
  }

  // No benefitId at all means the customer picked "No thanks" — the choice
  // is optional (see the spec this feature was built from). Just mark the
  // offer as decided, benefit_id stays null.
  if (!benefitId) {
    const { data, error } = await supabaseAdmin
      .from("booking_reviews")
      .update({ benefit_selected_at: new Date().toISOString() })
      .eq("booking_id", booking.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  const { data: benefit, error: benefitError } = await supabaseAdmin
    .from("benefits")
    .select("id, name, total_quantity, is_active, expires_at")
    .eq("id", benefitId)
    .single();
  if (benefitError || !benefit.is_active || (benefit.expires_at && new Date(benefit.expires_at) <= new Date())) {
    return NextResponse.json({ error: "This benefit is no longer available." }, { status: 400 });
  }

  const { count: codeCount, error: codeCountError } = await supabaseAdmin
    .from("benefit_codes")
    .select("id", { count: "exact", head: true })
    .eq("benefit_id", benefitId);
  if (codeCountError) return NextResponse.json({ error: codeCountError.message }, { status: 500 });

  let claimed = null;
  if (codeCount > 0) {
    // Atomic — see claim_benefit_code()'s own comment for why this is safe
    // under two customers racing for the last code.
    const { data: claimResult, error: claimError } = await supabaseAdmin.rpc("claim_benefit_code", {
      p_benefit_id: benefitId,
      p_booking_id: booking.id,
    });
    if (claimError) return NextResponse.json({ error: claimError.message }, { status: 500 });
    claimed = claimResult ?? null;
  } else if (benefit.total_quantity !== null) {
    const { count: selectedCount, error: selectedCountError } = await supabaseAdmin
      .from("booking_reviews")
      .select("booking_id", { count: "exact", head: true })
      .eq("benefit_id", benefitId);
    if (selectedCountError) return NextResponse.json({ error: selectedCountError.message }, { status: 500 });
    if (selectedCount >= benefit.total_quantity) {
      return NextResponse.json({ error: "This benefit just sold out — pick another." }, { status: 409 });
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("booking_reviews")
    .update({
      benefit_id: benefitId,
      benefit_code_id: claimed?.id ?? null,
      benefit_selected_at: now,
      benefit_status: claimed ? "issued" : "pending",
      benefit_type: benefit.name,
      benefit_reference: claimed?.code ?? null,
      benefit_issued_at: claimed ? now : null,
      updated_at: now,
    })
    .eq("booking_id", booking.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
