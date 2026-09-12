"use client";

import Image from "next/image";
import { motion } from "motion/react";

const timelineData = [
  {
    title: "Om Prakash Goyal",
    names: ["Santosh Kr. Goyal", "Nirmal Kr. Goyal", "Sanjay Kr. Goyal"],
    side: "start",
  },
  {
    title: "Sohan Lal Goyal",
    names: ["Bijay Goyal", "Shiv Goyal"],
    side: "end",
  },
  {
    title: "Liladhar Goyal",
    names: ["Manoj Kr. Goyal", "Pawan Kr. Goyal"],
    side: "start",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

function TimelineIcon() {
  return (
    <motion.div
      whileHover={{ scale: 1.15 }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    </motion.div>
  );
}

// Card for one branch of the family in the timeline below — `align` puts the
// text flush against the center line it sits next to (mirrors the two sides
// of the timeline) rather than always reading the same direction.
function BranchCard({ person, align }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="inline-block">
      <div className={`max-w-md rounded-2xl border border-red-100 bg-white px-5 py-5 shadow-md shadow-red-100/60 sm:px-7 ${align === "end" ? "text-end" : "text-start"}`}>
        <h2 className="text-lg font-black text-red-600 md:text-2xl">{person.title}</h2>
        <div className="mt-3 space-y-1 text-sm font-semibold text-gray-700 md:text-base">
          {person.names.map((name) => (
            <p key={name} className="transition-colors duration-200 hover:text-red-500">
              {name}
            </p>
          ))}
        </div>
        <div className={`mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-red-500 to-transparent ${align === "end" ? "ml-auto" : ""}`} />
      </div>
    </motion.div>
  );
}

// Family tree isn't drawn with daisyUI's timeline component (not a
// dependency of this project) — same hand-rolled center-line-plus-branches
// approach LeadershipSection.js already uses for its org chart, just laid
// out vertically instead of horizontally. A `li.contents` per row lets each
// row's two side columns + center icon participate directly in the parent
// grid, the same trick daisyUI's own timeline relies on internally.
function FamilyTimeline() {
  return (
    <ul className="relative grid grid-cols-[1fr_auto_1fr] gap-y-10">
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-red-200" />

      {timelineData.map((person) => {
        const isStart = person.side === "start";
        return (
          <li key={person.title} className="contents">
            <div className={isStart ? "flex justify-end pr-6 sm:pr-10" : ""}>
              {isStart && <BranchCard person={person} align="end" />}
            </div>
            <div className="flex items-center">
              <TimelineIcon />
            </div>
            <div className={!isStart ? "flex justify-start pl-6 sm:pl-10" : ""}>
              {!isStart && <BranchCard person={person} align="start" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function OslGroupTimeline() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Same dot-grid backdrop as every other section on this page
          (WhatWeProvide, CoreValues, LeadershipSection) instead of a
          one-off cream/pink gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-screen-2xl px-8 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* Heading centered above both columns, with an eyebrow label above
            it, instead of stacked left-aligned-by-column next to the photo. */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold tracking-wide text-red-500 uppercase">Our Ownership</p>
          <h3 className="mt-2 font-outfit text-2xl font-bold uppercase text-gray-800 md:text-3xl lg:text-4xl">
            <span className="text-red-500">OSL group</span> is managed by
          </h3>
        </motion.div>

        <div className="mt-14 flex flex-col items-center gap-10 lg:flex-row lg:gap-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-red-100 shadow-xl shadow-red-200/40 lg:w-1/2"
          >
            <Image
              src="/leadership.png"
              alt="Leadership"
              height={1080}
              width={1920}
              className="h-auto w-full object-cover"
              priority
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={container}
            className="lg:w-1/2"
          >
            <FamilyTimeline />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
