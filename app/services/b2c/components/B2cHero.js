"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import Navbar from "../../../landing-page/components/Navbar";
import EstimateModal from "./EstimateModal";

const ROUTE_STOPS = [
  { label: "PickUp", tone: "outline-red" },
  { label: "In Transit", tone: "filled-red" },
  { label: "Destination", tone: "outline-navy" },
];

function RouteMarker({ tone }) {
  if (tone === "filled-red") {
    return <span className="relative z-10 h-3 w-3 rounded-full bg-red-600" />;
  }
  const ring = tone === "outline-red" ? "border-red-500" : "border-[#0b1e42]";
  return <span className={`relative z-10 h-3 w-3 rounded-full border-2 bg-white ${ring}`} />;
}

export default function B2cHero() {
  const [pickupPin, setPickupPin] = useState("");
  const [destinationPin, setDestinationPin] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setShowEstimate(true);
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
      <Navbar />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm font-bold text-red-600">India-wide car transportation</p>
          <h1 className="mt-3 text-4xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl">
            <span className="block text-[#0b1e42]">Your Car Our</span>
            <span className="block text-red-600">Responsibility</span>
          </h1>

          <div className="mt-12 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
            <div className="grid grid-cols-3 text-center text-base font-extrabold text-[#0b1e42] sm:text-lg">
              {ROUTE_STOPS.map((stop) => (
                <span key={stop.label}>{stop.label}</span>
              ))}
            </div>
            <div className="relative mt-2.5 grid grid-cols-3 place-items-center">
              <span
                aria-hidden
                className="absolute top-1/2 left-[16.667%] right-[16.667%] -translate-y-1/2 border-t border-dashed border-red-300"
              />
              {ROUTE_STOPS.map((stop) => (
                <RouteMarker key={stop.label} tone={stop.tone} />
              ))}
            </div>

            <div className="relative mt-6 aspect-4/3 overflow-hidden rounded-2xl bg-slate-50">
              <Image
                src="/b2chero.png"
                alt="CarCoolie carrier truck transporting a vehicle, tracked from pickup to destination"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 sm:p-10">
          <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">Get Your Estimated Quote</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Enter your pickup and destination details to get a quick transportation estimate.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="block">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">Source Pin Code</span>
              <span className="relative mt-2 block">
                <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-red-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={pickupPin}
                  onChange={(event) => setPickupPin(event.target.value)}
                  placeholder="Enter pickup PIN code"
                  className="w-full rounded-full bg-slate-50 py-3.5 pr-4 pl-11 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">Destination Pin Code</span>
              <span className="relative mt-2 block">
                <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#0b1e42]" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={destinationPin}
                  onChange={(event) => setDestinationPin(event.target.value)}
                  placeholder="Enter destination PIN code"
                  className="w-full rounded-full bg-slate-50 py-3.5 pr-4 pl-11 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                />
              </span>
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              Get Estimated Quote
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Fast estimate&nbsp;&middot;&nbsp;Secure booking&nbsp;&middot;&nbsp;No hidden charges
          </p>
        </div>
      </div>
      </section>

      <EstimateModal open={showEstimate} onClose={() => setShowEstimate(false)} />
    </>
  );
}
