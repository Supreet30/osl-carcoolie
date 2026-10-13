"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";

// Shared "ticket" newsletter card — used by the blog (BlogNewsletterCta.js)
// and resources (NewsletterCTA.js) pages so the design/animations/API
// wiring only live in one place. Heading is split into a plain prefix and a
// red, underlined highlight since every current use case ends on "Your
// Inbox".
export default function NewsletterTicket({ headingPrefix, headingHighlight, description }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | error | ok
  const [errorMessage, setErrorMessage] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      setShakeKey((key) => key + 1);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("ok");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
      setShakeKey((key) => key + 1);
    }
  }

  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-[#0e1222] p-6 sm:p-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[44px_44px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 12% 112%, rgba(220,38,38,0.55), transparent 45%)" }}
        />

        <div className="relative mx-auto grid max-w-3xl -rotate-[1.6deg] grid-cols-1 rounded-[22px] bg-white shadow-[0_30px_50px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:rotate-0 sm:grid-cols-[1fr_250px]">
          <div className="p-8 sm:p-12">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-1.5 w-9 rounded-full bg-red-600" />
              <span className="h-1.5 w-3 rounded-full bg-[#0b1e42]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0b1e42]" />
            </div>

            <h2 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-[#0b1e42] sm:text-4xl">
              {headingPrefix}
              <span className="relative inline-block text-red-600">
                {headingHighlight}
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-red-600"
                >
                  <path
                    d="M2 8Q25 1 50 7T100 6T150 7T198 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-500">{description}</p>

            {status === "ok" ? (
              <div className="mt-7 flex h-[62px] items-center rounded-2xl border-2 border-[#0b1e42] bg-[#0b1e42]/5 px-5 text-sm font-bold text-[#0b1e42] shadow-[6px_6px_0_#0b1e42]">
                You&apos;re subscribed — thank you!
              </div>
            ) : (
              <form
                key={shakeKey}
                onSubmit={handleSubmit}
                className="mt-7 flex gap-2.5 rounded-2xl border-2 border-[#0b1e42] bg-white p-1.5 shadow-[6px_6px_0_#0b1e42] transition-all duration-200 focus-within:translate-x-[3px] focus-within:translate-y-[3px] focus-within:border-red-600 focus-within:shadow-[3px_3px_0_#dc2626]"
                style={status === "error" ? { animation: "ticketShake 0.35s" } : undefined}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  className="h-[50px] min-w-0 flex-1 bg-transparent px-3.5 text-[15px] font-medium text-[#0b1e42] outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group inline-flex h-[50px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl bg-red-600 px-6 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? "Subscribing…" : "Subscribe"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="mt-2.5 text-xs font-semibold text-red-600">{errorMessage}</p>
            )}
          </div>

          <div className="relative flex flex-col items-center justify-center gap-6 rounded-b-[22px] bg-red-600 p-8 text-white sm:rounded-r-[22px] sm:rounded-bl-none">
            <span
              aria-hidden
              className="absolute left-[18px] right-[18px] top-0 hidden border-t-[3px] border-dashed border-white/70 sm:left-0 sm:right-auto sm:top-[18px] sm:bottom-[18px] sm:block sm:border-t-0 sm:border-l-[3px]"
            />
            <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 rounded-full bg-[#0e1222] sm:hidden" />
            <span aria-hidden className="absolute -top-2 right-0 h-4 w-4 rounded-full bg-[#0e1222] sm:hidden" />
            <span aria-hidden className="absolute -top-2 -left-2 hidden h-4 w-4 rounded-full bg-[#0e1222] sm:block" />
            <span aria-hidden className="absolute -bottom-2 -left-2 hidden h-4 w-4 rounded-full bg-[#0e1222] sm:block" />

            <span
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-red-600"
              style={{ animation: "ticketBob 3s ease-in-out infinite" }}
            >
              <Mail className="h-9 w-9" strokeWidth={2} />
            </span>

            <div
              aria-hidden
              className="relative h-12 w-32 overflow-hidden rounded opacity-90"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #fff 0 3px, transparent 3px 6px, #fff 6px 7px, transparent 7px 12px, #fff 12px 16px, transparent 16px 19px)",
              }}
            >
              <span
                className="absolute inset-x-0 h-[3px] bg-red-600 shadow-[0_0_12px_3px_rgba(255,154,161,0.9)]"
                style={{ animation: "ticketScan 2.4s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
