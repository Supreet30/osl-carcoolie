"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Truck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Dummy placeholder copy/stats for cards 2-4 — swap for real service
// content (pricing, actual coverage/turnaround numbers) before shipping.
// Images reuse the existing testi*.jpg assets as placeholders (testi1
// repeats for card 4) — swap each for the real per-service photo once
// available.
const CARDS = [
  {
    id: "full-truck-load",
    label: "FULL TRUCK LOAD",
    heading: (
      <>
        Dedicated Carrier. <span className="text-red-600">Maximum</span> Protection.
      </>
    ),
    description:
      "Experience premium vehicle transportation with our Full Truck Load (FTL) service. Your vehicle travels in a dedicated carrier without sharing space with any other shipment, ensuring absolute security and priority scheduling.",
    badges: [
      { value: "100%", label: "DEDICATED TRUCK" },
      { value: "ZERO", label: "VEHICLE TRANSFERS" },
      { value: "PAN INDIA", label: "DOORSTEP DELIVERY" },
    ],
    cta: "Explore Full Truck Load",
    image: "/testi1.jpg",
  },
  {
    id: "part-load",
    label: "PART LOAD (PTL)",
    heading: (
      <>
        Shared Carrier. <span className="text-red-600">Smart</span> Savings.
      </>
    ),
    description:
      "Moving fewer vehicles? Our Part Truck Load service shares carrier space across multiple shipments on the same route, cutting your cost without cutting corners on care or tracking.",
    badges: [
      { value: "30%", label: "LOWER COST" },
      { value: "FLEXIBLE", label: "PICKUP SLOTS" },
      { value: "MULTI-CITY", label: "ROUTE COVERAGE" },
    ],
    cta: "Explore Part Load",
    image: "/testi2.jpg",
  },
  {
    id: "express",
    label: "EXPRESS DELIVERY",
    heading: (
      <>
        Priority Transit. <span className="text-red-600">Fastest</span> Routes.
      </>
    ),
    description:
      "When timing matters, our Express service prioritizes your vehicle on the fastest available route with dedicated handling, so it reaches its destination as quickly as safely possible.",
    badges: [
      { value: "48HR", label: "AVG. DELIVERY" },
      { value: "PRIORITY", label: "ROUTE HANDLING" },
      { value: "LIVE", label: "STATUS UPDATES" },
    ],
    cta: "Explore Express Delivery",
    image: "/testi3.jpg",
  },
  {
    id: "two-wheeler",
    label: "TWO-WHEELER TRANSPORT",
    heading: (
      <>
        Fully Crated. <span className="text-red-600">Doorstep</span> Ready.
      </>
    ),
    description:
      "Bikes and scooters travel individually crated and secured, protected from dust, weather, and transit damage, then delivered right to your door — no showroom pickup required.",
    badges: [
      { value: "CRATED", label: "INDIVIDUAL PACKING" },
      { value: "ZERO", label: "SCRATCH GUARANTEE" },
      { value: "PAN INDIA", label: "DOORSTEP DELIVERY" },
    ],
    cta: "Explore Bike Transport",
    image: "/testi1.jpg",
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ServiceCard({ card }) {
  return (
    <div className="relative max-h-full w-full max-w-5xl overflow-hidden rounded-4xl bg-white p-5 shadow-2xl ring-1 ring-slate-100 sm:p-7 md:p-9">
      <div className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 shadow-lg sm:top-7 sm:right-7">
        <Truck className="h-4 w-4 text-white" />
      </div>

      <div className="grid gap-5 md:grid-cols-[2fr_3fr] md:items-center md:gap-8">
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-900 sm:h-64 md:h-80">
          <Image src={card.image} alt="" fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold tracking-wide text-red-600">{card.label}</p>
          <h3 className="mt-1.5 text-2xl font-extrabold leading-tight text-[#0b1e42] sm:text-3xl">
            {card.heading}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
            {card.description}
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {card.badges.map((badge) => (
              <div key={badge.label} className="rounded-xl bg-red-50 px-2.5 py-2.5">
                <p className="text-sm font-extrabold text-red-600 sm:text-base">{badge.value}</p>
                <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-500">
                  {badge.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              {card.cta}
              <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OurServices() {
  const sectionRef = useRef(null);
  // CARDS is a fixed-length module constant, so index-based assignment
  // below is stable across re-renders without needing to reset this array.
  const cardRefs = useRef([]);

  // Pins the section on entry (mandatory viewport-height section, so the
  // pinned view never bleeds past what's visible). Card 1 sits in place
  // with no entrance transition. Scrolling rises the next card up from
  // below to take the front spot — and simultaneously, every card that has
  // already had its turn (including the one just replaced) recedes one
  // more small step upward, staying visible as a peeking stack above the
  // new front card instead of disappearing. Because each card that's later
  // in the DOM is also later to reach the front, default DOM stacking
  // already puts the current front card above the receded ones — no
  // explicit z-index bookkeeping needed here (unlike a "peek from below"
  // layout would need). Falls back to a static "card 1 only" view for
  // prefers-reduced-motion.
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = cardRefs.current;

      if (cards.length < 2) return;

      if (prefersReducedMotion) {
        gsap.set(cards.slice(1), { autoAlpha: 0 });
        return;
      }

      gsap.set(cards.slice(1), { yPercent: 100 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${(cards.length - 1) * 100}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      const RECEDE_Y = -12;

      cards.slice(1).forEach((el, i) => {
        const alreadyFronted = cards.slice(0, i + 1);

        tl.to(el, { yPercent: 0, ease: "none" }).to(
          alreadyFronted,
          { y: `+=${RECEDE_Y}`, scale: "-=0.03", opacity: "-=0.12", ease: "none" },
          "<"
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative flex h-screen flex-col overflow-hidden bg-white px-6 pt-10 pb-8 sm:pt-14"
    >
      <div className="mx-auto w-full max-w-6xl shrink-0">
        <p className="text-md font-semibold text-red-600">Our Services</p>
        <h2 className="mt-3 text-5xl font-extrabold leading-tight text-[#0b1e42]">
          We Transport <span className="text-red-600">Your Vehicles Safely</span>
          <br />
          Across India
        </h2>
      </div>

      <div className="relative mx-auto mt-8 min-h-0 w-full max-w-6xl flex-1">
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            ref={(el) => {
              if (el) cardRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ServiceCard card={card} />
          </div>
        ))}
      </div>
    </section>
  );
}
