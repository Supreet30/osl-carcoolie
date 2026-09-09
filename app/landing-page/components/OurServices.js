"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Truck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Badges are short, non-numeric restatements of the actual description copy
// (no invented stats), unlike the dummy 100%/ZERO/etc. badges this replaced.
const CARDS = [
  {
    id: "door-to-door",
    label: "DOOR TO DOOR MOBILITY",
    heading: (
      <>
        Vehicle Pickup & Delivery, <span className="text-red-600">Right to Your Door</span>
      </>
    ),
    description:
      "Book a part truck load, with pickup and delivery handled at your exact doorstep. Ideal for single vehicles and tighter city routes, without paying for a full truck.",
    badges: [
      { value: "DOOR TO DOOR", label: "PICKUP & DELIVERY" },
      { value: "SINGLE VEHICLE", label: "RIGHT-SIZED LOADS" },
      { value: "NO FULL TRUCK", label: "COST REQUIRED" },
    ],
    cta: "Explore Door to Door",
    image: "/finalimages/homepage/services1.png",
  },
  {
    id: "full-truck-load",
    label: "FULL TRUCK LOAD",
    heading: (
      <>
        Dedicated Carrier, <span className="text-red-600">Maximum Protection</span>
      </>
    ),
    description:
      "Book a dedicated full truck load carrier for premium, priority vehicle transportation. Your vehicles travel without shared stops or transfers, with pan-India doorstep delivery.",
    badges: [
      { value: "DEDICATED", label: "CARRIER" },
      { value: "NO SHARED", label: "STOPS OR TRANSFERS" },
      { value: "PAN INDIA", label: "DOORSTEP DELIVERY" },
    ],
    cta: "Explore Full Truck Load",
    image: "/finalimages/homepage/ourservices2.JPG",
  },
  {
    id: "stockyard",
    label: "STOCKYARD MANAGEMENT",
    heading: (
      <>
        Secure Vehicle <span className="text-red-600">Storage</span> Between Moves
      </>
    ),
    description:
      "Store vehicles safely in our managed stockyards during transit or before dispatch, with the same tracking and security standards that cover every Car Coolie shipment. Making final delivery to customer, on demand.",
    badges: [
      { value: "SECURE", label: "MANAGED STORAGE" },
      { value: "FULL", label: "TRACKING & SECURITY" },
      { value: "ON DEMAND", label: "FINAL DELIVERY" },
    ],
    cta: "Explore Stockyard Management",
    image: "/finalimages/homepage/ourservices3.JPG",
  },
  {
    id: "warehouse",
    label: "WAREHOUSE MANAGEMENT",
    heading: (
      <>
        Managing Parts <span className="text-red-600">Warehouses</span> for OEMs
      </>
    ),
    description:
      "Managing dedicated parts warehouses for OEMs, ensuring streamlined inventory control, secure handling, and timely distribution to support uninterrupted supply chains.",
    badges: [
      { value: "OEM", label: "DEDICATED WAREHOUSES" },
      { value: "STREAMLINED", label: "INVENTORY CONTROL" },
      { value: "TIMELY", label: "DISTRIBUTION" },
    ],
    cta: "Explore Warehouse Management",
    image: "/finalimages/homepage/ourservices4.JPG",
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
          Choose the <span className="text-red-600">Right Service</span>
          <br />
          That Best Fits Your Needs
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
