"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

export default function BlogNewsletterCta() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[24px] bg-linear-to-br from-[#0b1220] via-[#0b1220] to-[#2a0a0a] px-6 py-6 shadow-2xl ring-1 ring-red-600/20 sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[32px_32px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-red-600/30 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-4 self-start lg:self-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
              <Mail className="h-9 w-9" strokeWidth={2} />
            </span>
            <div>
              <p className="text-3xl font-semibold text-white">
                Get Vehicle Shipping Tips Straight To Your Inbox
              </p>
              <p className="mt-1 text-md text-slate-400">
                Get the latest car transport news, guides, tips and offers delivered to your inbox.
              </p>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 lg:w-auto">
            {submitted ? (
              <p className="text-sm font-bold text-white">You&apos;re subscribed — thank you!</p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex w-full items-center overflow-hidden rounded-full bg-white lg:w-96"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  className="w-full flex-1 bg-transparent px-5 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="m-1 shrink-0 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                >
                  Subscribe
                </button>
              </form>
            )}
            <Send
              aria-hidden
              className="hidden h-5 w-5 shrink-0 -rotate-12 text-red-500 sm:block"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
