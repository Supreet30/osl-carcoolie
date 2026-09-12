"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowRight } from "lucide-react";
import Navbar from "../../../landing-page/components/Navbar";
import EstimateModal from "./EstimateModal";
import CityDropdown from "./CityDropdown";
import { CITIES, getCities } from "../lib/pricing";

// One photo per stage of the journey — cycled automatically below so the
// hero shows pickup -> in transit -> destination on a loop, in step with
// the route marker above it moving the same way.
const ROUTE_STOPS = [
  { label: "PickUp", image: "/finalimages/homepage/ourservices1.png" },
  { label: "In Transit", image: "/b2cheronew.png" },
  { label: "Destination", image: "/finalimages/homepage/steps4.png" },
];
const STOP_DURATION_MS = 2000;

// `state` is relative to the currently active stop — "done" (already
// passed, hollow red), "active" (current stop, solid red) or "upcoming"
// (not reached yet, hollow navy) — matching the original fixed markers'
// look for whichever stop happens to be active.
function RouteMarker({ state }) {
  if (state === "active") {
    return <span className="relative z-10 h-3 w-3 rounded-full bg-red-600" />;
  }
  const ring = state === "done" ? "border-red-500" : "border-[#0b1e42]";
  return <span className={`relative z-10 h-3 w-3 rounded-full border-2 bg-white ${ring}`} />;
}

export default function B2cHero() {
  const [cities, setCities] = useState(CITIES);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);
  const [cityError, setCityError] = useState("");
  const [activeStop, setActiveStop] = useState(0);

  // Loads from Supabase (if configured) so this dropdown always matches
  // whatever cities the admin panel actually has active — same fetch
  // EstimateModal itself does when it opens.
  useEffect(() => {
    getCities().then(setCities);
  }, []);

  // Cycles pickup -> in transit -> destination on a loop, same 2s-per-stop
  // pacing ServiceStepsWheel uses for its own auto-advancing steps.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActiveStop((stop) => (stop + 1) % ROUTE_STOPS.length);
    }, STOP_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    if (!fromCity || !toCity) {
      setCityError("Select both a pickup and destination city.");
      return;
    }
    if (fromCity === toCity) {
      setCityError("Pickup and destination can't be the same city.");
      return;
    }
    setCityError("");
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

      <div className="relative mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
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
              {ROUTE_STOPS.map((stop, i) => (
                <RouteMarker
                  key={stop.label}
                  state={i < activeStop ? "done" : i === activeStop ? "active" : "upcoming"}
                />
              ))}
            </div>

            <div className="relative mt-6 aspect-4/3 overflow-hidden rounded-2xl bg-slate-50">
              <Image
                key={ROUTE_STOPS[activeStop].image}
                src={ROUTE_STOPS[activeStop].image}
                alt={`CarCoolie carrier truck — ${ROUTE_STOPS[activeStop].label} stage of a vehicle's journey`}
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              />
            </div>
          </div>
        </div>

        <div>
          {/* Invisible twin of the left column's label + heading, so the
              card below lines up with the left card's top edge instead of
              floating higher (its own content is much shorter). */}
          <div aria-hidden className="invisible hidden select-none lg:block">
            <p className="text-sm font-bold">India-wide car transportation</p>
            <h1 className="mt-3 text-4xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl">
              <span className="block">Your Car Our</span>
              <span className="block">Responsibility</span>
            </h1>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 sm:p-10 lg:mt-12">
            <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">Get Your Estimated Quote</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Select your pickup and destination city to get a quick transportation estimate.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              {/* Each dropdown excludes whatever's already picked in the
                  other one — Delhi selected as source means Delhi can't even
                  be picked as destination, not just rejected on submit. */}
              <CityDropdown
                label="Source City"
                placeholder="Select pickup city"
                iconClassName="text-red-500"
                value={fromCity}
                onChange={setFromCity}
                cities={cities.filter((city) => city !== toCity)}
              />

              <CityDropdown
                label="Destination City"
                placeholder="Select destination city"
                iconClassName="text-[#0b1e42]"
                value={toCity}
                onChange={setToCity}
                cities={cities.filter((city) => city !== fromCity)}
              />

              {cityError && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {cityError}
                </p>
              )}

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
      </div>
      </section>

      <EstimateModal
        open={showEstimate}
        onClose={() => setShowEstimate(false)}
        initialFromCity={fromCity}
        initialToCity={toCity}
      />
    </>
  );
}
