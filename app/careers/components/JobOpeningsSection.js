"use client";

import { useEffect, useState } from "react";
import { Briefcase, Loader2, MapPin, Send } from "lucide-react";
import Markdown from "../../components/Markdown";
import { getJobOpenings } from "../lib/jobs";
import ApplyModal from "./ApplyModal";

// Matches document_types' category labels' convention (a small, fixed
// lookup next to the fetch) — carcoolie-admin's Careers panel only ever
// offers these four values (see job_openings' check constraint in
// supabase-schema.sql), so this never needs a fallback beyond the raw value.
const EMPLOYMENT_TYPE_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const APPLY_EMAIL = "carcooliesupport@oslgroup.co.in";

function JobCard({ job, onApply }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-[#0b1e42]">{job.title}</h3>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
              {EMPLOYMENT_TYPE_LABELS[job.employment_type] ?? job.employment_type}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              {job.department}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {job.location}
            </span>
          </div>
          {job.description && (
            <div className="mt-3 max-w-2xl [&_p]:my-0 [&_ol]:my-1 [&_ul]:my-1">
              <Markdown source={job.description} />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onApply(job)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          <Send className="h-3.5 w-3.5" />
          Apply Now
        </button>
      </div>
    </div>
  );
}

export default function JobOpeningsSection() {
  const [state, setState] = useState({ loading: true, jobs: [] });
  const [applyingJob, setApplyingJob] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getJobOpenings().then((jobs) => {
      if (!cancelled) setState({ loading: false, jobs });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="openings" className="relative overflow-hidden bg-slate-50 px-6 py-20 sm:py-24">
      <div className="relative mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-red-600">Open Positions</p>
        <h2 className="mt-2 text-4xl font-extrabold leading-tight text-[#0b1e42] sm:text-5xl">
          Current <span className="text-red-600">Openings</span>
        </h2>

        <div className="mt-10 flex flex-col gap-4">
          {state.loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading&hellip;
            </div>
          ) : state.jobs.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-semibold text-[#0b1e42]">No open positions right now.</p>
              <p className="mt-1 text-sm text-slate-500">
                Check back soon, or write to us at{" "}
                <a href={`mailto:${APPLY_EMAIL}`} className="font-semibold text-red-600 hover:underline">
                  {APPLY_EMAIL}
                </a>{" "}
                with your profile — we&apos;re always open to hearing from good people.
              </p>
            </div>
          ) : (
            state.jobs.map((job) => <JobCard key={job.id} job={job} onApply={setApplyingJob} />)
          )}
        </div>
      </div>

      {applyingJob && <ApplyModal job={applyingJob} onClose={() => setApplyingJob(null)} />}
    </section>
  );
}
