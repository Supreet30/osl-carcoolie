"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="relative bg-white px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#0b1e42] px-8 py-12 shadow-2xl sm:px-12 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(239,68,68,0.15),transparent_55%)]"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-500">
              Stay Updated
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Subscribe to Our Resources
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-red-600" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Get the latest articles, tips, success stories, and updates about car transport
              delivered to your inbox.
            </p>
          </div>

          <div>
            {submitted ? (
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-white">You&apos;re subscribed!</p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Watch your inbox for the latest resources.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email address"
                    className="w-full flex-1 rounded-xl bg-white px-5 py-3.5 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 sm:rounded-r-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700 sm:rounded-l-none"
                  >
                    Subscribe Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
