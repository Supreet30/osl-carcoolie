import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// `supabase` is null when the env vars haven't been set — callers fall back
// to the local dummy data / localStorage so the demo keeps working even
// before a Supabase project is wired up. See supabase-schema.sql (repo
// root) for the schema this expects once it IS configured.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
