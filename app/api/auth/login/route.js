import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Server-side wrapper around supabase.auth.signInWithPassword() — see
// signup/route.js's comment for why this exists and why the returned
// user.id is the same id the website's own session carries for that
// person (one Supabase project, one auth.users table, either surface can
// read/write it).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Auth isn't configured yet." }, { status: 503 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required." }, { status: 400 });
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email, fullName: data.user.user_metadata?.full_name ?? null },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
  });
}
