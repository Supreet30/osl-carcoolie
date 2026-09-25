"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "../../../landing-page/components/Navbar";
import EstimateModal from "./EstimateModal";
import { getRoute } from "../lib/pricing";

const PIN_REGEX = /^\d{6}$/;

// Small status note under a PIN field. PIN code is the only way to set a
// city here now — no dropdown fallback — so "not_matched"/"error" can't
// point at one; they just ask for a different/rechecked PIN instead.
function PincodeStatus({ status }) {
  if (status.status === "checking") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Detecting city…
      </span>
    );
  }
  if (status.status === "matched") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-green-600">
        <CheckCircle2 className="h-3 w-3" /> Detected: {status.city}
      </span>
    );
  }
  if (status.status === "not_matched") {
    return (
      <span className="mt-1.5 block text-xs text-amber-600">
        We don&apos;t recognize this PIN code as a serviced city yet — double-check it or try a nearby one.
      </span>
    );
  }
  if (status.status === "error") {
    return <span className="mt-1.5 block text-xs text-slate-400">Couldn&apos;t check this PIN right now — please try again.</span>;
  }
  return null;
}

// One photo per stage of the journey — cycled automatically below so the
// hero shows pickup -> in transit -> destination on a loop, in step with
// the route marker above it moving the same way.
const ROUTE_STOPS = [
  { label: "PickUp", image: "/finalimages/homepage/ourservices1.png" },
  { label: "In Transit", image: "/finalimages/services/b2c3.jpeg" },
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
  // fromCity/toCity are never picked directly anymore — PIN code is the
  // only input, resolved to a city via /api/resolve-pincode below. Still
  // needed as state: EstimateModal wants a city (not a PIN) to pre-fill,
  // and the route preview looks itself up by city.
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [pickupPin, setPickupPin] = useState("");
  const [destinationPin, setDestinationPin] = useState("");
  const [pickupPinStatus, setPickupPinStatus] = useState({ status: "idle" });
  const [destinationPinStatus, setDestinationPinStatus] = useState({ status: "idle" });
  const [showEstimate, setShowEstimate] = useState(false);
  const [cityError, setCityError] = useState("");
  // While the route-exists check (getRoute) is in flight, after the PIN
  // checks above already passed — brief, but worth a disabled/labeled
  // button so a slow connection doesn't look like a dead click.
  const [checkingRoute, setCheckingRoute] = useState(false);
  const [activeStop, setActiveStop] = useState(0);
  const cityErrorRef = useRef(null);

  // Scrolls the error into view the moment one appears, regardless of
  // which check set it (PIN format, same city, or no route) — the form
  // sits well down the page, so a silently-appearing error above/below the
  // fold is easy to miss otherwise.
  useEffect(() => {
    if (cityError) cityErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cityError]);

  // Keeps each field numeric-as-you-type and caps it at 6 digits, matching
  // a real Indian PIN code.
  function handlePinInput(setter) {
    return (event) => setter(event.target.value.replace(/\D/g, "").slice(0, 6));
  }

  // Resolves a 6-digit PIN to one of our serviced cities via
  // /api/resolve-pincode (see that route — it's proxied server-side).
  // Debounced. Always sets fromCity on a match, even when it equals the
  // other leg's city — handleSubmit's fromCity===toCity check is what
  // reports that case accurately; silently skipping the set here would
  // leave toCity/fromCity empty while the status still claims "Detected",
  // producing a misleading "enter a valid PIN" error instead.
  useEffect(() => {
    if (!PIN_REGEX.test(pickupPin)) {
      setPickupPinStatus({ status: "idle" });
      return undefined;
    }
    let cancelled = false;
    setPickupPinStatus({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resolve-pincode?pincode=${pickupPin}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.matched) setFromCity(data.city);
        setPickupPinStatus(
          data.matched ? { status: "matched", city: data.city, pin: pickupPin } : { status: "not_matched" }
        );
      } catch {
        if (!cancelled) setPickupPinStatus({ status: "error" });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickupPin]);

  useEffect(() => {
    if (!PIN_REGEX.test(destinationPin)) {
      setDestinationPinStatus({ status: "idle" });
      return undefined;
    }
    let cancelled = false;
    setDestinationPinStatus({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resolve-pincode?pincode=${destinationPin}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.matched) setToCity(data.city);
        setDestinationPinStatus(
          data.matched ? { status: "matched", city: data.city, pin: destinationPin } : { status: "not_matched" }
        );
      } catch {
        if (!cancelled) setDestinationPinStatus({ status: "error" });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [destinationPin]);

  // Cycles pickup -> in transit -> destination on a loop, same 2s-per-stop
  // pacing ServiceStepsWheel uses for its own auto-advancing steps.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActiveStop((stop) => (stop + 1) % ROUTE_STOPS.length);
    }, STOP_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!fromCity || !toCity) {
      setCityError("Enter a valid pickup and destination PIN code.");
      return;
    }
    if (fromCity === toCity) {
      setCityError("Pickup and destination PIN codes resolve to the same city.");
      return;
    }

    setCityError("");
    setCheckingRoute(true);
    const route = await getRoute(fromCity, toCity);
    setCheckingRoute(false);
    if (!route) {
      setCityError("Coming soon to this location — we're expanding our network and will be there shortly.");
      return;
    }

    setShowEstimate(true);
  }

  return (
    <>
      <section className="relative isolate bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
      {/* Clips just this decorative blob (it's offset past the section's own
          edges) instead of the whole section — overflow-hidden on the
          section itself used to also clip the city dropdowns' floating
          panels the moment they grew taller than the hero, cutting them off
          against whatever section happened to sit below instead of letting
          them float on top of it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]" />
      </div>
      <Navbar />

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
              Enter your pickup and destination PIN code — we&apos;ll detect the city for you — to get a quick
              transportation estimate.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="grid gap-5">
                <label className="block">
                  <span className="block text-xs font-bold tracking-wide text-slate-500 uppercase">Pickup PIN Code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pickupPin}
                    onChange={handlePinInput(setPickupPin)}
                    placeholder="e.g. 110001"
                    className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                  />
                  <PincodeStatus status={pickupPinStatus} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold tracking-wide text-slate-500 uppercase">Destination PIN Code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={destinationPin}
                    onChange={handlePinInput(setDestinationPin)}
                    placeholder="e.g. 400001"
                    className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                  />
                  <PincodeStatus status={destinationPinStatus} />
                </label>
              </div>

              {cityError && (
                <p ref={cityErrorRef} className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {cityError}
                </p>
              )}

              <button
                type="submit"
                disabled={checkingRoute}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-80"
              >
                {checkingRoute ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking Route…
                  </>
                ) : (
                  <>
                    Get Estimated Quote
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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
        initialPickupPin={pickupPin}
        initialDestinationPin={destinationPin}
        initialPickupPinStatus={pickupPinStatus}
        initialDestinationPinStatus={destinationPinStatus}
      />
    </>
  );
}
