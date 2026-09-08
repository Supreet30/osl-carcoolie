"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Dummy placeholder copy for steps 2-5 — swap for real booking-flow copy
// once available. Step 1 matches the reference mock verbatim.
//
// `images` is an array, not a single path — chosen per step by what's
// actually depicted (not just numeric order): every finalimages/homepage
// steps* photo is used somewhere, including two (steps.JPG, steps6.JPG)
// that numeric-only matching would have left out. A step with two related
// shots (e.g. the inspection clipboard *and* the truck-loading ramp, both
// genuinely "Pickup Order") shows both side by side rather than forcing a
// single photo to cover everything the description promises.
const STEPS = [
  {
    number: "01",
    title: "Order Placement",
    description:
      "Digital booking with customized transport planning based on vehicle specifications.",
    // Wide fleet-yard shot (the scale of the operation behind a booking)
    // paired with the key handover that kicks a booking off.
    images: ["/finalimages/homepage/steps5.JPG", "/finalimages/homepage/steps3.png"],
  },
  {
    number: "02",
    title: "Team Preview",
    description:
      "Review your assigned driver and carrier team details before confirming the booking.",
    // Meeting the assigned driver face to face.
    images: ["/finalimages/homepage/steps4.png"],
  },
  {
    number: "03",
    title: "Confirm Payment",
    description:
      "Secure, transparent payment confirmation with an instant digital booking receipt.",
    // Reviewing the signed CarCoolie paperwork — the closest visual match
    // to a booking receipt among these photos.
    images: ["/finalimages/homepage/steps6.JPG"],
  },
  {
    number: "04",
    title: "Pickup Order",
    description:
      "Scheduled pickup at your location, with photo documentation before departure.",
    // The pre-pickup inspection (the "photo documentation" itself) next to
    // the vehicle actually being loaded for departure.
    images: ["/finalimages/homepage/steps1.JPG", "/finalimages/homepage/steps.JPG"],
  },
  {
    number: "05",
    title: "Tracking & Reviews",
    description:
      "Track your shipment in real time and share your experience once it's delivered.",
    // A real-time tracking dashboard, open on a laptop mid-shipment.
    images: ["/finalimages/homepage/steps2.JPG"],
  },
];

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = 100;
const MARKER_COLOR_PENDING = "#e2e8f0";
const MARKER_COLOR_REACHED = "#dc2626";

const MARKERS = [0.2, 0.4, 0.6, 0.8, 1];
function markerPosition(fraction) {
  const angle = fraction * 2 * Math.PI;
  return {
    cx: Math.round((CENTER + RADIUS * Math.cos(angle)) * 100) / 100,
    cy: Math.round((CENTER + RADIUS * Math.sin(angle)) * 100) / 100,
  };
}

export default function BookingSteps() {
  const sectionRef = useRef(null);
  const arcRef = useRef(null);
  const markerRefs = useRef([]);
  const [activeStep, setActiveStep] = useState(0);

  const step = STEPS[activeStep];
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setMarkerFills = (progress) => {
        MARKERS.forEach((threshold, i) => {
          const reached = progress >= threshold - 0.001;
          gsap.set(markerRefs.current[i], {
            attr: { fill: reached ? MARKER_COLOR_REACHED : MARKER_COLOR_PENDING },
          });
        });
      };

      if (prefersReducedMotion) {
        gsap.set(arcRef.current, { strokeDashoffset: CIRCUMFERENCE * (1 - 1 / STEPS.length) });
        setMarkerFills(1 / STEPS.length);
        return;
      }

      gsap.set(arcRef.current, { strokeDashoffset: CIRCUMFERENCE });
      setMarkerFills(0);

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${STEPS.length * 100}%`,
        pin: true,
        scrub: 0.4,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(arcRef.current, { strokeDashoffset: CIRCUMFERENCE * (1 - self.progress) });
          setMarkerFills(self.progress);
          const next = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
          setActiveStep((prev) => (prev === next ? prev : next));
        },
      });

      return () => trigger.kill();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen flex-col justify-center overflow-hidden bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        <p className="text-md font-semibold text-red-600">Booking Steps</p>
        <h2 className="mt-2 text-6xl font-extrabold tracking-tight text-[#0b1e42]">
          Steps To Book Our <span className="text-red-600">Services.</span>
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Circular progress */}
          <div className="relative mx-auto aspect-square h-72 sm:h-96 md:h-104">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                ref={arcRef}
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke="#dc2626"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE}
              />

              {MARKERS.map((fraction, i) => {
                const { cx, cy } = markerPosition(fraction);
                return (
                  <circle
                    key={fraction}
                    ref={(el) => {
                      if (el) markerRefs.current[i] = el;
                    }}
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill={MARKER_COLOR_PENDING}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center px-9 text-center">
              <p className="text-5xl font-extrabold text-red-600">{step.number}</p>
              <p className="mt-3 text-2xl font-extrabold text-red-600">{step.title}</p>
              <p className="mt-3 text-base leading-relaxed text-slate-500">{step.description}</p>
            </div>
          </div>

          {/* Current step's photo(s) — two side by side when a single shot
              doesn't cover everything the step describes (see STEPS above). */}
          <div className={`grid h-72 gap-2 sm:h-96 md:h-104 ${step.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {step.images.map((src, i) => (
              <div key={src} className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
                <Image
                  src={src}
                  alt={`${step.title} illustration${step.images.length > 1 ? ` ${i + 1}` : ""}`}
                  fill
                  sizes={step.images.length > 1 ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 1024px) 50vw, 100vw"}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
