"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Fingerprint,
  IdCard,
  MapPin,
  LocateFixed,
  Map,
  Navigation,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { MOCK_QUOTE } from "../../mockQuote";

const DOCUMENT_TYPES = [
  { key: "rc", label: "RC Card", icon: FileText },
  { key: "license", label: "Driving License", icon: CreditCard },
  { key: "pan", label: "PAN Card", icon: IdCard },
  { key: "aadhaar", label: "Aadhaar", icon: Fingerprint },
  { key: "insurance", label: "Insurance", icon: Shield },
];

const PICKUP_METHODS = [
  { key: "self", label: "Self Drop-off", subtitle: "Drop the car at our hub", icon: MapPin },
  { key: "driver", label: "CarCoolie Driver Pickup", subtitle: "Professional driver collects car", icon: User },
];

const DROPOFF_METHODS = [
  { key: "self", label: "Self Pickup", subtitle: "Collect the car from our hub", icon: MapPin },
  { key: "driver", label: "CarCoolie Driver Drop-off", subtitle: "Driver delivers car to your location", icon: User },
];

const LOCATION_MODES = [
  { key: "current", label: "Current Location", icon: LocateFixed },
  { key: "map", label: "Select on Map", icon: Map },
];

const TIME_SLOTS = ["09:00 - 11:00", "11:00 - 01:00", "01:00 - 03:00", "03:00 - 05:00"];

function SectionCard({ icon: Icon, title, badge, children }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <h2 className="text-lg font-extrabold text-[#0b1e42] sm:text-xl">{title}</h2>
        </div>
        {badge && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {badge}
          </span>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function TextField({ label, ...props }) {
  return (
    <label className="block text-sm font-semibold text-[#0b1e42]">
      {label}
      <input
        {...props}
        className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
      />
    </label>
  );
}

export default function BookingForm() {
  const [uploads, setUploads] = useState({
    rc: { uploaded: true, fileName: "RC.pdf", fileSize: "1.2 MB" },
    license: { uploaded: false },
    pan: { uploaded: false },
    aadhaar: { uploaded: false },
    insurance: { uploaded: false },
  });
  const [pickupMethod, setPickupMethod] = useState("driver");
  const [locationMode, setLocationMode] = useState(null);
  const [timeSlot, setTimeSlot] = useState("11:00 - 01:00");
  const [dropoffMethod, setDropoffMethod] = useState("driver");
  const [dropoffLocationMode, setDropoffLocationMode] = useState(null);
  const [dropoffTimeSlot, setDropoffTimeSlot] = useState(null);
  const [confirmedDocs, setConfirmedDocs] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const fileInputRef = useRef(null);
  const pendingUploadKey = useRef(null);

  function triggerUpload(key) {
    pendingUploadKey.current = key;
    fileInputRef.current?.click();
  }

  function handleFileSelected(event) {
    const file = event.target.files?.[0];
    const key = pendingUploadKey.current;
    if (file && key) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploads((prev) => ({
        ...prev,
        [key]: { uploaded: true, fileName: file.name, fileSize: `${sizeMB} MB` },
      }));
    }
    event.target.value = "";
  }

  function handleSubmit(event) {
    event.preventDefault();
    // No backend wired up yet — this is UI only.
  }

  const canSubmit = confirmedDocs && agreedTerms;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      <SectionCard icon={MapPin} title="1. Pickup Address" badge={`${MOCK_QUOTE.pickupCity.split(",")[0]}, ${MOCK_QUOTE.pickupPin}`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full Name" type="text" placeholder="e.g. Rahul Sharma" />
          <TextField label="Phone Number" type="tel" placeholder="+91 98765 43210" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField label="House / Plot / Flat No." type="text" placeholder="B-24, 2nd Floor" />
          <TextField label="Street / Area Name" type="text" placeholder="Connaught Place" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <TextField label="Landmark (Optional)" type="text" placeholder="Near Metro Pillar 12" />
          <TextField label="City" type="text" placeholder="New Delhi" />
          <TextField label="PIN Code" type="text" inputMode="numeric" placeholder="110001" />
        </div>
      </SectionCard>

      <SectionCard icon={Navigation} title="2. Destination Address" badge={`${MOCK_QUOTE.dropCity.split(",")[0]}, ${MOCK_QUOTE.dropPin}`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full Name" type="text" placeholder="Recipient Name" />
          <TextField label="Phone Number" type="tel" placeholder="+91 98765 43210" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField label="House / Plot / Flat No." type="text" placeholder="A-12, 5th Floor" />
          <TextField label="Street / Area Name" type="text" placeholder="Bandra West" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <TextField label="Landmark (Optional)" type="text" placeholder="Near Linking Road" />
          <TextField label="City" type="text" placeholder="Mumbai" />
          <TextField label="PIN Code" type="text" inputMode="numeric" placeholder="400001" />
        </div>
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="3. Vehicle Documents">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {DOCUMENT_TYPES.map(({ key, label, icon: Icon }) => {
            const state = uploads[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => triggerUpload(key)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
                  state.uploaded
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 bg-white hover:border-red-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${state.uploaded ? "text-green-600" : "text-slate-400"}`} strokeWidth={2} />
                <span className="text-xs font-bold text-[#0b1e42]">{label}</span>
                {state.uploaded ? (
                  <>
                    <span className="max-w-full truncate text-[10px] text-slate-500">
                      {state.fileName} &bull; {state.fileSize}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                      <CheckCircle2 className="h-3 w-3" />
                      Success
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-red-600 uppercase">+ Upload</span>
                )}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard icon={Calendar} title="4. Pickup Details">
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

        {pickupMethod === "driver" && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-[#0b1e42]">Add Location</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {LOCATION_MODES.map(({ key, label, icon: Icon }) => {
                const selected = locationMode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLocationMode(key)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      selected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
                    <span className="text-sm font-bold text-[#0b1e42]">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#0b1e42]">
            Select Date
            <span className="relative mt-2 block">
              <Calendar className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                defaultValue={MOCK_QUOTE.date}
                className="w-full rounded-xl bg-slate-50 py-3 pr-4 pl-11 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
              />
            </span>
          </label>

          <div>
            <p className="text-sm font-semibold text-[#0b1e42]">Time Slot</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const selected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                      selected
                        ? "bg-red-600 text-white"
                        : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Clock} title="5. Drop-off Details">
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

        {dropoffMethod === "driver" && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-[#0b1e42]">Add Location</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {LOCATION_MODES.map(({ key, label, icon: Icon }) => {
                const selected = dropoffLocationMode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDropoffLocationMode(key)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      selected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
                    <span className="text-sm font-bold text-[#0b1e42]">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#0b1e42]">
            Select Date
            <span className="relative mt-2 block">
              <Calendar className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Select Date"
                className="w-full rounded-xl bg-slate-50 py-3 pr-4 pl-11 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
              />
            </span>
          </label>

          <div>
            <p className="text-sm font-semibold text-[#0b1e42]">Time Slot</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const selected = dropoffTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setDropoffTimeSlot(slot)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                      selected
                        ? "bg-red-600 text-white"
                        : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col gap-3 px-1">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={confirmedDocs}
            onChange={(event) => setConfirmedDocs(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          I confirm that the vehicle details and documents provided are authentic and accurate as per my
          knowledge.
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(event) => setAgreedTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          I agree to CarCoolie&apos;s{" "}
          <a href="#" className="font-semibold text-red-600 hover:text-red-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold text-red-600 hover:text-red-700">
            Privacy Policy
          </a>
          .
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        Confirm &amp; Book Now
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
