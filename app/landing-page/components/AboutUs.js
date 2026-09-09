"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const POINTS = [
  {
    id: "transparency",
    heading: (
      <>
        Transparency <span className="text-red-600">&amp; Assurance</span>
      </>
    ),
    bullets: [
      "Transparent written quotation before booking",
      "No hidden charges or last-minute surprises",
      "Timely delivery with complete transparency at every step",
      "No subcontracting to tier 2 vendors — OSL manages the entire process directly",
    ],
    stats: [
      { value: "TRANSPARENT", label: "PRICING" },
      { value: "ZERO", label: "HIDDEN CHARGES" },
    ],
    image: "/finalimages/homepage/aboutus1.JPG",
  },
  {
    id: "handling",
    heading: (
      <>
        Professional Handling <span className="text-red-600">&amp; Security</span>
      </>
    ),
    bullets: [
      "Professional vehicle inspection before pickup",
      "Photos and videos of your vehicle at the time of pickup",
      "Safe and secure loading and unloading by trained professionals",
      "Your vehicle is never used for unauthorized driving or to carry someone else's luggage",
    ],
    stats: [
      { value: "PRE-PICKUP", label: "INSPECTIONS" },
      { value: "PHOTO-DOCUMENTED", label: "PICKUPS" },
    ],
    image: "/finalimages/homepage/aboutus2.JPG",
  },
  {
    id: "journey",
    heading: (
      <>
        Connected Journey <span className="text-red-600">&amp; Support</span>
      </>
    ),
    bullets: [
      "Real-time tracking and regular transit updates",
      "Dedicated customer support throughout the journey",
      "Door to door delivery as committed",
    ],
    stats: [
      { value: "750+", label: "TRUCKS ON ROAD" },
      { value: "DELIVERY", label: "DOOR TO DOOR" },
    ],
    image: "/finalimages/homepage/aboutus3.JPG",
  },
  {
    id: "reliability",
    heading: (
      <>
        Reliability <span className="text-red-600">&amp; Confidence</span>
      </>
    ),
    bullets: [
      "Timely delivery assurance",
      "Complete confidence from pickup to delivery, ensuring peace of mind",
    ],
    stats: [
      { value: "<0.01%", label: "DAMAGE RATIO" },
      { value: "100%", label: "CUSTOMER SATISFACTION" },
    ],
    image: "/finalimages/homepage/aboutus4.JPG",
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
          Why Customers Choose <span className="text-red-600">Car Coolie</span> for Vehicle
          Transport
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

                <ul className="mt-5 flex flex-col gap-3">
                  {point.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                  {point.stats.map((stat) => (
                    <div key={stat.label} className="py-3">
                      <p className="text-2xl font-extrabold text-red-600 sm:text-3xl">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium tracking-wide text-slate-500">{stat.label}</p>
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
