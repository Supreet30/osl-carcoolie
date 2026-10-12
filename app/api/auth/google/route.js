import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Google sign-in for a client that can't do a browser redirect — the
// website's own Google button (AuthModal.js's handleGoogleSignIn) opens
// Google's consent screen in a popup and lets Supabase's OAuth redirect
// flow hand back a session; a native app has no browser popup to do that
// in. The standard mobile-native pattern instead: the app uses Google's own
// native Sign-In SDK to get an ID token directly from the device, then
// exchanges that token for a Supabase session here via
// supabase.auth.signInWithIdToken() — one Google account's email, one
// Supabase auth.users row, reached by either sign-in path.
//
// Requires the Google provider to be enabled in the Supabase dashboard
// (Authentication → Providers → Google) with the app's OAuth client ID(s)
// allow-listed — same provider config the website's redirect-based flow
// already uses, nothing extra to set up Supabase-side for this route.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Auth isn't configured yet." }, { status: 503 });
  }

  const { idToken } = await request.json().catch(() => ({}));
  if (!idToken) {
    return NextResponse.json({ error: "idToken is required." }, { status: 400 });
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
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
