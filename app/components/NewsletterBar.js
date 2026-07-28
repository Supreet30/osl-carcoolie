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

  return (
    <>
      <section className="flex flex-1 items-center bg-[#0b1e42] border-b-4 border-red-600 px-6 py-10 md:px-16 md:py-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 text-white"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />
              </svg>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm font-extrabold uppercase tracking-wide text-white md:text-base">
                Get Notified When We Go Live
              </p>
              <p className="text-xs text-gray-300 md:text-sm">
                Leave your email and be the first to know when we launch.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col md:w-auto">
            <form
              onSubmit={handleSubmit}
              className="flex w-full overflow-hidden rounded-md"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full min-w-0 flex-1 bg-white px-4 py-3 text-sm text-gray-800 outline-none md:w-72"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 whitespace-nowrap bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "SENDING..." : "NOTIFY ME"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </form>
            {error && (
              <p className="mt-2 text-center text-xs font-semibold text-red-300 md:text-left">
                {error}
              </p>
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
