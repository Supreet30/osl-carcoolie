import { isSupabaseConfigured, supabase } from "./supabaseClient";
import { DEFAULT_LEGAL } from "./legalDefaults";

// Admin-editable markdown from the legal_pages table, falling back to the
// dummy copy when Supabase isn't configured, the query fails, or no row
// exists yet.
export async function getLegalPage(slug) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("legal_pages")
      .select("title, content_md, updated_at")
      .eq("slug", slug)
      .maybeSingle();
    if (!error && data?.content_md?.trim()) {
      return { title: data.title, content: data.content_md, updatedAt: data.updated_at };
    }
  }
  return { ...DEFAULT_LEGAL[slug], updatedAt: null };
}
