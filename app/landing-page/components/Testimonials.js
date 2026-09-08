"use client";

import { useState } from "react";
import { motion } from "motion/react";

// Dummy placeholder testimonials — swap for real customer quotes/photos
// before shipping. Kept to 3 entries (rather than the mock's 2) so the
// carousel's prev/next preview cards don't show the same duplicated card
// on both sides.
const TESTIMONIALS = [
  {
    quote:
      "I was nervous about shipping my vintage Mustang from Delhi to Bangalore. Car Coolie's enclosed carrier and real-time tracking gave me complete peace of mind.",
    name: "Animesh Roy",
    role: "Private Collector",
  },
  {
    quote:
      "The level of professionalism Car Coolie brings to the table is unmatched in India. They've handled our entire showroom inventory for 3 years without a single scratch.",
    name: "Rajesh Khanna",
    role: "GM, Sterling Motors (Mercedes-Benz)",
  },
  {
    quote:
      "Our fleet relocations used to take weeks of coordination. With Car Coolie we get one dashboard, live updates, and drivers who actually show up on time.",
    name: "Priya Menon",
    role: "Operations Head, Metro Auto Traders",
  },
  {
    quote:
      "Our fleet relocations used to take weeks of coordination. With Car Coolie we get one dashboard, live updates, and drivers who actually show up on time.",
    name: "Priya Menon",
    role: "Operations Head, Metro Auto Traders",
  },
];

// Exactly 3 slots are ever visible (prev/active/next) regardless of how
// many testimonials exist — anything outside that window is "hidden".
// Each card keeps a stable identity (key) and moves between slots
// (including in/out of "hidden") as activeIndex changes, which is what
// gives Motion's `layout` prop something real to interpolate, rather than
// popping in/out of the DOM with no transition.
function getSlot(itemIndex, activeIndex, length) {
  if (itemIndex === activeIndex) return "active";
  if (itemIndex === (activeIndex + 1) % length) return "next";
  if (itemIndex === (activeIndex - 1 + length) % length) return "prev";
  return "hidden";
}

// Explicit positions (not CSS grid auto-placement — mixing grid
// auto-placement with an absolutely-positioned "hidden" item sharing a
// column caused it to misplace siblings into a second row) for the 3
// visible slots. Each card is (100% - 2 gaps) / 3 wide, laid out left to
// right; "hidden" sits wherever "active" is since it's invisible anyway.
const SLOT_POSITION = {
  prev: "sm:left-0",
  active: "sm:left-[calc(33.333%+8px)]",
  next: "sm:left-[calc(66.666%+16px)]",
};

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
      {initials}
    </div>
  );
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(1 % TESTIMONIALS.length);

  return (
    <section className="relative overflow-hidden bg-[#F7F8FA] pt-55 pb-12">
      {/* Giant faded watermark, sits behind the heading */}
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 select-none pl-6 text-left text-[6rem] leading-none font-black tracking-tight whitespace-nowrap text-slate-200 sm:text-[9rem] md:text-[12rem]"
      >
        FEEDBACKs
      </p>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-6xl font-extrabold tracking-tight text-[#0b1e42] uppercase">
            Testi<span className="text-red-600">monials</span>
          </h2>
          <p className="mt-3 text-3xl font-bold text-[#0b1e42]">
            Trusted by <span className="text-red-600">Dealers, Manufacturers And Vehicle Owners</span>
          </p>
        </div>

        <div className="relative mt-14 h-64">
          {TESTIMONIALS.map((testimonial, i) => {
            const slot = getSlot(i, activeIndex, TESTIMONIALS.length);
            const isActive = slot === "active";
            const isHidden = slot === "hidden";
            // Hidden cards sit wherever "active" is positioned — harmless
            // since they're invisible — so they still have a real box for
            // Motion to animate from once they rotate into view.
            const position = isHidden ? SLOT_POSITION.active : SLOT_POSITION[slot];

            return (
              <motion.button
                key={i}
                layout
                type="button"
                onClick={() => !isHidden && setActiveIndex(i)}
                aria-current={isActive}
                aria-hidden={isHidden}
                tabIndex={isHidden ? -1 : 0}
                animate={{
                  scale: isActive ? 1 : isHidden ? 0.85 : 0.95,
                  opacity: isHidden ? 0 : isActive ? 1 : 0.6,
                }}
                transition={{
                  layout: { duration: 0.4, ease: isActive ? "easeIn" : "easeOut" },
                  default: { duration: 0.4, ease: isActive ? "easeIn" : "easeOut" },
                }}
                className={`absolute inset-0 flex flex-col rounded-2xl bg-white p-6 text-left sm:inset-y-0 sm:right-auto sm:w-[calc(33.333%-16px)] ${position} ${
                  isActive ? "z-10 shadow-xl" : "shadow-sm hover:opacity-90"
                } ${isHidden ? "pointer-events-none" : ""}`}
              >
                <p className="text-3xl font-extrabold text-red-600">99</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={testimonial.name} />
                  <div>
                    <p className="text-sm font-bold text-[#0b1e42]">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {TESTIMONIALS.map((testimonial, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show testimonial from ${testimonial.name}`}
              aria-current={i === activeIndex}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                i === activeIndex ? "bg-red-600" : "bg-slate-800/70 hover:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
