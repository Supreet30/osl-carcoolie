import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Server-side wrapper around the same supabase.auth.signUp() the website's
// own AuthModal.js calls directly from the browser — exists so a client
// that can't (or shouldn't) embed the Supabase SDK/anon key itself, like a
// future native mobile app, can create an account over a plain REST call
// instead. Both paths write into the exact same Supabase project's
// auth.users table, so the `id` this returns is the same id the website
// would show for that person — there's no separate "app account" vs
// "website account" to keep in sync, just one identity either surface can
// authenticate.
//
// A fresh client per request (not a shared module-level instance) — same
// reasoning as every service-role route in carcoolie-admin: reusing one
// client instance across concurrent requests risks one request's auth call
// bleeding into another's in a long-lived Node process.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Auth isn't configured yet." }, { status: 503 });
  }

  const { email, password, fullName } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required." }, { status: 400 });
  }

  const supabase = createClient(url, anonKey);

  // No emailRedirectTo — unlike AuthModal.js (which has a real page to send
  // the confirmation link back to), a headless API caller has no "current
  // page" to return to. The link falls back to the Supabase project's
  // configured Site URL instead.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? null } },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // session is null until the email is confirmed — same as the website's
  // own sign-up flow (see AuthModal.js's "Check {email} to verify..."), not
  // specific to this route.
  return NextResponse.json({
    user: data.user
      ? { id: data.user.id, email: data.user.email, fullName: data.user.user_metadata?.full_name ?? null }
      : null,
    session: data.session
      ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        }
      : null,
  });
}
