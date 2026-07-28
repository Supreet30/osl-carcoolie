"use client";

import { useState } from "react";

export default function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      setShowModal(true);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const bellIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-full w-full text-white"
    >
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />
    </svg>
  );

  const sendIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  );

  return (
    <>
      {/* Hero image with the mobile form overlaid on the placeholder baked into mobile.png */}
      <div className="relative shrink-0 grow-0">
        <picture>
          <source media="(min-width: 1024px)" srcSet="/landing-page.png" />
          <img
            src="/mobile.png"
            alt="OSL Car Coolie - Website Coming Soon"
            className="w-full h-auto"
          />
        </picture>

        <div className="absolute left-[4.5%] top-[72.3%] flex w-[91%] flex-col items-center gap-1.5 px-3 py-3 text-center lg:hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-600 p-2">
            {bellIcon}
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-white leading-tight">
            Get Notified When We Go Live
          </p>
          <p className="text-[10px] leading-tight text-gray-300">
            Leave your email and be the first to know when we launch.
          </p>

          <form onSubmit={handleSubmit} className="mt-1 flex w-full flex-col gap-1.5">
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full min-w-0 rounded-lg bg-white px-3 py-2 text-xs text-gray-800 outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "SENDING..." : "NOTIFY ME"}
              {sendIcon}
            </button>
          </form>
          {error && (
            <p className="text-[11px] font-semibold text-red-300">{error}</p>
          )}
        </div>
      </div>

      {/* Desktop: full-bleed bar below the hero image */}
      <section className="hidden lg:flex flex-1 min-h-55 items-center bg-[#0b1e42] border-b-4 border-red-600 px-16 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-600 p-3">
              {bellIcon}
            </div>
            <div>
              <p className="text-base font-extrabold uppercase tracking-wide text-white">
                Get Notified When We Go Live
              </p>
              <p className="text-sm text-gray-300">
                Leave your email and be the first to know when we launch.
              </p>
            </div>
          </div>

          <div className="flex w-auto max-w-md flex-col">
            <form onSubmit={handleSubmit} className="flex w-full overflow-hidden rounded-md">
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-72 min-w-0 flex-1 bg-white px-4 py-3 text-sm text-gray-800 outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 whitespace-nowrap bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "SENDING..." : "NOTIFY ME"}
                {sendIcon}
              </button>
            </form>
            {error && (
              <p className="mt-2 text-left text-xs font-semibold text-red-300">{error}</p>
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-7 w-7 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-extrabold text-[#0b1e42]">Thank you!</h2>
            <p className="mb-6 text-sm text-gray-600">
              We&apos;ll contact you shortly.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full rounded-md bg-[#0b1e42] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#132a56]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
