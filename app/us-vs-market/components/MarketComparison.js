"use client";

import { useState } from "react";
import { Check, Clock, Headphones, Receipt, SlidersHorizontal } from "lucide-react";

const ROWS = [
  { icon: Clock, feature: "Turnaround Time", market: "Slow / Generic", ours: "Fast / Custom" },
  { icon: Headphones, feature: "Support", market: "Ticket / Based", ours: "Dedicated Manager" },
  { icon: Receipt, feature: "Pricing", market: "Hidden Fees", ours: "Fully Transparent" },
  { icon: SlidersHorizontal, feature: "Customization", market: "One Size Fits All", ours: "Tailored to You" },
];

// Fixed row/header heights so the feature card, connector column, and
// CarCoolie card stay pixel-aligned without measuring anything at runtime.
const HEADER_H = "h-14";
const ROW_H = "h-20";

export default function MarketComparison() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-red-600">The CarCoolie Difference</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              <span className="block text-[#0b1e42]">See How CarCoolie</span>
              <span className="block text-red-600">Raises the Standard</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">
            Traditional car transportation often comes with delays, unclear pricing and limited
            support. We built CarCoolie to change that.
          </p>
        </div>

        <div className="mt-12 flex items-start">
          {/* Feature / Market Standard card */}
          <div className="relative z-10 flex-70 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-900/5">
            <div className={`grid ${HEADER_H} grid-cols-[1.3fr_1fr] items-center px-6`}>
              <span className="text-sm font-bold uppercase tracking-wide text-slate-400">
                Feature
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-slate-400">
                Market Standard
              </span>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.feature}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`grid ${ROW_H} grid-cols-[1.3fr_1fr] items-center border-t border-slate-100 px-6 transition-colors ${
                  hovered === i ? "bg-red-50/50" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                      hovered === i ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <row.icon className="h-6 w-6" />
                  </span>
                  <span className="font-bold text-[#0b1e42]">{row.feature}</span>
                </span>
                <span className="flex items-center gap-1.5 text-md text-slate-400">
                  <span className="text-slate-300">—</span>
                  <span className="line-through decoration-slate-300">{row.market}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Dashed connector — only the hovered row's line is shown */}
          <div className="hidden w-14 shrink-0 flex-col sm:flex">
            <div className={HEADER_H} />
            {ROWS.map((row, i) => (
              <div key={row.feature} className={`relative flex ${ROW_H} items-center justify-center`}>
                <div
                  className={`absolute inset-y-0 -left-3 -right-3 z-0 my-auto h-0 border-t-2 border-dashed border-red-400 transition-opacity duration-300 ${
                    hovered === i ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* CarCoolie card */}
          <div className="relative z-10 flex-30 overflow-hidden rounded-3xl bg-red-50/30 ring-1 ring-red-200">
            <div className={`flex ${HEADER_H} items-center px-6`}>
              <span className="text-sm font-bold uppercase tracking-wide text-red-600">
                CarCoolie
              </span>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.feature}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`flex ${ROW_H} items-center gap-2 border-t border-red-100 px-6 transition-colors ${
                  hovered === i ? "bg-red-50" : ""
                }`}
              >
                <Check className="h-4 w-4 shrink-0 text-red-600" />
                <span className="font-bold text-md text-[#0b1e42]">{row.ours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
