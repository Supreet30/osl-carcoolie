"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Dummy placeholder copy/stats for points 2-4 — swap for real content
// (pricing/tracking/coverage copy, actual numbers) before shipping. Images
// reuse the existing testi*.jpg assets as placeholders (testi1 repeats for
// point 4) — swap each for the real per-point photo once available.
const POINTS = [
  {
    id: "loading",
    heading: (
      <>
        Secure <span className="text-red-600">Vehicle Loading</span>
      </>
    ),
    description:
      "Our expert team ensures every vehicle is loaded with precision using advanced equipment and strict safety procedures. From careful positioning to secure fastening, we protect your vehicle throughout transit, minimizing risks and ensuring a safe, damage-free journey across India with complete reliability and professional care.",
    stats: [
      { value: "12k+", label: "DELIVERIES ANNUALLY" },
      { value: "99.9%", label: "SAFETY RECORD" },
    ],
    image: "/testi1.jpg",
  },
  {
    id: "tracking",
    heading: (
      <>
        Real-Time <span className="text-red-600">Vehicle Tracking</span>
      </>
    ),
    description:
      "Track your shipment live from pickup to delivery with GPS-enabled monitoring. Get instant status updates and accurate arrival estimates, so you always know exactly where your vehicle is on its journey across India.",
    stats: [
      { value: "24/7", label: "LIVE GPS MONITORING" },
      { value: "100%", label: "ROUTE VISIBILITY" },
    ],
    image: "/testi2.jpg",
  },
  {
    id: "network",
    heading: (
      <>
        <span className="text-red-600">Nationwide</span> Coverage Network
      </>
    ),
    description:
      "Our carrier network spans every major city and hundreds of smaller towns across India. Wherever your vehicle needs to go, our extensive hub network keeps transit times short and deliveries reliable.",
    stats: [
      { value: "500+", label: "CITIES COVERED" },
      { value: "50+", label: "REGIONAL HUBS" },
    ],
    image: "/testi3.jpg",
  },
  {
    id: "insurance",
    heading: (
      <>
        Fully <span className="text-red-600">Insured</span> Transit
      </>
    ),
    description:
      "Every vehicle we transport is covered by comprehensive transit insurance from the moment it's loaded until it reaches your doorstep, giving you complete peace of mind on every shipment.",
    stats: [
      { value: "100%", label: "INSURED SHIPMENTS" },
      { value: "0", label: "CLAIM DISPUTES" },
    ],
    image: "/testi1.jpg",
  },
];

function PointImage({ src }) {
  return (
    <div className="relative h-full max-h-72 w-full overflow-hidden rounded-2xl bg-slate-900 sm:max-h-80 md:max-h-full">
      <Image src={src} alt="" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
    </div>
  );
}

export default function AboutUs() {
  const sectionRef = useRef(null);
  // POINTS is a fixed-length module constant, so index-based assignment
  // below is stable across re-renders without needing to reset this array.
  const pointRefs = useRef([]);

  // Pins the section on entry (mandatory viewport-height section, so the
  // pinned view never bleeds past what's visible). The eyebrow/heading stay
  // static throughout — only the image+content pair area animates. Point 1
  // sits in place with no entrance transition. Scrolling further slides the
  // current pair out to the left while the next pair arrives from the
  // right, simultaneously. Falls back to a static "point 1 only" view for
  // prefers-reduced-motion.
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const points = pointRefs.current;

      if (points.length < 2) return;

      if (prefersReducedMotion) {
        gsap.set(points.slice(1), { autoAlpha: 0 });
        return;
      }

      // The outgoing card's enlarge stays scaleX-only — the stage's height
      // is a hard, tightly budgeted h-screen with no slack, so growing
      // past 1 vertically would clip against it. Shrinking below 1 (the
      // incoming card's "smaller before focus" state) never overflows
      // regardless of axis, so that one is safe to do on scaleY.
      gsap.set(points[0], { scaleX: 1, scaleY: 1 });
      gsap.set(points.slice(1), { xPercent: 100, scaleY: 0.5 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${(points.length - 1) * 100}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      points.slice(1).forEach((el, i) => {
        const outgoing = points[i];
        // Outgoing point enlarges as it exits; the incoming one starts
        // smaller than normal and grows to full size as it takes focus.
        tl.to(outgoing, { xPercent: -100, scaleX: 1.04, ease: "none" }).to(
          el,
          { xPercent: 0, scaleY: 1, ease: "none" },
          "<"
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex h-screen flex-col overflow-hidden bg-white px-6 pt-10 pb-8 sm:pt-14"
    >
      {/* Decorative dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 mask-[linear-gradient(to_bottom,black,transparent)] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[18px_18px]"
      />

      <div className="mx-auto w-full max-w-7xl shrink-0">
        <p className="text-md font-semibold text-red-600">About Us</p>
        <h2 className="mt-3 text-5xl font-extrabold leading-tight text-[#0b1e42]">
          We Transport <span className="text-red-600">Your Vehicles Safely</span>
          <br />
          Across India
        </h2>
      </div>

      {/*
        Each point's outer wrapper spans the full section width — not just
        the max-w-7xl content width — so it fills the viewport edge to edge
        throughout the slide, with no empty margin visible on either side
        mid-transition. The content itself stays contained/centered via the
        inner max-w-7xl wrapper.
      */}
      <div className="relative mt-8 min-h-0 w-full flex-1 overflow-hidden">
        {POINTS.map((point, i) => (
          <div
            key={point.id}
            ref={(el) => {
              if (el) pointRefs.current[i] = el;
            }}
            className="absolute inset-0"
          >
            <div className="mx-auto grid h-full max-w-7xl gap-6 px-6 md:grid-cols-2 md:items-center md:gap-12">
              <PointImage src={point.image} />

              <div>
                <h3 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">{point.heading}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                  {point.description}
                </p>

                <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                  {point.stats.map((stat) => (
                    <div key={stat.label} className="py-3">
                      <p className="text-2xl font-extrabold text-red-600 sm:text-3xl">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium tracking-wide text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
