"use client";

import { useState } from "react";
import Image from "next/image";
import { Flag, Sparkles, TrendingUp, Truck } from "lucide-react";

// The real company timeline — each milestone gets its own icon (founding,
// fleet growth, cumulative volume, new business line) instead of the same
// static badge stack every card used to show regardless of which one was
// active.
const MILESTONES = [
  {
    number: "01",
    year: "2004",
    description: "50 Car Carriers, 1 OEM",
    icon: Flag,
    image: "/finalimages/company-numbers/years-exp.JPG",
  },
  {
    number: "02",
    year: "2014",
    description: "500 Car Carriers, 10 Lac Cars Handled (Cumulative)",
    icon: Truck,
    image: "/finalimages/company-numbers/fleet.JPG",
  },
  {
    number: "03",
    year: "2024",
    description: "825 Car Carriers, 30 Lac Cars Handled (Cumulative)",
    icon: TrendingUp,
    image: "/finalimages/company-numbers/cars-delivery.png",
  },
  {
    number: "04",
    year: "2026",
    description: "Launch of Retail Relocation Business",
    icon: Sparkles,
    image: "/finalimages/company-numbers/hero.JPG",
  },
];

// Percent-based center positions for the 4 milestone circles, matched by an
// SVG overlay (same coordinate space) that draws the connecting arrows.
const POSITIONS = [
  { left: "20%", top: "14%" },
  { left: "82%", top: "38%" },
  { left: "20%", top: "64%" },
  { left: "82%", top: "90%" },
];

export default function WhatWeProvide() {
  const [active, setActive] = useState(0);
  const milestone = MILESTONES[active];

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">What We Provide</p>
        <h2 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-[#0b1e42]">We Transport </span>
          <span className="text-red-600">Your Vehicles Safely </span>
          <span className="text-[#0b1e42]">Across India</span>
        </h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-xl">
              <Image
                key={milestone.image + milestone.number}
                src={milestone.image}
                alt={`CarCoolie in ${milestone.year}: ${milestone.description}`}
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-black/45 p-3 backdrop-blur-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                <milestone.icon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <p key={milestone.year} className="text-sm font-semibold leading-snug text-white">
                <span className="font-extrabold text-red-400">{milestone.year}</span> — {milestone.description}
              </p>
            </div>
          </div>

          <div className="relative h-[440px] w-full sm:h-[520px]">
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <defs>
                <marker
                  id="milestone-arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="4.5"
                  refY="3"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
                </marker>
              </defs>
              {/* Paths stop short of each target circle's center (rather than
                  landing dead-center under it) so the arrowhead marker isn't
                  hidden beneath the opaque milestone button on top. */}
              <path
                d="M 20 14 C 50 14 50 35 68 35"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.1"
                vectorEffect="non-scaling-stroke"
                markerEnd="url(#milestone-arrow)"
              />
              <path
                d="M 82 38 C 50 38 50 61 32 61"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.1"
                vectorEffect="non-scaling-stroke"
                markerEnd="url(#milestone-arrow)"
              />
              <path
                d="M 20 64 C 50 64 50 87 68 87"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.1"
                vectorEffect="non-scaling-stroke"
                markerEnd="url(#milestone-arrow)"
              />
            </svg>

            {MILESTONES.map((item, i) => (
              <button
                key={item.number}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                style={{ left: POSITIONS[i].left, top: POSITIONS[i].top }}
                className={`absolute flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-white transition-all duration-300 ${
                  active === i
                    ? "bg-red-600 shadow-[0_0_25px_6px_rgba(11,30,66,0.6)]"
                    : "bg-[#0b1e42] shadow-lg"
                }`}
              >
                <span className="text-2xl font-extrabold">{item.number}</span>
                <span className="text-xs font-semibold">Milestone</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
