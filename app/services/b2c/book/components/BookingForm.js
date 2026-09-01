"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { getCurrentPosition, reverseGeocode } from "../lib/geocode";
import { createBooking } from "../../lib/bookingStore";
import { formatINR } from "../../lib/pricing";
import DatePicker from "./DatePicker";
import MapPickerModal from "./MapPickerModal";

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

const TIME_SLOTS = ["09:00 - 11:00", "11:00 - 01:00", "01:00 - 03:00", "03:00 - 05:00"];

// Native date inputs use this as their `min` so past dates can't be picked.
const todayISO = new Date().toISOString().slice(0, 10);

// Adds `days` calendar days to an ISO (YYYY-MM-DD) date string — used to
// turn the route's minimum transit days into the drop-off date picker's
// `min` bound (see minDropoffISO below).
function addDaysISO(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// `new Date("YYYY-MM-DD")` parses as UTC midnight, which can display as the
// previous day in timezones behind UTC — parse the parts and construct in
// local time instead, same fix DatePicker.js and BookingSummary.js already
// use for the same reason.
function formatISOShort(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

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

// Shared "Add Location" block used under both Pickup and Drop-off Details —
// wires the real Geolocation API for "Current Location" and opens the
// Leaflet map picker for "Select on Map".
function AddLocationPicker({ captured, onUseCurrentLocation, onOpenMap, loading, error }) {
  // Whichever method actually produced the captured location gets the red
  // "selected" border — same treatment as the Pickup/Drop-off Method cards
  // above this section, since these two buttons are really just another
  // mutually-exclusive choice (which way was the location set).
  const currentSelected = captured?.source === "current";
  const mapSelected = captured?.source === "map";

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-[#0b1e42]">Add Location</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={loading}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors disabled:cursor-wait ${
            currentSelected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-red-600" />
          ) : (
            <LocateFixed className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
          )}
          <span className="text-sm font-bold text-[#0b1e42]">Current Location</span>
        </button>
        <button
          type="button"
          onClick={onOpenMap}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
            mapSelected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <Map className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
          <span className="text-sm font-bold text-[#0b1e42]">Select on Map</span>
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      {captured && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-green-600">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {captured.address}
        </p>
      )}
    </div>
  );
}

export default function BookingForm({ estimate, estimateLoaded, onSummaryChange }) {
  const router = useRouter();

  // Nothing is uploaded until the customer actually picks a file — the
  // upload card only turns green in response to a real handleFileSelected
  // call below, never pre-filled.
  const [uploads, setUploads] = useState({
    rc: { uploaded: false },
    license: { uploaded: false },
    pan: { uploaded: false },
    aadhaar: { uploaded: false },
    insurance: { uploaded: false },
  });

  const [pickupMethod, setPickupMethod] = useState("self");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickupGeoLoading, setPickupGeoLoading] = useState(false);
  const [pickupGeoError, setPickupGeoError] = useState("");
  const [pickupDate, setPickupDate] = useState(estimate?.date ?? "");
  const [timeSlot, setTimeSlot] = useState("11:00 - 01:00");

  const [dropoffMethod, setDropoffMethod] = useState("self");
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffGeoLoading, setDropoffGeoLoading] = useState(false);
  const [dropoffGeoError, setDropoffGeoError] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTimeSlot, setDropoffTimeSlot] = useState(null);

  // The route's minimum transit days (admin-set per direction in Route
  // Pricing — see routes.min_days) gates how soon a drop-off can be
  // scheduled after the chosen pickup date: minDays=3 and pickup=day 1
  // disables days 2-4, leaving day 5 onward selectable. Falls back to 1
  // (same as the DB column's default) if the estimate predates this field
  // or wasn't loaded from a real route.
  const minTransitDays = estimate?.minDays ?? 1;
  const minDropoffISO = pickupDate ? addDaysISO(pickupDate, minTransitDays + 1) : todayISO;

  // Adjusting state during render (not in an effect — see the same
  // pattern in EstimateModal.js) rather than setState-in-an-effect:
  // clears an already-picked drop-off date if changing the pickup date
  // pushes the minimum past it, so a stale, now-invalid date can't get
  // silently submitted.
  const [lastMinDropoffISO, setLastMinDropoffISO] = useState(minDropoffISO);
  if (minDropoffISO !== lastMinDropoffISO) {
    setLastMinDropoffISO(minDropoffISO);
    if (dropoffDate && dropoffDate < minDropoffISO) {
      setDropoffDate("");
    }
  }

  const [mapPickerTarget, setMapPickerTarget] = useState(null); // "pickup" | "dropoff" | null
  const [confirmedDocs, setConfirmedDocs] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const pendingUploadKey = useRef(null);

  // Bubbles the fields the booking summary sidebar displays up to the
  // shared parent, so it stays live as the customer fills in this form
  // instead of only reflecting the estimate from before this page loaded.
  useEffect(() => {
    onSummaryChange?.({ pickupMethod, dropoffMethod, date: pickupDate, timeSlot });
  }, [onSummaryChange, pickupMethod, dropoffMethod, pickupDate, timeSlot]);

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
        // `file` (the raw File object) travels through to createBooking so
        // it can actually be uploaded to Supabase Storage on submit — see
        // createBookingSupabase in bookingStore.js.
        [key]: { uploaded: true, fileName: file.name, fileSize: `${sizeMB} MB`, file },
      }));
    }
    event.target.value = "";
  }

  async function handleUseCurrentLocation(target) {
    const setLoading = target === "pickup" ? setPickupGeoLoading : setDropoffGeoLoading;
    const setError = target === "pickup" ? setPickupGeoError : setDropoffGeoError;
    const setLocation = target === "pickup" ? setPickupLocation : setDropoffLocation;

    setError("");
    setLoading(true);
    try {
      const { lat, lng } = await getCurrentPosition();
      const address = await reverseGeocode(lat, lng);
      setLocation({ address, lat, lng, source: "current" });
    } catch (err) {
      setError(
        err?.code === 1
          ? "Location permission denied — allow access or use Select on Map instead."
          : "Couldn't get your current location. Try Select on Map instead."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMapConfirm(location) {
    const tagged = { ...location, source: "map" };
    if (mapPickerTarget === "pickup") setPickupLocation(tagged);
    if (mapPickerTarget === "dropoff") setDropoffLocation(tagged);
    setMapPickerTarget(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);

    const booking = {
      estimate,
      pickup: {
        fullName: formData.get("pickup_fullName"),
        phone: formData.get("pickup_phone"),
        house: formData.get("pickup_house"),
        street: formData.get("pickup_street"),
        landmark: formData.get("pickup_landmark"),
        city: formData.get("pickup_city"),
        pin: formData.get("pickup_pin"),
        method: pickupMethod,
        capturedLocation: pickupLocation,
        date: formData.get("pickup_date"),
        timeSlot,
      },
      dropoff: {
        fullName: formData.get("dropoff_fullName"),
        phone: formData.get("dropoff_phone"),
        house: formData.get("dropoff_house"),
        street: formData.get("dropoff_street"),
        landmark: formData.get("dropoff_landmark"),
        city: formData.get("dropoff_city"),
        pin: formData.get("dropoff_pin"),
        method: dropoffMethod,
        capturedLocation: dropoffLocation,
        date: formData.get("dropoff_date"),
        timeSlot: dropoffTimeSlot,
      },
      documents: uploads,
    };

    try {
      const created = await createBooking(booking);
      router.push(`/my-bookings?id=${created.id}`);
    } catch (err) {
      console.error("Failed to create booking:", err);
      setSubmitting(false);
    }
  }

  const canSubmit = confirmedDocs && agreedTerms && !submitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      {estimateLoaded && !estimate && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
          No estimate found for this session — the price shown will be a placeholder. Start from{" "}
          <a href="/services/b2c" className="underline">
            Get an Estimate
          </a>{" "}
          first for a real quote.
        </div>
      )}
      {estimate && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4 text-sm">
          <span className="font-semibold text-[#0b1e42]">
            {estimate.fromCity} &rarr; {estimate.toCity} &bull; {estimate.vehicleType}
          </span>
          <span className="font-extrabold text-red-600">{formatINR(estimate.total)}</span>
        </div>
      )}

      <SectionCard
        icon={MapPin}
        title="1. Pickup Address"
        badge={estimate ? `${estimate.fromCity}${estimate.pickupPin ? `, ${estimate.pickupPin}` : ""}` : undefined}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full Name" name="pickup_fullName" type="text" placeholder="e.g. Rahul Sharma" />
          <TextField label="Phone Number" name="pickup_phone" type="tel" placeholder="+91 98765 43210" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField label="House / Plot / Flat No." name="pickup_house" type="text" placeholder="B-24, 2nd Floor" />
          <TextField label="Street / Area Name" name="pickup_street" type="text" placeholder="Connaught Place" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <TextField label="Landmark (Optional)" name="pickup_landmark" type="text" placeholder="Near Metro Pillar 12" />
          <TextField
            label="City"
            name="pickup_city"
            type="text"
            defaultValue={estimate?.fromCity ?? ""}
            placeholder="New Delhi"
          />
          <TextField
            label="PIN Code"
            name="pickup_pin"
            type="text"
            inputMode="numeric"
            defaultValue={estimate?.pickupPin ?? ""}
            placeholder="110001"
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Navigation}
        title="2. Destination Address"
        badge={estimate ? `${estimate.toCity}${estimate.destinationPin ? `, ${estimate.destinationPin}` : ""}` : undefined}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full Name" name="dropoff_fullName" type="text" placeholder="Recipient Name" />
          <TextField label="Phone Number" name="dropoff_phone" type="tel" placeholder="+91 98765 43210" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField label="House / Plot / Flat No." name="dropoff_house" type="text" placeholder="A-12, 5th Floor" />
          <TextField label="Street / Area Name" name="dropoff_street" type="text" placeholder="Bandra West" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <TextField label="Landmark (Optional)" name="dropoff_landmark" type="text" placeholder="Near Linking Road" />
          <TextField
            label="City"
            name="dropoff_city"
            type="text"
            defaultValue={estimate?.toCity ?? ""}
            placeholder="Mumbai"
          />
          <TextField
            label="PIN Code"
            name="dropoff_pin"
            type="text"
            inputMode="numeric"
            defaultValue={estimate?.destinationPin ?? ""}
            placeholder="400001"
          />
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
          <AddLocationPicker
            captured={pickupLocation}
            loading={pickupGeoLoading}
            error={pickupGeoError}
            onUseCurrentLocation={() => handleUseCurrentLocation("pickup")}
            onOpenMap={() => setMapPickerTarget("pickup")}
          />
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#0b1e42]">
            Select Date
            <span className="mt-2 block">
              <DatePicker name="pickup_date" value={pickupDate} onChange={setPickupDate} min={todayISO} />
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
          <AddLocationPicker
            captured={dropoffLocation}
            loading={dropoffGeoLoading}
            error={dropoffGeoError}
            onUseCurrentLocation={() => handleUseCurrentLocation("dropoff")}
            onOpenMap={() => setMapPickerTarget("dropoff")}
          />
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#0b1e42]">
            Select Date
            <span className="mt-2 block">
              <DatePicker name="dropoff_date" value={dropoffDate} onChange={setDropoffDate} min={minDropoffISO} />
            </span>
            <span className="mt-1.5 block text-xs font-normal text-slate-400">
              Minimum {minTransitDays} day{minTransitDays === 1 ? "" : "s"} transit
              {pickupDate ? ` — earliest ${formatISOShort(minDropoffISO)}` : ""}
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
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Booking&hellip;
          </>
        ) : (
          <>
            Confirm &amp; Book Now
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <MapPickerModal
        open={mapPickerTarget !== null}
        onClose={() => setMapPickerTarget(null)}
        onConfirm={handleMapConfirm}
      />
    </form>
  );
}
