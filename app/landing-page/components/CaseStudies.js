"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Play, ArrowRight } from "lucide-react";

// Dummy placeholder captions/links for slides 2-3 — swap for real
// case-study copy/links once available.
const CASE_STUDIES = [
  {
    id: "fleet-consolidation",
    image: "/testi1.jpg",
    alt: "Car Coolie carrier truck on the highway at sunset",
    lines: [
      "From 12 Fragmented Vendors",
      [
        { text: "To " },
        { text: "One Platform", accent: true },
        { text: " $2M Saved " },
        { text: "Annually", accent: true },
      ],
    ],
    cta: "Watch the story",
    href: "#contact",
  },
  {
    id: "night-fleet",
    image: "/testi2.jpg",
    alt: "Car Coolie carrier truck on a rainy night highway",
    lines: [
      "From Delayed Deliveries",
      [
        { text: "To " },
        { text: "24/7 Tracking", accent: true },
        { text: ", 99% " },
        { text: "On-Time Rate", accent: true },
      ],
    ],
    cta: "Watch the story",
    href: "#contact",
  },
  {
    id: "convoy-scale",
    image: "/testi3.jpg",
    alt: "Car Coolie carrier convoy on the highway at sunset",
    lines: [
      "From Single-Truck Runs",
      [
        { text: "To " },
        { text: "Convoy Scale", accent: true },
        { text: ", 3x " },
        { text: "Faster Rollout", accent: true },
      ],
    ],
    cta: "Watch the story",
    href: "#contact",
  },
];

// Position/size per carousel slot (drives the `layout` FLIP animation
// below). Opacity is intentionally left out — it's animated separately via
// `animate` so it can have its own transition instead of following layout's
// spring.
// Left/right positions are computed from the center card's fixed half-width
// (320px, i.e. sm:w-160/2) plus a deliberate 20px gap, rather than a
// translate offset — that guarantees an exact, consistent gap instead of
// whatever gap happens to fall out of independently-anchored offsets.
const SLOT_CLASSES = {
  center: "left-1/2 top-0 z-20 aspect-video w-full max-w-2xl -translate-x-1/2 sm:w-160 md:h-104",
  left: "top-6 z-10 aspect-video w-full max-w-xl left-[calc(50%-724px)] sm:w-96 md:h-88",
  right: "top-6 z-10 aspect-video w-full max-w-xl left-[calc(50%+340px)] sm:w-96 md:h-88",
};

const LAYOUT_TRANSITION = {
  // A tween with easeInOut keeps the size change (shrinking down to a side
  // slot) gradual and even throughout — a spring's fast initial velocity
  // made that shrink read as an abrupt snap before settling.
  layout: { type: "tween", duration: 0.7, ease: "easeInOut" },
  opacity: { duration: 0.6 },
};

function getSlot(itemIndex, activeIndex, length) {
  const offset = (itemIndex - activeIndex + length) % length;
  if (offset === 0) return "center";
  if (offset === 1) return "right";
  return "left";
}

export default function CaseStudies() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CASE_STUDIES[activeIndex];

  return (
    <section className="relative overflow-hidden bg-white py-20">
      {/* Decorative dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[20px_20px]"
      />

      <div className="mx-auto max-w-7xl px-6">
        <p className="text-sm font-semibold text-red-600">Case Studies</p>
        <h2 className="mt-3 text-6xl font-extrabold tracking-tight text-[#0b1e42]">
          Watch Our Vehicle Logistics <span className="text-red-600">Success Stories</span>
        </h2>

        {/*
          Placeholder imagery throughout: swap each image for the real
          case-study photo/video once available. The center card's play
          button is decorative until there's an actual video to open.
        */}
        <div className="relative mt-6 hidden overflow-hidden sm:block sm:h-90 md:h-104">
          {CASE_STUDIES.map((item, i) => {
            const slot = getSlot(i, activeIndex, CASE_STUDIES.length);
            const isCenter = slot === "center";

            return (
              <motion.button
                key={item.id}
                layout
                transition={LAYOUT_TRANSITION}
                animate={{ opacity: isCenter ? 1 : 0.8 }}
                type="button"
                onClick={() => setActiveIndex(i)}
                disabled={isCenter}
                aria-label={isCenter ? undefined : `Show "${item.id.replace(/-/g, " ")}" case study`}
                aria-current={isCenter}
                className={`group absolute overflow-hidden rounded-2xl bg-slate-900 shadow-xl ${
                  SLOT_CLASSES[slot]
                } ${isCenter ? "cursor-default" : "cursor-pointer"}`}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes={isCenter ? "(min-width: 640px) 640px, 100vw" : "384px"}
                  className="object-cover"
                />
                {isCenter && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-200 group-hover:scale-105">
                      <Play className="ml-1 h-6 w-6 fill-red-600 text-red-600" />
                    </span>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Mobile: side peeks are hidden, so just show the active card. */}
        <div className="relative mt-14 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 sm:hidden">
          <Image src={active.image} alt={active.alt} fill sizes="100vw" className="object-cover" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl">
              <Play className="ml-1 h-5 w-5 fill-red-600 text-red-600" />
            </span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            aria-live="polite"
            className="mx-auto mt-8 flex w-fit items-center gap-10"
          >
            <div className="text-xl font-extrabold leading-snug text-[#0b1e42] sm:text-2xl">
              <p>{active.lines[0]}</p>
              <p>
                {active.lines[1].map((part, i) => (
                  <span key={i} className={part.accent ? "text-red-600" : undefined}>
                    {part.text}
                  </span>
                ))}
              </p>
            </div>

            <Link
              href={active.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              {active.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
