"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, Paperclip, X } from "lucide-react";
import { isAllowedResumeFile, RESUME_MAX_MB, submitJobApplication } from "../lib/jobs";

const INITIAL_FORM = { fullName: "", email: "", phone: "", message: "" };

// Same portal/overlay convention as AuthModal.js — fixed inset-0 backdrop,
// click-outside (via the wrapper's onClick + the card's stopPropagation) or
// the X button to close.
export default function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isAllowedResumeFile(file)) {
      setError("Resume must be a PDF or Word document.");
      return;
    }
    if (file.size > RESUME_MAX_MB * 1024 * 1024) {
      setError(`Resume must be under ${RESUME_MAX_MB} MB.`);
      return;
    }
    setError("");
    setResumeFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitJobApplication({ job, ...form, resumeFile });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Couldn't submit your application — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 px-4 py-8" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-extrabold text-[#0b1e42]">Application submitted!</p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Thanks for applying to {job.title}. Our team will reach out if your profile is a fit.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-red-600">Apply for</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#0b1e42]">{job.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {job.department} &bull; {job.location}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42]">
                Full Name
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Aman Kumar"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal normal-case tracking-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:border-red-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42]">
                  Email
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="amankr49@gmail.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal normal-case tracking-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:border-red-500"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42]">
                  Phone
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal normal-case tracking-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:border-red-500"
                  />
                </label>
              </div>

              <label className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42]">
                Message (optional)
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Tell us why you're a good fit"
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal normal-case tracking-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:border-red-500"
                />
              </label>

              <div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {resumeFile ? "Change Resume" : "Attach Resume (optional)"}
                </button>
                {resumeFile && <p className="mt-1.5 text-xs text-slate-400">{resumeFile.name}</p>}
              </div>

              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1e42] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-wait disabled:opacity-70"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
