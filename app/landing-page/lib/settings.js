// Called client-side from HeroVideoBackground.js on purpose, not baked into
// the page at build/request time — /landing-page is otherwise a fully
// static page, and a server-side fetch here would freeze whatever the
// video URL was at the last build until the next deploy, defeating the
// point of this being admin-editable (see carcoolie-admin's Landing Page
// panel). Same convention as every other admin-editable bit of
// customer-facing content in this codebase.
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";

const LANDING_MEDIA_BUCKET = "landing-media";

// Public URL for the admin-uploaded hero background video (see
// landing_page_settings in supabase-schema.sql and carcoolie-admin's
// Landing Page panel) — null if none has been uploaded yet, or before that
// table/bucket exist, so HeroVideoBackground.js's gradient placeholder is
// the fallback in both cases, not an error.
export async function getHeroVideoUrl() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from("landing_page_settings").select("hero_video_path").eq("id", true).maybeSingle();
  if (error || !data?.hero_video_path) return null;
  return supabase.storage.from(LANDING_MEDIA_BUCKET).getPublicUrl(data.hero_video_path).data.publicUrl;
}
