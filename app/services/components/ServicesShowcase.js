"use client";

import Image from "next/image";
import { TABS } from "../data/serviceTabs";
import { useServiceSelection } from "../context/ServiceSelectionContext";

export default function ServicesShowcase() {
  const { activeTab, activeIndex, selectTab, selectService, tab } = useServiceSelection();
  const ActiveIcon = tab.icon;
  const services = tab.services;

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">What We Provide</p>
        <h2 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-[#0b1e42]">We Transport </span>
          <span className="text-red-600">Your Vehicles Safely </span>
          <span className="text-[#0b1e42]">Across India</span>
        </h2>

        <div className="relative mx-auto mt-10 flex max-w-3xl items-center rounded-full bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(i)}
              className={`relative z-10 flex-1 rounded-full px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === i ? "bg-[#0b1e42] text-white" : "text-[#0b1e42]"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => selectTab(activeTab === 0 ? 1 : 0)}
            aria-label="Switch service audience"
            className="absolute left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-[#0b1e42] text-white shadow-md ring-4 ring-white transition-transform hover:scale-105"
          >
            <ActiveIcon className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-14 flex items-start gap-4">
          {services.map((service, i) => {
            const isOpen = i === activeIndex;
            return (
              <div
                key={service.title}
                className={`transition-[flex-grow] duration-500 ease-in-out ${
                  isOpen ? "flex-[4]" : "flex-[1]"
                } min-w-[64px]`}
              >
                <button
                  type="button"
                  onClick={() => selectService(i)}
                  aria-expanded={isOpen}
                  className="group relative block h-[420px] w-full overflow-hidden rounded-2xl text-left sm:h-[480px]"
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1023px) 100vw, 30vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                  <div
                    className={`absolute inset-x-0 bottom-0 p-6 text-white transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <p className="text-md font-bold tracking-wide">
                      {String(i + 1).padStart(2, "0")}
                      <span className="text-red-500">/{String(services.length).padStart(2, "0")}</span>
                    </p>
                    <h3 className="mt-2 text-4xl font-extrabold">{service.title}</h3>
                    <p className="mt-2 max-w-md text-md leading-relaxed text-slate-200">
                      {service.description}
                    </p>
                    <span className="mt-4 inline-flex items-center rounded-full border border-white px-6 py-3 text-md font-semibold transition-colors hover:bg-white hover:text-[#0b1e42]">
                      Learn More
                    </span>
                  </div>

                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      isOpen ? "pointer-events-none opacity-0" : "opacity-100"
                    }`}
                  >
                    <span className="origin-center -rotate-90 whitespace-nowrap text-2xl font-bold uppercase tracking-wide text-white">
                      {service.title}
                    </span>
                  </div>
                </button>

                <span
                  aria-hidden
                  className={`mt-3 block h-1.5 w-full rounded-full transition-colors duration-300 ${
                    isOpen ? "bg-red-500" : "bg-slate-200"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
