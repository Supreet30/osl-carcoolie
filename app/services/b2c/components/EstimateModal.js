"use client";

import { useState } from "react";
import Link from "next/link";
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

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Truck", "Coupe"];
const YEARS = Array.from({ length: 15 }, (_, i) => `${new Date().getFullYear() - i}`);

const ADD_ONS = [
  { icon: Calendar, title: "Guaranteed Date", subtitle: "Priority scheduling" },
  { icon: ShieldCheck, title: "Insurance", subtitle: "Additional coverage" },
  { icon: Car, title: "Car Wash", subtitle: "Professional cleaning" },
];

// Mock quote — there's no backend wired up yet, so this is the same
// illustrative result every time, just to demo the loading → result flow.
const MOCK_QUOTE = {
  from: "Delhi",
  to: "Mumbai",
  distance: "1,400 km",
  vehicleType: "Sedan",
  transportation: 20000,
  serviceCharges: 1000,
  valueAddedServices: 2000,
  gstRate: 0.18,
  couponCode: "WELCOME10",
  couponDiscount: 2500,
};

function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function SelectField({ icon: Icon, iconClassName, ...props }) {
  return (
    <span className="relative mt-2 block">
      {Icon && (
        <Icon className={`pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 ${iconClassName}`} />
      )}
      <select
        {...props}
        className={`w-full appearance-none rounded-xl bg-slate-50 py-3 pr-10 text-sm font-normal text-slate-500 outline-none focus:ring-2 focus:ring-red-500 ${
          Icon ? "pl-11" : "pl-4"
        }`}
      />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </span>
  );
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

function ResultView() {
  const [couponCode, setCouponCode] = useState(MOCK_QUOTE.couponCode);
  const [couponApplied, setCouponApplied] = useState(true);
  const [showAddOns, setShowAddOns] = useState(false);

  const base = MOCK_QUOTE.transportation + MOCK_QUOTE.serviceCharges + MOCK_QUOTE.valueAddedServices;
  const gst = Math.round(base * MOCK_QUOTE.gstRate);
  const subtotal = base + gst;
  const discount = couponApplied ? MOCK_QUOTE.couponDiscount : 0;
  const total = subtotal - discount;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-6">
      <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <Truck className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-base font-extrabold text-[#0b1e42]">
            {MOCK_QUOTE.from} <span className="text-slate-400">&rarr;</span> {MOCK_QUOTE.to}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {MOCK_QUOTE.distance} &bull; {MOCK_QUOTE.vehicleType}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">Price Breakup</p>
        <div className="mt-3 flex flex-col divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-600">
              Transportation ({MOCK_QUOTE.from} &rarr; {MOCK_QUOTE.to})
            </span>
            <span className="font-semibold text-[#0b1e42]">{formatINR(MOCK_QUOTE.transportation)}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-600">Service Charges</span>
            <span className="font-semibold text-[#0b1e42]">{formatINR(MOCK_QUOTE.serviceCharges)}</span>
          </div>
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
            <span className="font-semibold text-[#0b1e42]">{formatINR(MOCK_QUOTE.valueAddedServices)}</span>
          </button>
          {showAddOns && (
            <div className="flex flex-col gap-1.5 py-2.5 pl-5 text-xs text-slate-500">
              {ADD_ONS.map(({ title }) => (
                <p key={title}>{title}</p>
              ))}
            </div>
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
            value={couponCode}
            onChange={(event) => {
              setCouponCode(event.target.value);
              setCouponApplied(false);
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="button"
            onClick={() => setCouponApplied(true)}
            className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Apply
          </button>
        </div>
        {couponApplied && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {couponCode} applied: Saved -{formatINR(MOCK_QUOTE.couponDiscount)}
          </p>
        )}
      </div>

      <div className="flex flex-col divide-y divide-slate-100 text-sm">
        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500">Subtotal</span>
          <span className="text-slate-600">{formatINR(subtotal)}</span>
        </div>
        {couponApplied && (
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

      <Link
        href="/services/b2c/book"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1220] py-4 text-sm font-bold text-white transition-colors hover:bg-[#0b1220]/90"
      >
        Book Now
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function EstimateModal({ open, onClose }) {
  const [step, setStep] = useState("form"); // "form" | "loading" | "result"

  if (!open) return null;

  function handleClose() {
    setStep("form");
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStep("loading");
    // No backend wired up yet — simulate a short calculation delay.
    setTimeout(() => setStep("result"), 1800);
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
        {step === "result" && <ResultView />}

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
                    <SelectField defaultValue="">
                      <option value="" disabled>
                        Select type
                      </option>
                      {VEHICLE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </SelectField>
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Registration Year
                    <SelectField icon={Calendar} iconClassName="text-slate-400" defaultValue="">
                      <option value="" disabled>
                        Select year
                      </option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </SelectField>
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
                    <SelectField icon={MapPin} iconClassName="text-red-500" defaultValue="">
                      <option value="" disabled>
                        Source
                      </option>
                    </SelectField>
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1e42]">
                    Destination Location
                    <SelectField icon={MapPin} iconClassName="text-[#0b1e42]" defaultValue="">
                      <option value="" disabled>
                        Destination
                      </option>
                    </SelectField>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                  Value-Added Services
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {ADD_ONS.map(({ icon: Icon, title, subtitle }) => (
                    <label
                      key={title}
                      className="relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:border-red-200"
                    >
                      <input
                        type="checkbox"
                        className="absolute top-4 right-4 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#0b1e42]">{title}</span>
                        <span className="block text-xs text-slate-500">{subtitle}</span>
                      </span>
                    </label>
                  ))}
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
