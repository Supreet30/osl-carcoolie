"use client";

import { useEffect, useState } from "react";
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
  Truck,
  X,
} from "lucide-react";
import {
  ADD_ON_SERVICES,
  CITIES,
  VEHICLE_TYPES,
  computeEstimate,
  formatINR,
  getAddOnServices,
  getCities,
  getRoute,
  getVehicleTypes,
  validateCoupon,
} from "../lib/pricing";
import { saveEstimate } from "../lib/bookingStore";
import Dropdown from "./Dropdown";

const YEARS = Array.from({ length: 15 }, (_, i) => `${new Date().getFullYear() - i}`);
const PIN_REGEX = /^\d{6}$/;

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

function ResultView({ estimate, vehicleType, pickupPin, destinationPin, onClose }) {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [showAddOns, setShowAddOns] = useState(false);

  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const { route, minDays, vehicleSurcharge, addOnsTotal, addOnBreakdown, selectedAddOns, serviceCharge, gst, subtotal } = estimate;
  // "flat" coupons are a straight rupee amount off; "percent" ones are a
  // percentage of the subtotal — mirrors computeEstimate()'s discount logic
  // in lib/pricing.js. Clamped to the subtotal so a flat coupon bigger than
  // the order can never push the total negative.
  const discount = appliedCoupon
    ? Math.min(
        appliedCoupon.type === "flat" ? Math.round(appliedCoupon.value) : Math.round(subtotal * (appliedCoupon.value / 100)),
        subtotal
      )
    : 0;
  const total = subtotal - discount;

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
      routePrice: route.price,
      vehicleSurcharge,
      serviceCharge,
      addOnsTotal,
      addOnBreakdown,
      selectedAddOns,
      gst,
      subtotal,
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
          <p className="mt-0.5 text-sm text-slate-500">
            ~{route.distanceKm.toLocaleString("en-IN")} km &bull; {vehicleType}
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
            <span className="font-semibold text-[#0b1e42]">{formatINR(route.price)}</span>
          </div>
          {vehicleSurcharge !== 0 && (
            <div className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-slate-600">Vehicle Type ({vehicleType})</span>
              <span className={`font-semibold ${vehicleSurcharge > 0 ? "text-[#0b1e42]" : "text-green-600"}`}>
                {vehicleSurcharge > 0 ? "+" : "-"}
                {formatINR(Math.abs(vehicleSurcharge))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-600">Service Charges</span>
            <span className="font-semibold text-[#0b1e42]">{formatINR(serviceCharge)}</span>
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
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-600">GST (18%)</span>
            <span className="font-semibold text-[#0b1e42]">{formatINR(gst)}</span>
          </div>
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
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Tax (GST)</span>
          <span className="text-slate-600">Included</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4">
        <div>
          <p className="text-xs font-extrabold tracking-wide text-slate-500 uppercase">Total Payable</p>
          <p className="text-xs text-slate-400">Inclusive of all taxes</p>
        </div>
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

export default function EstimateModal({ open, onClose, initialFromCity, initialToCity }) {
  const [step, setStep] = useState("form");
  const [fromCity, setFromCity] = useState(initialFromCity ?? "");
  const [toCity, setToCity] = useState(initialToCity ?? "");
  const [vehicleType, setVehicleType] = useState("");
  // Decorative alongside Make/Model — collected but not part of the
  // estimate (same as those two text fields), same as before this was a
  // native <select>.
  const [registrationYear, setRegistrationYear] = useState("");
  const [pickupPin, setPickupPin] = useState("");
  const [destinationPin, setDestinationPin] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [routeError, setRouteError] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [cities, setCities] = useState(CITIES);
  const [addOnCatalog, setAddOnCatalog] = useState(ADD_ON_SERVICES);
  const [vehicleTypes, setVehicleTypes] = useState(VEHICLE_TYPES);

  // Adjusting state during render (React's documented alternative to an
  // effect for this) rather than setState-in-an-effect: carries over
  // whatever the B2cHero city dropdowns already had selected the moment
  // this modal opens, without re-snapping fromCity/toCity back on every
  // render while it's open (which would fight the user's own selection
  // inside the modal).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFromCity(initialFromCity ?? "");
      setToCity(initialToCity ?? "");
    }
  }

  useEffect(() => {
    if (!open) return;
    // Refreshes from Supabase (if configured) every time the modal opens —
    // falls back to the static CITIES/ADD_ON_SERVICES/VEHICLE_TYPES already
    // shown above if it's not configured or the fetch fails.
    getCities().then(setCities);
    getAddOnServices().then(setAddOnCatalog);
    getVehicleTypes().then(setVehicleTypes);
  }, [open]);

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

    if (!vehicleType) {
      setRouteError("Select a vehicle type.");
      return;
    }
    if (!fromCity || !toCity) {
      setRouteError("Select both a pickup and destination location.");
      return;
    }
    if (fromCity === toCity) {
      setRouteError("Pickup and destination can't be the same city.");
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
      computeEstimate({ fromCity, toCity, vehicleType, selectedAddOns }),
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
            pickupPin={pickupPin}
            destinationPin={destinationPin}
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
                    <input
                      type="text"
                      placeholder="e.g. Tesla, Ford"
                      className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Model
                    <input
                      type="text"
                      placeholder="e.g. Model S, F-150"
                      className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Vehicle Type
                    <Dropdown
                      placeholder="Select type"
                      value={vehicleType}
                      onChange={setVehicleType}
                      options={vehicleTypes.map((v) => v.name)}
                    />
                  </label>
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
                    Pickup Location
                    {/* Excludes whatever's picked as the destination — a
                        city can't be its own route. */}
                    <Dropdown
                      icon={MapPin}
                      iconClassName="text-red-500"
                      placeholder="Select city"
                      value={fromCity}
                      onChange={setFromCity}
                      options={cities.filter((city) => city !== toCity)}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Destination Location
                    <Dropdown
                      icon={MapPin}
                      iconClassName="text-[#0b1e42]"
                      placeholder="Select city"
                      value={toCity}
                      onChange={setToCity}
                      options={cities.filter((city) => city !== fromCity)}
                    />
                  </label>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                  </label>
                </div>
                {routeError && <p className="mt-3 text-xs font-semibold text-red-600">{routeError}</p>}
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
