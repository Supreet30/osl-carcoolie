"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck,
  FileSignature,
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
  Wind,
} from "lucide-react";
import { createBooking } from "../../lib/bookingStore";
import { formatINR } from "../../lib/pricing";
import DatePicker from "./DatePicker";
import MapPickerModal from "./MapPickerModal";

// Driving License is dropped from this list — `license` stays defined in
// the DB's document_type enum (Postgres can't drop an enum value once
// added), it's just never offered here anymore. `downloadUrl` (Customer
// Authority Letter only) points at a blank, fillable copy of the letter to
// print/sign/scan and re-upload — see public/documents/.
const DOCUMENT_TYPES = [
  { key: "puc", label: "PUC", icon: Wind },
  { key: "noc", label: "NOC", icon: FileCheck },
  { key: "rc", label: "RC Card", icon: FileText },
  { key: "aadhaar", label: "Aadhaar", icon: Fingerprint },
  { key: "insurance", label: "Insurance", icon: Shield },
  {
    key: "authority_letter",
    label: "Customer Authority Letter",
    icon: FileSignature,
    downloadUrl: "/documents/customer-authority-letter-format.pdf",
  },
  { key: "pan", label: "PAN Card", icon: IdCard },
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

// The labels drop AM/PM (they're always a daytime business-hours slot), so
// this is the only unambiguous place "01:00" means 1pm, not 1am — used to
// tell whether a given slot has already started/passed today.
const TIME_SLOT_START_HOUR = {
  "09:00 - 11:00": 9,
  "11:00 - 01:00": 11,
  "01:00 - 03:00": 13,
  "03:00 - 05:00": 15,
};

// Native date inputs use this as their `min` so past dates can't be picked.
const todayISO = new Date().toISOString().slice(0, 10);

// A slot only ever needs disabling for today's date — any later date has
// nothing "passed" about it yet. Hour-granularity comparison matches the
// slots themselves being on-the-hour boundaries.
function isTimeSlotPast(slot, dateISO) {
  if (dateISO !== todayISO) return false;
  return TIME_SLOT_START_HOUR[slot] <= new Date().getHours();
}

// No date picked yet at all means there's nothing to check a time slot
// against — every slot stays disabled until one is, rather than looking
// pickable and then turning out to depend on a date that isn't set.
function isTimeSlotDisabled(slot, dateISO) {
  if (!dateISO) return true;
  return isTimeSlotPast(slot, dateISO);
}

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

// Shared "Add Location" block used under both Pickup and Drop-off Details.
// Both buttons now just open the same MapPickerModal — "Current Location"
// opens it and immediately fires its own "Use current location" (see
// MapPickerModal's `autoLocate`), "Select on Map" opens it plain — rather
// than this component doing its own separate geolocation lookup. That
// lookup used to always go through the free OSM/Nominatim reverse geocode
// regardless of whether a Google Maps key was configured; routing it
// through the same modal means it gets MapPickerModal's already-correct
// "prefer Google's geocoding when available" behavior for free, instead of
// a second, less accurate implementation living here too.
function AddLocationPicker({ captured, onUseCurrentLocation, onOpenMap }) {
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
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
            currentSelected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <LocateFixed className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
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
      {captured && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-green-600">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {captured.address}
        </p>
      )}
    </div>
  );
}

// The choice itself normally happens in the "Get an Estimate" modal (see
// PICKUP_METHODS'/DROPOFF_METHODS' comment above) — `locked` shows a
// read-only readout of what was picked there. But someone can land on
// /book directly (no estimate carried over, or an older saved one from
// before this moved to the modal) with no method decided at all — `locked`
// is false then, and this falls back to the original selectable cards so
// there's always a way to actually choose, not a silently-defaulted value
// with no way to change it.
function MethodPicker({ label, method, options, locked, onChange }) {
  if (locked) {
    const option = options.find((o) => o.key === method) ?? options[0];
    const Icon = option.icon;
    return (
      <div>
        <p className="text-sm font-semibold text-[#0b1e42]">{label}</p>
        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-slate-50 py-3 pr-3 pl-4">
          <Icon className="h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
          <span className="flex-1 truncate text-sm font-semibold text-[#0b1e42]">{option.label}</span>
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-600 uppercase">
            From Estimate
          </span>
        </div>
        <p className="mt-1.5 text-xs font-normal text-slate-400">{option.subtitle}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[#0b1e42]">Choose {label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map(({ key, label: optionLabel, subtitle, icon: Icon }) => {
          const selected = method === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                selected ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
              <span>
                <span className="block text-sm font-bold text-[#0b1e42]">{optionLabel}</span>
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
  );
}

export default function BookingForm({ estimate, estimateLoaded, onSummaryChange }) {
  const router = useRouter();

  // Nothing is uploaded until the customer actually picks a file — the
  // upload card only turns green in response to a real handleFileSelected
  // call below, never pre-filled.
  const [uploads, setUploads] = useState({
    puc: { uploaded: false },
    noc: { uploaded: false },
    rc: { uploaded: false },
    aadhaar: { uploaded: false },
    insurance: { uploaded: false },
    authority_letter: { uploaded: false },
    pan: { uploaded: false },
  });

  // Chosen in the "Get an Estimate" modal now, not here — see
  // handleBookNow in EstimateModal.js. Defaults to "self" so a booking
  // reached without a saved estimate (the amber notice above) still works.
  const [pickupMethod, setPickupMethod] = useState(estimate?.pickupMethod ?? "self");
  const [pickupLocation, setPickupLocation] = useState(null);
  const [pickupDate, setPickupDate] = useState(estimate?.date ?? "");
  // No default slot pre-selected (matches dropoffTimeSlot below) — every
  // slot starts disabled until a date is actually picked, so nothing
  // should already look chosen before then either.
  const [timeSlot, setTimeSlot] = useState(null);

  const [dropoffMethod, setDropoffMethod] = useState(estimate?.dropoffMethod ?? "self");
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTimeSlot, setDropoffTimeSlot] = useState(null);

  // `estimate` loads from localStorage after mount (see BookingPageClient.js
  // — it's null on first render), so the useState defaults above miss it.
  // Adjusting state during render, same pattern as lastMinDropoffISO below:
  // once estimateLoaded flips true, pull the methods off whatever estimate
  // actually came back (still "self"/"self" if there wasn't one).
  const [lastEstimateLoaded, setLastEstimateLoaded] = useState(estimateLoaded);
  if (estimateLoaded !== lastEstimateLoaded) {
    setLastEstimateLoaded(estimateLoaded);
    if (estimateLoaded) {
      setPickupMethod(estimate?.pickupMethod ?? "self");
      setDropoffMethod(estimate?.dropoffMethod ?? "self");
    }
  }

  // Only actually locked (read-only, "From Estimate") once a loaded
  // estimate really carried a method over — landing on /book directly, or
  // from an older saved estimate that predates this field, leaves both
  // pickers open instead of silently defaulting to Self with no way to
  // change it.
  const pickupMethodLocked = estimateLoaded && Boolean(estimate?.pickupMethod);
  const dropoffMethodLocked = estimateLoaded && Boolean(estimate?.dropoffMethod);

  // If every one of today's time slots has already passed, today itself
  // isn't a bookable pickup date anymore — there's nothing left on it to
  // actually pick — so the earliest selectable day bumps to tomorrow
  // instead of leaving today clickable with an entirely disabled slot grid
  // waiting on the other side.
  const allTodaySlotsPast = TIME_SLOTS.every((slot) => TIME_SLOT_START_HOUR[slot] <= new Date().getHours());
  const earliestPickupISO = allTodaySlotsPast ? addDaysISO(todayISO, 1) : todayISO;

  // Same "adjusting state during render" idea as minDropoffISO below:
  // clears an already-picked pickup date of today if today's slots run out
  // from under it while the form is still open.
  const [lastEarliestPickupISO, setLastEarliestPickupISO] = useState(earliestPickupISO);
  if (earliestPickupISO !== lastEarliestPickupISO) {
    setLastEarliestPickupISO(earliestPickupISO);
    if (pickupDate && pickupDate < earliestPickupISO) {
      setPickupDate("");
    }
  }

  // The route's minimum transit days (admin-set per direction in Route
  // Pricing — see routes.min_days) gates how soon a drop-off can be
  // scheduled after the chosen pickup date: minDays=3 and pickup=day 1
  // disables days 2-4, leaving day 5 onward selectable. Falls back to 1
  // (same as the DB column's default) if the estimate predates this field
  // or wasn't loaded from a real route.
  const minTransitDays = estimate?.minDays ?? 1;
  const minDropoffISO = pickupDate ? addDaysISO(pickupDate, minTransitDays + 1) : earliestPickupISO;

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
  // Which button opened the modal — "current" auto-fires MapPickerModal's
  // own locate-me on open (see autoLocate below) and, once confirmed, tags
  // the result the same way a plain map pick would've been tagged before
  // this changed, so AddLocationPicker's own "which button was used"
  // highlighting above still works.
  const [mapPickerSource, setMapPickerSource] = useState("map");
  // "pickup" | "destination" | "custom" — the two "Same as ___" checkboxes
  // are mutually exclusive (checking one clears the other), and the custom
  // fields below only appear once neither is checked. Defaults to the
  // common case (billed at the pickup address).
  const [billingMode, setBillingMode] = useState("pickup");
  // A "Same as ___" checkbox only makes sense when that leg actually has an
  // address on file — Self methods don't collect one at all (see section
  // 1/2 above), so there's nothing to copy.
  const pickupAddressAvailable = pickupMethod === "driver";
  const dropoffAddressAvailable = dropoffMethod === "driver";
  // Neither source exists — the manual fields are the only option, so they
  // stop being optional.
  const billingCustomRequired = !pickupAddressAvailable && !dropoffAddressAvailable;

  // Adjusting state during render (same pattern as lastMinDropoffISO
  // below): if the leg billingMode currently points at just stopped
  // collecting an address (its method switched to Self), fall back to the
  // manual fields instead of silently staying on a source that's gone.
  if (billingMode === "pickup" && !pickupAddressAvailable) {
    setBillingMode("custom");
  } else if (billingMode === "destination" && !dropoffAddressAvailable) {
    setBillingMode("custom");
  }
  const [confirmedDocs, setConfirmedDocs] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Only flips true once a submit attempt actually finds a document
  // missing — the "Still required" banner stays hidden while the customer
  // is still filling the form out, not shown proactively the whole time.
  // Recomputed live below (not frozen at the moment of that failed
  // attempt), so it updates/clears itself as documents get uploaded
  // instead of needing another submit click to catch up.
  const [docsSubmitAttempted, setDocsSubmitAttempted] = useState(false);

  const fileInputRef = useRef(null);
  const pendingUploadKey = useRef(null);
  const documentsSectionRef = useRef(null);

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

  // Opens the map modal and has it fire its own locate-me immediately
  // (autoLocate below) instead of doing a separate geolocation lookup
  // here — see the comment on AddLocationPicker above for why.
  function handleUseCurrentLocation(target) {
    setMapPickerTarget(target);
    setMapPickerSource("current");
  }

  function handleOpenMap(target) {
    setMapPickerTarget(target);
    setMapPickerSource("map");
  }

  function handleMapConfirm(location) {
    const tagged = { ...location, source: mapPickerSource };
    if (mapPickerTarget === "pickup") setPickupLocation(tagged);
    if (mapPickerTarget === "dropoff") setDropoffLocation(tagged);
    setMapPickerTarget(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Checked here (on the actual submit attempt), not proactively the
    // whole time the form is open — see docsSubmitAttempted above.
    if (DOCUMENT_TYPES.some(({ key }) => !uploads[key]?.uploaded)) {
      setDocsSubmitAttempted(true);
      documentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);

    // Only styled uppercase via CSS above (textTransform) — the stored
    // value needs the same normalization, not just the on-screen look.
    const registrationNumber = (formData.get("registration_number") || "").toString().trim().toUpperCase() || null;

    const booking = {
      estimate,
      registrationNumber,
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
      // Copies the pickup/destination address straight over rather than
      // relying on (empty, hidden) billing_* fields when one of the "Same
      // as ___" checkboxes is on — keeps it true to what actually gets
      // billed even if the customer edits that address afterward.
      billing:
        billingMode === "pickup"
          ? {
              fullName: formData.get("pickup_fullName"),
              phone: formData.get("pickup_phone"),
              house: formData.get("pickup_house"),
              street: formData.get("pickup_street"),
              landmark: formData.get("pickup_landmark"),
              city: formData.get("pickup_city"),
              pin: formData.get("pickup_pin"),
            }
          : billingMode === "destination"
            ? {
                fullName: formData.get("dropoff_fullName"),
                phone: formData.get("dropoff_phone"),
                house: formData.get("dropoff_house"),
                street: formData.get("dropoff_street"),
                landmark: formData.get("dropoff_landmark"),
                city: formData.get("dropoff_city"),
                pin: formData.get("dropoff_pin"),
              }
            : {
                fullName: formData.get("billing_fullName"),
                phone: formData.get("billing_phone"),
                house: formData.get("billing_house"),
                street: formData.get("billing_street"),
                landmark: formData.get("billing_landmark"),
                city: formData.get("billing_city"),
                pin: formData.get("billing_pin"),
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

  // Every document in section 3 is mandatory — enforced in handleSubmit
  // rather than pre-disabling the button, so the "Still required" message
  // only shows up once the customer actually tries to submit with
  // something missing (and then tracks live as they fix it).
  const missingDocs = DOCUMENT_TYPES.filter(({ key }) => !uploads[key]?.uploaded);
  const showDocsError = docsSubmitAttempted && missingDocs.length > 0;
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
        {pickupMethod === "driver" ? (
          <>
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
          </>
        ) : (
          // Self Drop-off — the customer brings the car to our hub, so
          // there's no address for a driver to go find.
          <p className="mt-5 text-xs text-slate-400">No address needed — you&apos;ll drop the car off at our hub.</p>
        )}

        {/* Was its own "4. Pickup Details" section — folded in here since
            it's really more detail about this same pickup leg, not a
            separate concern. */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <MethodPicker
            label="Pickup Method"
            method={pickupMethod}
            options={PICKUP_METHODS}
            locked={pickupMethodLocked}
            onChange={setPickupMethod}
          />

          {pickupMethod === "driver" && (
            <AddLocationPicker
              captured={pickupLocation}
              onUseCurrentLocation={() => handleUseCurrentLocation("pickup")}
              onOpenMap={() => handleOpenMap("pickup")}
            />
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0b1e42]">
              Select Date
              <span className="mt-2 block">
                <DatePicker name="pickup_date" value={pickupDate} onChange={setPickupDate} min={earliestPickupISO} />
              </span>
            </label>

            <div>
              <p className="text-sm font-semibold text-[#0b1e42]">Time Slot</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const selected = timeSlot === slot;
                  const past = isTimeSlotDisabled(slot, pickupDate);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={past}
                      onClick={() => setTimeSlot(slot)}
                      title={past ? (pickupDate ? "This time slot has already passed today" : "Select a date first") : undefined}
                      className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                        selected
                          ? "bg-red-600 text-white"
                          : past
                            ? "cursor-not-allowed bg-slate-50 text-slate-300 ring-1 ring-slate-100"
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
        {dropoffMethod === "driver" ? (
          <>
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
          </>
        ) : (
          // Self Pickup — the customer collects the car from our hub, so
          // there's no address for a driver to deliver it to.
          <p className="mt-5 text-xs text-slate-400">No address needed — you&apos;ll collect the car from our hub.</p>
        )}

        {/* Was its own "5. Drop-off Details" section — folded in here for
            the same reason as Pickup Method above. */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <MethodPicker
            label="Drop-off Method"
            method={dropoffMethod}
            options={DROPOFF_METHODS}
            locked={dropoffMethodLocked}
            onChange={setDropoffMethod}
          />

          {dropoffMethod === "driver" && (
            <AddLocationPicker
              captured={dropoffLocation}
              onUseCurrentLocation={() => handleUseCurrentLocation("dropoff")}
              onOpenMap={() => handleOpenMap("dropoff")}
            />
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#0b1e42]">
              Select Date
              <span className="mt-2 block">
                <DatePicker
                  name="dropoff_date"
                  value={dropoffDate}
                  onChange={setDropoffDate}
                  min={minDropoffISO}
                  disabled={!pickupDate}
                />
              </span>
              <span className="mt-1.5 block text-xs font-normal text-slate-400">
                {pickupDate
                  ? `Minimum ${minTransitDays} day${minTransitDays === 1 ? "" : "s"} transit — earliest ${formatISOShort(minDropoffISO)}`
                  : "Select a pickup date first."}
              </span>
            </label>

            <div>
              <p className="text-sm font-semibold text-[#0b1e42]">Time Slot</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const selected = dropoffTimeSlot === slot;
                  const past = isTimeSlotDisabled(slot, dropoffDate);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={past}
                      onClick={() => setDropoffTimeSlot(slot)}
                      title={past ? (dropoffDate ? "This time slot has already passed today" : "Select a date first") : undefined}
                      className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                        selected
                          ? "bg-red-600 text-white"
                          : past
                            ? "cursor-not-allowed bg-slate-50 text-slate-300 ring-1 ring-slate-100"
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
        </div>
      </SectionCard>

      <div ref={documentsSectionRef}>
        <SectionCard icon={ShieldCheck} title="3. Vehicle Documents">
          <p className="-mt-2 mb-5 text-xs text-slate-400">
            All documents below are required — the booking can&apos;t be submitted until every one is uploaded.
          </p>

          <TextField
            label="Vehicle Registration Number"
            name="registration_number"
            type="text"
            placeholder="e.g. DL01AB1234"
            style={{ textTransform: "uppercase" }}
          />

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {DOCUMENT_TYPES.map(({ key, label, icon: Icon, downloadUrl }) => {
              const state = uploads[key];
              return (
                <div
                  key={key}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors ${
                    state.uploaded
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-white hover:border-red-200"
                  }`}
                >
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download
                      onClick={(event) => event.stopPropagation()}
                      aria-label="Download format"
                      className="group absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      <span className="pointer-events-none absolute right-0 -top-8 whitespace-nowrap rounded-md bg-[#0b1e42] px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        Download Format
                      </span>
                    </a>
                  )}
                  <button type="button" onClick={() => triggerUpload(key)} className="flex w-full flex-col items-center gap-2">
                    <Icon className={`h-5 w-5 ${state.uploaded ? "text-green-600" : "text-slate-400"}`} strokeWidth={2} />
                    <span className="text-xs font-bold text-[#0b1e42]">
                      {label} <span className="text-red-600">*</span>
                    </span>
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
                </div>
              );
            })}
          </div>

          {showDocsError && (
            <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Still required: {missingDocs.map((d) => d.label).join(", ")}
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard icon={CreditCard} title="4. Billing Address">
        <label
          className={`flex items-center gap-3 text-sm font-semibold ${
            pickupAddressAvailable ? "text-[#0b1e42]" : "cursor-not-allowed text-slate-300"
          }`}
        >
          <input
            type="checkbox"
            checked={billingMode === "pickup"}
            disabled={!pickupAddressAvailable}
            onChange={(event) => setBillingMode(event.target.checked ? "pickup" : "custom")}
            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-red-600 focus:ring-red-500 disabled:cursor-not-allowed"
          />
          Same as Pickup Address
        </label>
        {!pickupAddressAvailable && (
          <p className="mt-1 pl-7 text-xs text-slate-400">No pickup address was collected (Self Drop-off).</p>
        )}

        <label
          className={`mt-3 flex items-center gap-3 text-sm font-semibold ${
            dropoffAddressAvailable ? "text-[#0b1e42]" : "cursor-not-allowed text-slate-300"
          }`}
        >
          <input
            type="checkbox"
            checked={billingMode === "destination"}
            disabled={!dropoffAddressAvailable}
            onChange={(event) => setBillingMode(event.target.checked ? "destination" : "custom")}
            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-red-600 focus:ring-red-500 disabled:cursor-not-allowed"
          />
          Same as Destination Address
        </label>
        {!dropoffAddressAvailable && (
          <p className="mt-1 pl-7 text-xs text-slate-400">No destination address was collected (Self Pickup).</p>
        )}

        {billingMode === "custom" && (
          <div className="mt-5">
            {billingCustomRequired && (
              <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                No pickup or drop-off address was collected for this booking — a billing address is required below.
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Full Name"
                name="billing_fullName"
                type="text"
                placeholder="e.g. Rahul Sharma"
                required={billingCustomRequired}
              />
              <TextField
                label="Phone Number"
                name="billing_phone"
                type="tel"
                placeholder="+91 98765 43210"
                required={billingCustomRequired}
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                label="House / Plot / Flat No."
                name="billing_house"
                type="text"
                placeholder="B-24, 2nd Floor"
                required={billingCustomRequired}
              />
              <TextField
                label="Street / Area Name"
                name="billing_street"
                type="text"
                placeholder="Connaught Place"
                required={billingCustomRequired}
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <TextField label="Landmark (Optional)" name="billing_landmark" type="text" placeholder="Near Metro Pillar 12" />
              <TextField
                label="City"
                name="billing_city"
                type="text"
                placeholder="New Delhi"
                required={billingCustomRequired}
              />
              <TextField
                label="PIN Code"
                name="billing_pin"
                type="text"
                inputMode="numeric"
                placeholder="110001"
                required={billingCustomRequired}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <div className="flex flex-col gap-3 px-1">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={confirmedDocs}
            onChange={(event) => setConfirmedDocs(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-red-600 focus:ring-red-500"
          />
          I confirm that the vehicle details and documents provided are authentic and accurate as per my
          knowledge.
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(event) => setAgreedTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-red-600 focus:ring-red-500"
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
        autoLocate={mapPickerSource === "current"}
        onClose={() => setMapPickerTarget(null)}
        onConfirm={handleMapConfirm}
      />
    </form>
  );
}
