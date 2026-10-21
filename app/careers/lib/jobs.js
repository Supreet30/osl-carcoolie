// Called client-side from JobOpeningsSection.js, same reasoning as
// landing-page/lib/settings.js's getHeroVideoUrl(): /careers is otherwise a
// static page, and a server-side fetch here would freeze the listings at
// whatever they were during the last build until the next deploy, defeating
// the point of this being admin-editable (see carcoolie-admin's Careers
// panel).
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";

// Active job listings, in the admin's chosen display order. Empty array
// (not an error) whenever Supabase isn't configured, the table doesn't
// exist yet, or there's genuinely nothing open — JobOpeningsSection shows
// the same "no openings right now" empty state in all three cases.
export async function getJobOpenings() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("job_openings")
    .select("id, title, department, location, employment_type, description")
    .eq("is_active", true)
    .order("sort_order");
  if (error || !data) return [];
  return data;
}

const RESUME_BUCKET = "job-applications";
const RESUME_MAX_MB = 10;

export function isAllowedResumeFile(file) {
  return (
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

export { RESUME_MAX_MB };

// Submits the Apply Now modal — job title/department are snapshotted onto
// the row itself (see job_applications' own comment in supabase-schema.sql)
// rather than just carrying jobId, so the admin's Job Applications page
// still reads sensibly even if that listing is later edited or closed.
export async function submitJobApplication({ job, fullName, email, phone, message, resumeFile }) {
  if (!isSupabaseConfigured) throw new Error("Applications aren't available yet — try again shortly, or email us directly.");

  let resumePath = null;
  let resumeFileName = null;
  if (resumeFile) {
    const path = `${Date.now()}-${resumeFile.name}`;
    const { error: uploadError } = await supabase.storage.from(RESUME_BUCKET).upload(path, resumeFile);
    if (uploadError) throw uploadError;
    resumePath = path;
    resumeFileName = resumeFile.name;
  }

  const { error } = await supabase.from("job_applications").insert({
    job_id: job.id,
    job_title: job.title,
    job_department: job.department,
    full_name: fullName,
    email,
    phone,
    message: message || null,
    resume_path: resumePath,
    resume_file_name: resumeFileName,
  });
  if (error) throw error;
}
