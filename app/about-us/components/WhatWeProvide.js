import Image from "next/image";
import { Flag, Sparkles, TrendingUp, Truck } from "lucide-react";

// The real company timeline — each milestone gets its own icon (founding,
// fleet growth, cumulative volume, new business line).
const MILESTONES = [
  {
    number: "01",
    year: "2004",
    description: "50 Car Carriers, 1 OEM",
    icon: Flag,
  },
  {
    number: "02",
    year: "2014",
    description: "500 Car Carriers, 10 Lac Cars Handled (Cumulative)",
    icon: Truck,
  },
  {
    number: "03",
    year: "2024",
    description: "825 Car Carriers, 30 Lac Cars Handled (Cumulative)",
    icon: TrendingUp,
  },
  {
    number: "04",
    year: "2026",
    description: "Launch of Retail Relocation Business",
    icon: Sparkles,
  },
];

// No client state needed — the only interactivity (card lift on hover) is
// plain CSS (`group-hover`), so this stays a server component instead of
// shipping a client JS bundle for it.
export default function WhatWeProvide() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.05fr]">
          {/* Left: heading, then the photo — square corners (no rounding),
              fading out on its right edge into the page instead of a hard
              cut. */}
          <div>
            <p className="text-sm font-semibold text-red-600">What We Provide</p>
            <h2 className="mt-2 max-w-[650px] text-4xl font-extrabold leading-tight text-[#0b1e42] sm:text-5xl">
              We Transport <span className="text-red-600">Your Vehicles</span>
              <br />
              <span className="text-red-600">Safely</span> Across India
            </h2>

            {/* The photo itself already has the India-map/route-pin graphic
                composited in, so no separate SVG decoration is layered on
                top of it here anymore. */}
            <div className="relative mt-10 min-h-[430px] overflow-hidden">
              <Image
                src="/wwpfinal.png"
                alt="CarCoolie carrier truck on the highway, with a route map of pickup points across India overlaid above it"
                fill
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="object-cover object-center"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white" />
            </div>
          </div>

          {/* Right: the 4-step timeline. py-* (not just pt-*) so the road
              below overshoots the first/last circle by the same amount on
              both ends instead of only up top. */}
          <div className="relative py-8 lg:py-20">
            {/* Purely decorative "road" winding behind the number circles —
                stretches to the column's actual rendered height (viewBox
                height is relative, not a fixed pixel guess) so it still
                lines up regardless of how the description text wraps. */}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute left-0 top-0 hidden h-full w-14 lg:block"
            >
              <path
                d="M50 0 C-15 12 115 25 50 37 C-15 50 115 62 50 75 C-15 87 115 96 50 100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M50 0 C-15 12 115 25 50 37 C-15 50 115 62 50 75 C-15 87 115 96 50 100"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeDasharray="4 5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="relative flex flex-col gap-8">
              {MILESTONES.map(({ number, year, description, icon: Icon }, i) => (
                <div key={number} className="group relative flex items-center gap-10 lg:gap-14">
                  <span
                    className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                      i % 2 === 0 ? "bg-[#0b1e42]" : "bg-red-600"
                    }`}
                  >
                    {number}
                  </span>

                  <div className="flex flex-1 items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,35,70,0.07)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(15,35,70,0.12)]">
                    <Icon className="mt-1 h-6 w-6 shrink-0 text-[#0b1e42]" strokeWidth={2} />
                    <div>
                      <p className="text-xl font-extrabold text-red-600 sm:text-2xl">{year}</p>
                      <p className="mt-1 text-sm leading-snug text-slate-500">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
