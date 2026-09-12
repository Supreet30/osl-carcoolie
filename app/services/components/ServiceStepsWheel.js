"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CalendarClock,
  PackageCheck,
  ShieldCheck,
  Truck,
  Upload,
  UserPlus,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Register",
    description: "Create your secure Car Coolie account today.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Upload Documents",
    description: "Add your vehicle and ID documents securely.",
    icon: Upload,
  },
  {
    number: "03",
    title: "Verify Details",
    description: "Our team verifies your booking within minutes.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Schedule Pickup",
    description: "Pick a convenient date and pickup location.",
    icon: CalendarClock,
  },
  {
    number: "05",
    title: "Track Shipment",
    description: "Follow GPS updates while it's on the road.",
    icon: Truck,
  },
  {
    number: "06",
    title: "Delivery Confirmation",
    description: "Get notified the moment your vehicle arrives safely.",
    icon: PackageCheck,
  },
];

const STEP_ANGLE = 360 / STEPS.length;
// How long a step sits at the top before the ring swings to the next one,
// and how long that swing itself takes (part of the interval above, not on
// top of it — a 3s interval with a 900ms swing leaves each step ~2.1s of
// still, readable time at the top).
const HOLD_MS = 3000;
const SWING_MS = 900;

// angleDeg: 0 = top, increasing clockwise. radiusPct: distance from center
// as a percentage of the container, used for both the cards and the badges.
function polar(angleDeg, radiusPct) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + radiusPct * Math.sin(rad)}%`,
    top: `${50 - radiusPct * Math.cos(rad)}%`,
  };
}

export default function ServiceStepsWheel() {
  // Counts up forever rather than wrapping back to 0 — wrapping would make
  // the ring visibly snap backwards once every full revolution instead of
  // always spinning the same direction.
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTurn((t) => t + 1), HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const rotationOffset = turn * STEP_ANGLE;
  const activeIndex = turn % STEPS.length;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      <Image
        src="/servicecircle.png"
        alt="6 steps to avail CarCoolie's vehicle transport service"
        fill
        className="object-contain"
      />

      <div className="absolute inset-[30%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <p className="mt-3 px-2 text-sm leading-tight font-extrabold text-[#0b1e42] sm:text-base">
          6 Steps To Book Vehicle Transport
        </p>
        <p className="mt-1.5 text-[10px] font-bold tracking-[0.18em] text-red-600">
          SIMPLE • FAST • SECURE PROCESS
        </p>
      </div>

      {STEPS.map((step, i) => {
        // Subtracting (rather than adding) the offset moves the ring
        // clockwise over time — each step's angle decreases toward 0 (top)
        // in turn, holds there for HOLD_MS, then keeps sliding through.
        const angle = i * STEP_ANGLE - rotationOffset;
        const cardPos = polar(angle, 42);
        const badgePos = polar(angle, 58);
        const Icon = step.icon;
        const isActive = i === activeIndex;

        return (
          <div key={step.title}>
            <span
              aria-hidden
              className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600 shadow-md"
              style={{
                left: badgePos.left,
                top: badgePos.top,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                transition: `left ${SWING_MS}ms ease-in-out, top ${SWING_MS}ms ease-in-out, transform ${SWING_MS}ms ease-in-out`,
              }}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>

            <div
              className={`absolute w-36 rounded-2xl bg-white p-3 text-center shadow-lg sm:w-40 sm:p-4 ${
                isActive ? "z-10 ring-2 ring-red-500 shadow-2xl" : ""
              }`}
              style={{
                left: cardPos.left,
                top: cardPos.top,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                transition: `left ${SWING_MS}ms ease-in-out, top ${SWING_MS}ms ease-in-out, transform ${SWING_MS}ms ease-in-out, box-shadow ${SWING_MS}ms ease-in-out`,
              }}
            >
              <p className="text-[11px] font-bold text-red-600">{step.number}</p>
              <p className="mt-1 text-sm font-extrabold text-[#0b1e42] sm:text-base">{step.title}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
