"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, MapPin, Quote, ShieldCheck } from "lucide-react";

// Dummy placeholder milestones — swap in the real 4-step story and unique
// photography once it's defined. Reusing the two existing truck photos
// (servicehero.png, contact-hero-truck.png) across all 4 for now, same
// approach used for the services showcase cards.
const MILESTONES = [
  {
    number: "01",
    image: "/servicehero.png",
    quote: '"Moving more than just metal; we move dreams."',
  },
  {
    number: "02",
    image: "/contact-hero-truck.png",
    quote: '"Every delivery is a promise kept, on time, every time."',
  },
  {
    number: "03",
    image: "/servicehero.png",
    quote: '"From city roads to mountain passes, we go the distance."',
  },
  {
    number: "04",
    image: "/contact-hero-truck.png",
    quote: '"Trusted by thousands of families, driven by care."',
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

const BADGE_ICONS = [ShieldCheck, MapPin, Lock];

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
                alt="CarCoolie carrier truck transporting vehicles"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            </div>

            <div className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
              {BADGE_ICONS.map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
              ))}
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-black/45 p-3 backdrop-blur-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                <Quote className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <p key={milestone.quote} className="text-sm font-semibold leading-snug text-white">
                {milestone.quote}
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
