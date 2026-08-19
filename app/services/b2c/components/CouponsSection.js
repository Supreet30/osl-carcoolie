"use client";

import { useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";

const COUPON_CODE = "WELCOME10";

export default function CouponsSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(COUPON_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="bg-[#0b1220] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-white p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-xs font-extrabold tracking-wide text-red-600 uppercase">
              Offers
            </span>
            <h2 className="mt-4 text-4xl leading-tight font-extrabold text-[#0b1e42] sm:text-5xl">
              Move More.
              <br />
              Save More.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-500">
              Get exclusive offers and promotional discounts on your next car transportation booking.
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold tracking-wide text-red-600 uppercase">
                {COUPON_CODE}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Ticket className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-base font-extrabold text-[#0b1e42]">Get 10% OFF on your first booking</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Valid on first-time car transportation bookings across India.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Apply Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
