"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Route,
  ShieldCheck,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import {
  ADD_ON_SERVICES,
  VEHICLE_MODELS,
  computeEstimate,
  formatINR,
  getAddOnServices,
  getRoute,
  getVehicleModels,
  validateCoupon,
} from "../lib/pricing";
import { saveEstimate } from "../lib/bookingStore";
import Dropdown from "./Dropdown";

const YEARS = Array.from({ length: 15 }, (_, i) => `${new Date().getFullYear() - i}`);
const PIN_REGEX = /^\d{6}$/;

// Picked here (not on /book anymore) so the booking form only shows the
// driver location-capture step when it's actually relevant — see
// book/components/BookingForm.js, which reads these back off the saved
// estimate instead of asking again.
const PICKUP_METHODS = [
  { key: "self", label: "Self Drop-off", subtitle: "Drop the car at our hub", icon: MapPin },
  { key: "driver", label: "CarCoolie Driver Pickup", subtitle: "Professional driver collects car", icon: User },
];

const DROPOFF_METHODS = [
  { key: "self", label: "Self Pickup", subtitle: "Collect the car from our hub", icon: MapPin },
  { key: "driver", label: "CarCoolie Driver Drop-off", subtitle: "Driver delivers car to your location", icon: User },
];

// Small status note under a PIN field — reflects pickupPinStatus /
// destinationPinStatus from the resolution effects above.
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

function LoadingView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-20 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      <div>
        <p className="text-lg font-extrabold text-[#0b1e42]">Calculating Your Personal Quote...</p>
        <p className="mt-1 text-sm text-slate-500">
          Just a moment while we work out the best rate for your route.
        </p>
      </div>
    </div>
  );
}

function ResultView({ estimate, vehicleType, make, model, pickupPin, destinationPin, pickupMethod, dropoffMethod, onClose }) {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [showAddOns, setShowAddOns] = useState(false);

  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const { route, minDays, vehicleSurcharge, pickupCharge, dropoffCharge, addOnsTotal, addOnBreakdown, selectedAddOns, subtotal, gst } =
    estimate;
  // "flat" coupons are a straight rupee amount off; "percent" ones are a
  // percentage of the subtotal — mirrors computeEstimate()'s discount logic
  // in lib/pricing.js. Clamped to the subtotal so a flat coupon bigger than
  // the order can never push the total negative. Discount is off the
  // pre-tax subtotal — GST itself isn't discounted.
  const discount = appliedCoupon
    ? Math.min(
        appliedCoupon.type === "flat" ? Math.round(appliedCoupon.value) : Math.round(subtotal * (appliedCoupon.value / 100)),
        subtotal
      )
    : 0;
  const total = subtotal + gst - discount;

  async function handleApplyCoupon() {
    setApplyingCoupon(true);
    const coupon = await validateCoupon(couponInput);
    setApplyingCoupon(false);
    if (!coupon) {
      setAppliedCoupon(null);
      setCouponError("Invalid or expired coupon code.");
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError("");
  }

  function handleBookNow() {
    saveEstimate({
      fromCity: route.fromCity,
      toCity: route.toCity,
      pickupPin,
      destinationPin,
      distanceKm: route.distanceKm,
      minDays,
      vehicleType,
      make,
      model,
      pickupMethod,
      dropoffMethod,
      routePrice: route.price,
      vehicleSurcharge,
      pickupCharge,
      dropoffCharge,
      addOnsTotal,
      addOnBreakdown,
      selectedAddOns,
      subtotal,
      gst,
      coupon: appliedCoupon,
      discount,
      total,
    });
    onClose();
    router.push("/services/b2c/book");
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
      <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <Truck className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-base font-extrabold text-[#0b1e42]">
            {route.fromCity} <span className="text-slate-400">&rarr;</span> {route.toCity}
          </p>
          {(make || model) && (
            <p className="mt-0.5 text-sm font-extrabold text-[#0b1e42]">{[make, model].filter(Boolean).join(" ")}</p>
          )}
          <p className="mt-0.5 text-sm text-slate-500">
            {route.distanceKm != null && `~${route.distanceKm.toLocaleString("en-IN")} km • `}
            {vehicleType}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">Price Breakup</p>
        <div className="mt-3 flex flex-col divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-600">
              Transportation ({route.fromCity} &rarr; {route.toCity})
            </span>
            <span className="font-semibold text-[#0b1e42]">
              {formatINR(route.price + vehicleSurcharge + pickupCharge + dropoffCharge)}
            </span>
          </div>
          {addOnsTotal > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowAddOns((v) => !v)}
                className="flex w-full items-center justify-between py-2.5 text-left text-sm"
              >
                <span className="flex items-center gap-1.5 text-slate-600">
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${showAddOns ? "" : "-rotate-90"}`}
                  />
                  Value Added Services
                </span>
                <span className="font-semibold text-[#0b1e42]">{formatINR(addOnsTotal)}</span>
              </button>
              {showAddOns && (
                <div className="flex flex-col gap-1.5 py-2.5 pl-5 text-xs text-slate-500">
                  {addOnBreakdown.map((a) => (
                    <p key={a.key} className="flex items-center justify-between">
                      <span>{a.label}</span>
                      <span>{formatINR(a.price)}</span>
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-red-50 p-4">
        <p className="text-sm font-bold text-[#0b1e42]">Have a Coupon?</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(event) => {
              setCouponInput(event.target.value);
              setCouponError("");
            }}
            placeholder="e.g. WELCOME5"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0b1e42] uppercase outline-none placeholder:text-slate-400 placeholder:normal-case focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={applyingCoupon}
            className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
          >
            {applyingCoupon ? "Applying…" : "Apply"}
          </button>
        </div>
        {appliedCoupon && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {appliedCoupon.code} applied: Saved -{formatINR(discount)}
          </p>
        )}
        {couponError && <p className="mt-2 text-xs font-semibold text-red-600">{couponError}</p>}
      </div>

      <div className="flex flex-col divide-y divide-slate-100 text-sm">
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-slate-600">{formatINR(subtotal)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex items-center justify-between py-2 text-red-600">
            <span>Discount</span>
            <span>-{formatINR(discount)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4">
        <p className="text-xs font-extrabold tracking-wide text-slate-500 uppercase">Total Payable</p>
        <p className="text-2xl font-extrabold text-red-600">{formatINR(total)}</p>
      </div>

      <button
        type="button"
        onClick={handleBookNow}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1220] py-4 text-sm font-bold text-white transition-colors hover:bg-[#0b1220]/90"
      >
        Book Now
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function EstimateModal({
  open,
  onClose,
  initialFromCity,
  initialToCity,
  initialPickupPin,
  initialDestinationPin,
  initialPickupPinStatus,
  initialDestinationPinStatus,
}) {
  const [step, setStep] = useState("form");
  const [fromCity, setFromCity] = useState(initialFromCity ?? "");
  const [toCity, setToCity] = useState(initialToCity ?? "");
  const [vehicleType, setVehicleType] = useState("");
  // Make and Model drive vehicleType automatically (see handleModelChange
  // below) — there's no free text entry for either, both are dropdowns
  // sourced from vehicle_models.
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vehicleModels, setVehicleModels] = useState(VEHICLE_MODELS);
  // Decorative — collected but not part of the estimate, same as before
  // this was a native <select>.
  const [registrationYear, setRegistrationYear] = useState("");
  const [pickupPin, setPickupPin] = useState(initialPickupPin ?? "");
  const [destinationPin, setDestinationPin] = useState(initialDestinationPin ?? "");
  // "idle" | "checking" | "matched" | "not_matched" | "error", plus the
  // `pin` it applies to — drives the small status note under each PIN
  // field. City is derived from the PIN alone now (no manual picker), so
  // "matched" is also what makes fromCity/toCity valid for the estimate at
  // all. Seeded from the hero's own already-resolved status (see
  // initialPickupPinStatus below) so a PIN the customer already typed
  // there doesn't get silently re-checked here too.
  const [pickupPinStatus, setPickupPinStatus] = useState(initialPickupPinStatus ?? { status: "idle" });
  const [destinationPinStatus, setDestinationPinStatus] = useState(initialDestinationPinStatus ?? { status: "idle" });
  const [pickupMethod, setPickupMethod] = useState("self");
  const [dropoffMethod, setDropoffMethod] = useState("self");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [routeError, setRouteError] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [addOnCatalog, setAddOnCatalog] = useState(ADD_ON_SERVICES);
  const routeErrorRef = useRef(null);

  // Same reasoning as B2cHero.js's cityError effect — this form scrolls
  // internally and the error sits partway down it, easy to miss if it
  // appears while the customer's scrolled elsewhere in the modal.
  useEffect(() => {
    if (routeError) routeErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [routeError]);

  const makes = [...new Set(vehicleModels.map((v) => v.make))];
  const modelsForMake = vehicleModels.filter((v) => v.make === make).map((v) => v.model);

  function handleMakeChange(nextMake) {
    setMake(nextMake);
    setModel("");
    setVehicleType("");
  }

  function handleModelChange(nextModel) {
    setModel(nextModel);
    const match = vehicleModels.find((v) => v.make === make && v.model === nextModel);
    setVehicleType(match?.vehicleType ?? "");
  }

  // Adjusting state during render (React's documented alternative to an
  // effect for this) rather than setState-in-an-effect: carries over
  // whatever PIN codes (and the cities they'd already resolved to) the
  // B2cHero quote card had the moment this modal opens, without
  // re-snapping these fields back on every render while it's open (which
  // would fight the customer's own edits inside the modal).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFromCity(initialFromCity ?? "");
      setToCity(initialToCity ?? "");
      setPickupPin(initialPickupPin ?? "");
      setDestinationPin(initialDestinationPin ?? "");
      setPickupPinStatus(initialPickupPinStatus ?? { status: "idle" });
      setDestinationPinStatus(initialDestinationPinStatus ?? { status: "idle" });
    }
  }

  useEffect(() => {
    if (!open) return;
    // Refreshes from Supabase (if configured) every time the modal opens —
    // falls back to the static ADD_ON_SERVICES/VEHICLE_MODELS already
    // shown above if it's not configured or the fetch fails.
    getAddOnServices().then(setAddOnCatalog);
    getVehicleModels().then(setVehicleModels);
  }, [open]);

  // Resolves a 6-digit PIN to one of our serviced cities via
  // /api/resolve-pincode (proxied server-side — see that route for why).
  // City is derived from the PIN alone now — there's no dropdown to
  // auto-fill, fromCity/toCity ARE the resolved city. Debounced so it
  // doesn't fire on every keystroke while still typing toward 6 digits.
  // Always sets the city on a match, even when it equals the other leg's
  // city — handleSubmit's fromCity===toCity check is what reports that
  // case accurately; skipping the set here would leave the city empty
  // while the status still claims "Detected", producing a misleading
  // "enter a valid PIN" error instead of the real one.
  useEffect(() => {
    if (!PIN_REGEX.test(pickupPin)) {
      setPickupPinStatus({ status: "idle" });
      return undefined;
    }
    // Already resolved for this exact PIN — the hero quote card just
    // handed this over already matched, so don't re-check it here too.
    // Anything short of a confirmed match (idle/checking/not_matched/error)
    // still gets a fresh attempt, since those aren't results worth trusting.
    if (pickupPinStatus.status === "matched" && pickupPinStatus.pin === pickupPin) return undefined;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pickupPinStatus is read, not a trigger; re-resolving whenever it changes would fight the customer's own pincode-driven pick
  }, [pickupPin]);

  useEffect(() => {
    if (!PIN_REGEX.test(destinationPin)) {
      setDestinationPinStatus({ status: "idle" });
      return undefined;
    }
    if (destinationPinStatus.status === "matched" && destinationPinStatus.pin === destinationPin) return undefined;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- destinationPinStatus is read, not a trigger; re-resolving whenever it changes would fight the customer's own pincode-driven pick
  }, [destinationPin]);

  if (!open) return null;

  function handleClose() {
    setStep("form");
    setRouteError("");
    onClose();
  }

  function toggleAddOn(key) {
    setSelectedAddOns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  // Keeps each field numeric-as-you-type (also rules out whitespace-only
  // input) and caps it at 6 digits, matching a real Indian PIN code —
  // same helper B2cHero.js used to use before pincodes moved here.
  function handlePinInput(setter) {
    return (event) => setter(event.target.value.replace(/\D/g, "").slice(0, 6));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!make || !model) {
      setRouteError("Select your vehicle's make and model.");
      return;
    }
    if (!vehicleType) {
      setRouteError("We couldn't determine a vehicle type for that model.");
      return;
    }
    if (!pickupPin.trim() || !destinationPin.trim()) {
      setRouteError("Enter both a pickup and destination PIN code.");
      return;
    }
    if (!PIN_REGEX.test(pickupPin) || !PIN_REGEX.test(destinationPin)) {
      setRouteError("PIN codes must be exactly 6 digits.");
      return;
    }
    if (pickupPin === destinationPin) {
      setRouteError("Pickup and destination PIN codes can't be the same.");
      return;
    }
    // City is derived from the PIN codes above (see the resolution effects)
    // — if either still hasn't resolved to one by now, there's no city to
    // look a route up for yet.
    if (!fromCity || !toCity) {
      setRouteError("We couldn't detect a city for one of those PIN codes — please double-check them.");
      return;
    }
    if (fromCity === toCity) {
      setRouteError("Pickup and destination PIN codes resolve to the same city.");
      return;
    }
    const route = await getRoute(fromCity, toCity);
    if (!route) {
      setRouteError("We don't have a route between these two cities yet.");
      return;
    }
    setRouteError("");
    setStep("loading");
    // Keep a minimum visible delay on the loading view even though the
    // Supabase fetch inside computeEstimate is usually much faster than
    // this — it reads as "calculating" rather than a flash of content.
    const [computed] = await Promise.all([
      computeEstimate({ fromCity, toCity, vehicleType, make, selectedAddOns, pickupMethod, dropoffMethod }),
      new Promise((resolve) => setTimeout(resolve, 1400)),
    ]);
    setEstimate(computed);
    setStep("result");
  }

  const isResult = step === "result";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">
              {isResult ? (
                <>
                  Estimate <span className="text-red-600">Quote</span>
                </>
              ) : (
                <>
                  Get an <span className="text-red-600">Estimate</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isResult
                ? "Review your estimated transportation cost before booking."
                : "Tell us about your vehicle and route to receive an accurate transportation estimate."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "loading" && <LoadingView />}
        {step === "result" && estimate && (
          <ResultView
            estimate={estimate}
            vehicleType={vehicleType}
            make={make}
            model={model}
            pickupPin={pickupPin}
            destinationPin={destinationPin}
            pickupMethod={pickupMethod}
            dropoffMethod={dropoffMethod}
            onClose={handleClose}
          />
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  <Car className="h-4 w-4" strokeWidth={2} />
                  Vehicle Information
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Make
                    <Dropdown placeholder="Select make" value={make} onChange={handleMakeChange} options={makes} />
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Model
                    <Dropdown
                      placeholder={make ? "Select model" : "Select a make first"}
                      value={model}
                      onChange={handleModelChange}
                      options={modelsForMake}
                      disabled={!make}
                    />
                  </label>
                  <div className="block text-sm font-semibold text-[#0b1e42]">
                    Vehicle Type
                    {/* Determined automatically from the selected model
                        above, not picked directly — a static readout
                        rather than a disabled Dropdown so it doesn't
                        look like an inert control the customer can click. */}
                    <div className="mt-2 flex w-full items-center gap-2.5 rounded-xl bg-slate-50 py-3 pr-3 pl-4">
                      <Tag className="h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
                      <span className={`flex-1 truncate text-sm ${vehicleType ? "font-semibold text-[#0b1e42]" : "font-normal text-slate-400"}`}>
                        {vehicleType || "Select a make & model first"}
                      </span>
                      {vehicleType && (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-600 uppercase">
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs font-normal text-slate-400">
                      Automatically determined from your vehicle model.
                    </p>
                  </div>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Registration Year
                    <Dropdown
                      icon={Calendar}
                      iconClassName="text-slate-400"
                      placeholder="Select year"
                      value={registrationYear}
                      onChange={setRegistrationYear}
                      options={YEARS}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  <Route className="h-4 w-4" strokeWidth={2} />
                  Transportation Details
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Source Pincode
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pickupPin}
                      onChange={handlePinInput(setPickupPin)}
                      placeholder="Enter pickup PIN code"
                      className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                    />
                    <PincodeStatus status={pickupPinStatus} />
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Destination Pincode
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={destinationPin}
                      onChange={handlePinInput(setDestinationPin)}
                      placeholder="Enter destination PIN code"
                      className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                    />
                    <PincodeStatus status={destinationPinStatus} />
                  </label>
                </div>

                {routeError && (
                  <p ref={routeErrorRef} className="mt-3 text-xs font-semibold text-red-600">
                    {routeError}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  <User className="h-4 w-4" strokeWidth={2} />
                  Pickup &amp; Drop-off Method
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#0b1e42]">Choose Pickup Method</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {PICKUP_METHODS.map(({ key, label, subtitle, icon: Icon }) => {
                      const selected = pickupMethod === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPickupMethod(key)}
                          className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                            selected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
                          <span>
                            <span className="block text-sm font-bold text-[#0b1e42]">{label}</span>
                            <span className="block text-xs text-slate-500">{subtitle}</span>
                          </span>
                          {selected && (
                            <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-[#0b1e42]">Choose Drop-off Method</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {DROPOFF_METHODS.map(({ key, label, subtitle, icon: Icon }) => {
                      const selected = dropoffMethod === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDropoffMethod(key)}
                          className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                            selected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
                          <span>
                            <span className="block text-sm font-bold text-[#0b1e42]">{label}</span>
                            <span className="block text-xs text-slate-500">{subtitle}</span>
                          </span>
                          {selected && (
                            <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Chosen here rather than on /book — a driver pickup/drop-off
                    only adds the location-capture step there if opted into
                    here; "Self" skips it entirely. */}
                <p className="mt-3 text-xs font-normal text-slate-400">
                  Opting for a CarCoolie Driver adds a quick location step on the next page.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                  Value-Added Services
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {addOnCatalog.map(({ key, label, subtitle, price }) => {
                    const selected = selectedAddOns.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAddOn(key)}
                        className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 text-left transition-colors ${
                          selected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-red-200"
                        }`}
                      >
                        <span
                          className={`absolute top-4 right-4 flex h-4 w-4 items-center justify-center rounded border ${
                            selected ? "border-red-600 bg-red-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-[#0b1e42]">
                            {label} <span className="font-semibold text-slate-400">(+{formatINR(price)})</span>
                          </span>
                          <span className="block text-xs text-slate-500">{subtitle}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1220] py-4 text-sm font-bold text-white transition-colors hover:bg-[#0b1220]/90"
                >
                  Calculate My Estimate
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    No obligation
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Fast estimate
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    Secure info
                  </span>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
