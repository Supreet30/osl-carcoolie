import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// AuthModal.js's "Remember me" checkbox toggles this before a password
// sign-in — true (the default, used by every other sign-in path too, since
// only the password form has the checkbox) writes the session to
// localStorage (survives closing the browser); false writes to
// sessionStorage (cleared when the tab/browser closes).
let rememberMe = true;
export function setRememberMe(value) {
  rememberMe = value;
}

// A single storage object so the Supabase client (a module-level singleton)
// can honor rememberMe per sign-in without being recreated — it reads
// whichever of the two actually has the key, and on write, clears the other
// one so a previous session doesn't linger somewhere unexpected.
const rememberAwareStorage = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    const [primary, other] = rememberMe
      ? [window.localStorage, window.sessionStorage]
      : [window.sessionStorage, window.localStorage];
    primary.setItem(key, value);
    other.removeItem(key);
  },
  removeItem(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

// `supabase` is null when the env vars haven't been set — callers fall back
// to the local dummy data / localStorage so the demo keeps working even
// before a Supabase project is wired up. See supabase-schema.sql (repo
// root) for the schema this expects once it IS configured.
export const supabase = url && anonKey
  ? createClient(url, anonKey, { auth: { flowType: "pkce", storage: rememberAwareStorage } })
  : null;

export const isSupabaseConfigured = Boolean(supabase);
