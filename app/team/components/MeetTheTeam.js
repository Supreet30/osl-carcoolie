"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";

// Dummy placeholder roster — swap in real bios once they exist. Ordered so
// the intended default center (index 2) is the CEO, matching the reference.
const MEMBERS = [
  { name: "Kuldeep Singh", role: "Assistant Manager", image: "/team/1.jpg" },
  { name: "Shruti Singh", role: "Logistics Head", image: "/team/2.jpg" },
  { name: "Rahul Bansal", role: "Founder & CEO", image: "/team/3.jpg" },
  { name: "Shaily Rana", role: "Senior Manager", image: "/team/4.jpg" },
  { name: "Rohit Sharma", role: "Head Of Operations", image: "/team/5.jpg" },
];

const CENTER_SLOT = 2;

function SocialButton({ children }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-red-300 text-[10px] font-bold text-red-600">
      {children}
    </span>
  );
}

// The card's white background is built from exactly two stacked divs — a
// semicircle "dome" (rounded-t-full) and a rounded rectangle "body"
// (rounded-b-3xl) — joined with no gap so together they read as one
// continuous badge/shield shape. The photo isn't nested inside the dome;
// it's a large circle centered on the shape's own top edge, so half of it
// pokes out above the card and half overlaps down into the dome.
function MemberBadge({ member, isCenter }) {
  const cardWidth = isCenter ? "w-44 sm:w-52" : "w-36 sm:w-40";
  const domeHeight = isCenter ? "h-20 sm:h-24" : "h-12 sm:h-14";
  const photoSize = isCenter ? "h-36 w-36 sm:h-40 sm:w-40" : "h-22 w-22 sm:h-26 sm:w-26";

  return (
    <div className={`relative flex flex-col items-center shadow-xl ${cardWidth}`}>
      <div
        className={`absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-lg ring-2 ring-white ${photoSize}`}
      >
        <Image src={member.image} alt={member.name} fill sizes="160px" className="object-cover" />
      </div>

      <div className={`w-full rounded-t-full bg-white ${domeHeight}`} />

      <div
        className={`flex w-full flex-col items-center rounded-b-3xl bg-white px-3 pt-3 ${
          isCenter ? "pb-10" : "pb-5"
        }`}
      >
        <p
          className={`text-center font-medium text-[#0b1e42] ${isCenter ? "text-3xl" : "text-lg"}`}
        >
          {member.name}
        </p>
        <p className={`mt-1 text-center font-bold tracking-wide text-red-500 uppercase ${isCenter ? "text-xl" : "text-sm"}`}>
          {member.role}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <SocialButton>in</SocialButton>
          <SocialButton>
            <Mail className="h-3 w-3" strokeWidth={2} />
          </SocialButton>
        </div>
      </div>
    </div>
  );
}

export default function MeetTheTeam() {
  const [offset, setOffset] = useState(0);
  // +1 = last pressed "next" (cards should enter from the right), -1 = "prev"
  // (cards enter from the left) — read by the teamSlide animation below.
  const [direction, setDirection] = useState(1);

  // Rotating the roster (instead of moving a "selected index" pointer)
  // keeps the 5 display slots fixed while the person shown in each — and
  // which one lands in the center, elevated slot — changes on every click.
  const visible = MEMBERS.map((_, i) => MEMBERS[(i + offset) % MEMBERS.length]);

  function goPrev() {
    setDirection(-1);
    setOffset((o) => (o - 1 + MEMBERS.length) % MEMBERS.length);
  }

  function goNext() {
    setDirection(1);
    setOffset((o) => (o + 1) % MEMBERS.length);
  }

  return (
    <section className="bg-[#0B1E42] px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-white/20" />
          <h2 className="shrink-0 text-4xl font-extrabold text-white">Meet The Team</h2>
          <span className="h-px w-10 bg-white/20" />
        </div>

        <div className="mt-30 mb-10 flex items-end justify-center gap-4 sm:gap-6">
          {visible.map((member, slot) => (
            <div
              key={`${member.name}-${slot}-${offset}`}
              className={slot !== CENTER_SLOT ? "hidden sm:block" : undefined}
              style={{
                animation: "teamSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                "--team-slide-from": `${direction * 28}px`,
                willChange: "transform",
              }}
            >
              <MemberBadge member={member} isCenter={slot === CENTER_SLOT} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous team member"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next team member"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
