"use client";

import { ArrowRight, Check } from "lucide-react";
import ServiceStepsWheel from "./ServiceStepsWheel";
import { useServiceSelection } from "../context/ServiceSelectionContext";

export default function ExploreServices() {
  const { service } = useServiceSelection();
  const [taglineStart, taglineEnd] = service.tagline;

  return (
    <section
      id="explore-services"
      className="relative scroll-mt-32 overflow-hidden bg-white px-6 py-20 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-red-600">Explore Services</p>
          <h2 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">
            <span className="text-[#0b1e42]">Everything You Need For Safe Car </span>
            <span className="text-red-600">Transportation</span>
          </h2>

          {/* Keyed by title so this whole block remounts (and replays the
              fade-in) every time the focused card in ServicesShowcase changes. */}
          <div key={service.title} style={{ animation: "fadeIn 0.4s ease-out" }}>
            <h3 className="mt-8 text-3xl font-extrabold leading-tight sm:text-4xl">
              <span className="text-[#0b1e42]">{taglineStart}</span>
              <span className="text-red-600">{taglineEnd}</span>
            </h3>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
              {service.details}
            </p>

            <ul className="mt-6 space-y-3">
              {service.highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 font-semibold text-[#0b1e42]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#contact-form"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Book This Service
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <ServiceStepsWheel />
      </div>
    </section>
  );
}
