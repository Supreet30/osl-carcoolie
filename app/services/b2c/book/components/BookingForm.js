"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  FileCheck,
  FileSignature,
  FileText,
  Fingerprint,
  IdCard,
  Info,
  Loader2,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Shield,
  ShieldCheck,
  User,
  Wind,
  XCircle,
} from "lucide-react";
import {
  clearLocalFormDraft,
  clearSavedEstimate,
  createBooking,
  saveFormDraft,
  saveLocalFormDraft,
} from "../../lib/bookingStore";
import { driverLegCharge, formatINR, getDocumentFormats, getDocumentTypes, getYardsForCity } from "../../lib/pricing";
import DatePicker from "./DatePicker";
import Dropdown from "../../components/Dropdown";
import MapPickerModal from "./MapPickerModal";
import { locateCurrentPosition } from "../lib/geocode";
import { clearDocuments, getAllDocuments, removeDocument, saveDocument } from "../lib/documentDraftStore";
import { fetchDrivingDistanceKm } from "../lib/distance";

// Grouped for display — each card still keys/uploads/validates the same
// way regardless of which of the three category sections it renders under.
const DOCUMENT_CATEGORIES = [
  { key: "vehicle", label: "Vehicle Documents" },
  { key: "kyc", label: "KYC" },
  { key: "legal", label: "Legal Documents" },
];

// The actual list of document types (which ones, labels, required flag,
// icon, tooltip description) is admin-editable — see document_types in
// supabase-schema.sql and getDocumentTypes() in pricing.js, fetched into
// `documentTypes` state below. This is just the string-icon-name ->
// component lookup for rendering whatever the admin's list says; a name
// the admin picks that isn't in here (shouldn't happen — the admin page
// only offers these same names) falls back to a generic document icon.
const ICON_MAP = { FileText, Wind, Shield, Fingerprint, IdCard, FileCheck, FileSignature };
function resolveDocIcon(name) {
  return ICON_MAP[name] ?? FileText;
}

const PICKUP_METHODS = [
  { key: "self", label: "Self Drop-off", subtitle: "Drop the car at our hub", icon: MapPin },
  { key: "driver", label: "CarCoolie Driver Pickup", subtitle: "Professional driver collects car", icon: User },
];

const DROPOFF_METHODS = [
  { key: "self", label: "Self Pickup", subtitle: "Collect the car from our hub", icon: MapPin },
  { key: "driver", label: "CarCoolie Driver Drop-off", subtitle: "Driver delivers car to your location", icon: User },
];

const TIME_SLOTS = ["09:00 - 11:00", "11:00 - 01:00", "01:00 - 03:00", "03:00 - 05:00"];

// Applied per document on upload (see handleFileSelected below) — a file
// over this is rejected client-side before it ever touches Storage/draft
// state, rather than failing later at submit time.
const MAX_DOCUMENT_SIZE_MB = 2;
const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

// Indian mobile numbers: 10 digits, first digit 6-9.
const PHONE_PATTERN = "[6-9][0-9]{9}";
const PHONE_TITLE = "Enter a valid 10-digit mobile number";
const PIN_PATTERN = "[0-9]{6}";
const PIN_TITLE = "Enter a 6-digit PIN code";

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

// Adds `days` calendar days to an ISO (YYYY-MM-DD) date string — used both
// for the pickup date picker's earliest-selectable bound and for computing
// the expected delivery date from the route's minimum transit days.
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

// One upload card inside the "3. Vehicle Documents" section — same tooltip/
// download/upload behavior for every document, just rendered per category
// group instead of one flat grid.
function DocumentCard({ doc, state, onUpload, onRemove, downloadUrl, error }) {
  const { key, label, icon: Icon, description, required } = doc;
  return (
    <div className="flex flex-col gap-1.5">
    <div
      className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 transition-colors ${
        error ? "border-red-300 bg-red-50" : state.uploaded ? "border-green-200 bg-green-50" : "border-slate-200 bg-white hover:border-red-200"
      }`}
    >
      <button type="button" onClick={() => onUpload(key)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
        <Icon className={`h-5 w-5 shrink-0 ${state.uploaded ? "text-green-600" : "text-slate-400"}`} strokeWidth={2} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-[#0b1e42]">
            {label} {required && <span className="text-red-600">*</span>}
          </span>
          {state.uploaded ? (
            <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="max-w-full truncate text-xs text-slate-500">
                {state.fileName} &bull; {state.fileSize}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                <CheckCircle2 className="h-3 w-3" />
                Success
              </span>
            </span>
          ) : (
            <span className="mt-0.5 block text-[10px] font-bold text-red-600 uppercase">+ Upload</span>
          )}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-3">
        {state.uploaded && (
          <button
            type="button"
            onClick={() => onRemove(key)}
            aria-label={`Remove ${label}`}
            title={`Remove ${label}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <XCircle className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            Download Format
          </a>
        )}
        {description && (
          <span
            tabIndex={0}
            aria-label={description}
            className="group relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0b1e42] focus:bg-slate-100 focus:text-[#0b1e42] focus:outline-none"
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="pointer-events-none absolute top-full right-0 z-10 mt-2 w-44 rounded-md bg-[#0b1e42] px-2.5 py-1.5 text-left text-[10px] leading-snug font-semibold whitespace-normal text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
              {description}
            </span>
          </span>
        )}
      </div>
    </div>
    {error && <p className="px-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function TextField({ label, error, required, ...props }) {
  return (
    <label className="block text-sm font-semibold text-[#0b1e42]">
      {label} {required && <span className="text-red-600">*</span>}
      <input
        {...props}
        required={required}
        aria-invalid={error ? "true" : undefined}
        className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 read-only:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-500 focus:ring-2 focus:ring-red-500 ${
          error ? "bg-red-50 ring-2 ring-red-400" : "bg-slate-50"
        }`}
      />
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

// Shared "Add Location" block used under both Pickup and Drop-off Details.
// The two options are deliberately NOT the same path anymore: "Use Current
// Location" calls locateCurrentPosition() directly and uses whatever comes
// back as-is — no map ever shown, nothing to then drag/click to a
// different spot. "Select on Map" is the only way to manually pick/adjust
// a location, via MapPickerModal.
function AddLocationPicker({ captured, onUseCurrentLocation, onOpenMap, locating, error }) {
  const CURRENT = "Use Current Location";
  const MAP = "Select on Map";
  const value = captured?.source === "current" ? CURRENT : captured?.source === "map" ? MAP : undefined;

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-[#0b1e42]">Add Location</p>
      <Dropdown
        placeholder={locating ? "Fetching your location…" : "Choose how to add your location"}
        value={value}
        onChange={(option) => (option === CURRENT ? onUseCurrentLocation() : onOpenMap())}
        options={[CURRENT, MAP]}
        optionIcons={{ [CURRENT]: LocateFixed, [MAP]: Map }}
        disabled={locating}
      />
      {locating && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching your current location&hellip;
        </p>
      )}
      {!locating && error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      {!locating && !error && captured && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-green-600">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {captured.address}
        </p>
      )}
    </div>
  );
}

// Shown under both Pickup and Drop-off Method — self mode still needs this
// (it's where the customer goes to drop off/collect the car), driver mode
// shows it too as the reference point for the 50km question below it.
// `withinHub` is null until the customer picks an answer, so the warning
// only ever appears after an explicit "No" — never on load.
// `yards` are this city's configured hubs (see getYardsForCity in
// pricing.js) — empty until they load, or when the city has none yet.
function HubLocationCard({ city, showDistance, distanceState, yards, yard, onYardChange }) {
  const selected = yards.find((y) => y.name === yard?.name) ?? yards[0] ?? null;

  if (!selected) {
    return (
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">
          {city ? `No yard is set up in ${city} yet` : "Choose a city to see its yard"} — we&apos;ll confirm the exact
          drop point with you once your booking is in.
        </p>
      </div>
    );
  }

  const mapsUrl =
    selected.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name} ${selected.address}`)}`;

  return (
    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold text-[#0b1e42]">Select yard ({yards.length} available)</p>
        <Dropdown
          raised
          placeholder="Select a yard"
          value={selected.name}
          onChange={(picked) => onYardChange(yards.find((y) => y.name === picked) ?? yards[0])}
          options={yards.map((y) => y.name)}
          optionIcons={Object.fromEntries(yards.map((y) => [y.name, Building2]))}
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#0b1e42]">
            <Building2 className="h-4 w-4 shrink-0 text-red-500" strokeWidth={2} />
            {selected.name}
          </p>
          <p className="mt-1 pl-6 text-xs text-slate-500">{selected.address}</p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-red-50"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          View on Map
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      </div>

      {/* Replaces a self-declared "within 50km?" Yes/No question — the real
          driving distance is calculated automatically (see
          fetchDrivingDistanceKm in ../lib/distance.js) the moment both a
          captured pickup/drop-off location and this yard are known, and the
          slab charge (driverLegCharge in ../../lib/pricing.js) follows
          directly from that instead of being asked at all. */}
      {showDistance && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          {distanceState.loading ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calculating distance from this hub&hellip;
            </p>
          ) : distanceState.distanceKm != null ? (
            distanceState.distanceKm <= 50 ? (
              // The ₹1,000 base charge is already baked into the total
              // shown back in the estimate — nothing extra to call out here,
              // just confirm the location qualifies for it.
              <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Your location is {distanceState.distanceKm.toFixed(1)} km from the selected hub/yard.
              </p>
            ) : (
              <>
                <p className="text-xs font-semibold text-[#0b1e42]">
                  Your location is <span className="font-extrabold">{distanceState.distanceKm.toFixed(1)} km</span>{" "}
                  from the selected hub/yard.
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {/* Only the delta beyond the ₹1,000 baseline already
                      included in the estimate total — not the full
                      driverLegCharge figure, which would double-count it. */}
                  Additional CarCoolie pickup/drop-off charge:{" "}
                  <span className="font-bold text-[#0b1e42]">{formatINR(distanceState.charge - 1000)}</span> (₹100 per
                  10km beyond 50km)
                </p>
              </>
            )
          ) : (
            <p className="flex items-start gap-1.5 text-xs font-semibold text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              We couldn&apos;t calculate the exact distance to this hub yet — a flat {formatINR(1000)} pickup/drop-off
              charge applies for now.
            </p>
          )}
        </div>
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

export default function BookingForm({ estimate, estimateLoaded, draftId, initialFormValues, onSummaryChange }) {
  const router = useRouter();

  // Nothing is uploaded until the customer actually picks a file — the
  // upload card only turns green in response to a real handleFileSelected
  // call below, never pre-filled. Restored below from IndexedDB (see
  // app/services/b2c/book/lib/documentDraftStore.js) once `draftId` is
  // known, for whatever was already picked earlier in this same booking
  // attempt (e.g. before clicking Back to edit the estimate and returning).
  const [uploads, setUploads] = useState({
    puc: { uploaded: false },
    noc: { uploaded: false },
    rc: { uploaded: false },
    aadhaar: { uploaded: false },
    insurance: { uploaded: false },
    authority_letter: { uploaded: false },
    pan: { uploaded: false },
  });

  // Per-document "file too large" message (see MAX_DOCUMENT_SIZE_BYTES),
  // keyed by doc key — separate from `uploads` since a rejected file never
  // actually gets stored there.
  const [uploadErrors, setUploadErrors] = useState({});

  // At most one entry at a time — validateAndFocusFirstError (below) stops
  // at the first problem it finds, so this only ever holds that one field's
  // message, shown inline next to it and cleared as soon as the form or
  // that specific control changes.
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!draftId) return;
    let cancelled = false;
    getAllDocuments(draftId).then((restored) => {
      if (cancelled || Object.keys(restored).length === 0) return;
      setUploads((prev) => {
        const next = { ...prev };
        for (const [key, doc] of Object.entries(restored)) {
          next[key] = {
            uploaded: true,
            fileName: doc.fileName,
            fileSize: `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`,
            file: doc.file,
          };
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [draftId]);

  // Admin-uploaded "Download Format" links, keyed by doc_type — see
  // getDocumentFormats() in pricing.js. Empty until the fetch resolves, so
  // a card with no admin-uploaded format (or before this table exists)
  // just never shows a download link, same as always.
  const [documentFormats, setDocumentFormats] = useState({});

  // Which document types to actually render in section 3 — admin-editable,
  // see getDocumentTypes() in pricing.js. Starts empty (not the offline
  // fallback) so the section doesn't flash the fallback list then swap to
  // the real one a moment later; getDocumentTypes() itself falls back only
  // when Supabase genuinely isn't configured.
  const [documentTypes, setDocumentTypes] = useState([]);

  // Each leg's yards come from its own city: pickup from the estimate's
  // origin, drop-off from its destination. The first yard is pre-selected
  // once the list lands, so the form always has a concrete hub to submit.
  const pickupCity = estimate?.fromCity ?? null;
  const dropoffCity = estimate?.toCity ?? null;
  useEffect(() => {
    let cancelled = false;
    getYardsForCity(pickupCity).then((list) => {
      if (cancelled) return;
      setPickupYards(list);
      // Restores the previously-picked yard by name once its list loads
      // (the yard object itself can't be stashed directly — see
      // initialFormValues below), falling back to the first yard same as
      // before this existed.
      setPickupYard(list.find((y) => y.name === initialFormValues?.pickupYardName) ?? list[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [pickupCity, initialFormValues]);

  useEffect(() => {
    let cancelled = false;
    getYardsForCity(dropoffCity).then((list) => {
      if (cancelled) return;
      setDropoffYards(list);
      setDropoffYard(list.find((y) => y.name === initialFormValues?.dropoffYardName) ?? list[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [dropoffCity, initialFormValues]);

  useEffect(() => {
    let cancelled = false;
    getDocumentFormats().then((formats) => {
      if (!cancelled) setDocumentFormats(formats);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDocumentTypes().then((types) => {
      if (!cancelled) setDocumentTypes(types);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Chosen in the "Get an Estimate" modal now, not here — see
  // handleBookNow in EstimateModal.js. Defaults to "self" so a booking
  // reached without a saved estimate (the amber notice above) still works.
  // The estimate's own method always wins over initialFormValues (a resumed
  // "form" stage draft's in-progress values — see saveFormDraft below and
  // BookingPageClient.js), not the other way around: pickupMethodLocked
  // below already treats the estimate as authoritative once it has a
  // method, and a draft saved from an earlier attempt with a different
  // method (e.g. clicking Back on the estimate and picking a different one
  // the second time, both sharing the same draftId while it's still fresh —
  // see getEstimateDraftId in bookingStore.js) must never override the
  // current estimate's actual choice. initialFormValues is only a fallback
  // for an estimate that predates this field entirely.
  const [pickupMethod, setPickupMethod] = useState(estimate?.pickupMethod ?? initialFormValues?.pickupMethod ?? "self");
  const [pickupLocation, setPickupLocation] = useState(initialFormValues?.pickupLocation ?? null);
  const [pickupDate, setPickupDate] = useState(initialFormValues?.pickupDate ?? estimate?.date ?? "");
  // No default slot pre-selected — every slot starts disabled until a date
  // is actually picked, so nothing should already look chosen before then.
  const [timeSlot, setTimeSlot] = useState(initialFormValues?.timeSlot ?? null);
  // Real driving distance from the captured pickup location to the
  // selected yard, and the slab charge it implies (driverLegCharge in
  // ../../lib/pricing.js) — replaces a self-declared "within 50km?"
  // Yes/No question entirely; see the effect below and HubLocationCard.
  const [pickupDistance, setPickupDistance] = useState({ loading: false, distanceKm: null, charge: 1000 });
  const [pickupYards, setPickupYards] = useState([]);
  const [pickupYard, setPickupYard] = useState(null);

  // Same estimate-wins priority as pickupMethod above.
  const [dropoffMethod, setDropoffMethod] = useState(estimate?.dropoffMethod ?? initialFormValues?.dropoffMethod ?? "self");
  const [dropoffLocation, setDropoffLocation] = useState(initialFormValues?.dropoffLocation ?? null);
  const [dropoffDistance, setDropoffDistance] = useState({ loading: false, distanceKm: null, charge: 1000 });
  const [dropoffYards, setDropoffYards] = useState([]);
  const [dropoffYard, setDropoffYard] = useState(null);

  // Recomputes the pickup distance/charge whenever the captured location,
  // the selected yard, or the method itself changes — the only three things
  // it actually depends on. A yard with no resolved coordinates yet (see
  // lib/yardCoordinates.js in carcoolie-admin) just can't produce a
  // distance; the flat ₹1,000 default stands in until it's fixed.
  useEffect(() => {
    if (pickupMethod !== "driver" || !pickupLocation || !pickupYard?.latitude || !pickupYard?.longitude) {
      setPickupDistance({ loading: false, distanceKm: null, charge: 1000 });
      return undefined;
    }
    let cancelled = false;
    setPickupDistance((prev) => ({ ...prev, loading: true }));
    fetchDrivingDistanceKm(pickupLocation, { lat: pickupYard.latitude, lng: pickupYard.longitude }).then((km) => {
      if (cancelled) return;
      setPickupDistance({ loading: false, distanceKm: km, charge: driverLegCharge(km) });
    });
    return () => {
      cancelled = true;
    };
  }, [pickupMethod, pickupLocation, pickupYard]);

  useEffect(() => {
    if (dropoffMethod !== "driver" || !dropoffLocation || !dropoffYard?.latitude || !dropoffYard?.longitude) {
      setDropoffDistance({ loading: false, distanceKm: null, charge: 1000 });
      return undefined;
    }
    let cancelled = false;
    setDropoffDistance((prev) => ({ ...prev, loading: true }));
    fetchDrivingDistanceKm(dropoffLocation, { lat: dropoffYard.latitude, lng: dropoffYard.longitude }).then((km) => {
      if (cancelled) return;
      setDropoffDistance({ loading: false, distanceKm: km, charge: driverLegCharge(km) });
    });
    return () => {
      cancelled = true;
    };
  }, [dropoffMethod, dropoffLocation, dropoffYard]);

  // `estimate` loads from localStorage after mount (see BookingPageClient.js
  // — it's null on first render), so the useState defaults above miss it.
  // Adjusting state during render, same pattern as lastEarliestPickupISO
  // below: once estimateLoaded flips true, pull the methods off whatever
  // estimate actually came back (still "self"/"self" if there wasn't one).
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

  // Adjusting state during render — clears an already-picked pickup date of
  // today if today's slots run out from under it while the form is still
  // open.
  const [lastEarliestPickupISO, setLastEarliestPickupISO] = useState(earliestPickupISO);
  if (earliestPickupISO !== lastEarliestPickupISO) {
    setLastEarliestPickupISO(earliestPickupISO);
    if (pickupDate && pickupDate < earliestPickupISO) {
      setPickupDate("");
    }
  }

  // The route's minimum transit days (admin-set per direction in Route
  // Pricing — see routes.min_days) — falls back to 1 (same as the DB
  // column's default) if the estimate predates this field or wasn't loaded
  // from a real route. Drives the expected delivery date below rather than
  // gating a drop-off date picker — the customer no longer picks their own
  // drop-off date/slot, it's just pickup date + this many days.
  //
  // On top of that base figure, a standing buffer per the Market Freight
  // Table revision: +1 day across the board ("Standard Delivery"), +1 more
  // if CarCoolie's own driver handles the pickup leg, and +1 more again if
  // CarCoolie's own driver handles the drop-off leg — so a booking with
  // both legs on CarCoolie drivers quotes 3 days later than the route's raw
  // min_days, while a fully self pickup/drop booking only picks up the +1
  // standard buffer.
  const minTransitDays =
    (estimate?.minDays ?? 1) + 1 + (pickupMethod === "driver" ? 1 : 0) + (dropoffMethod === "driver" ? 1 : 0);
  const expectedDeliveryISO = pickupDate ? addDaysISO(pickupDate, minTransitDays) : null;

  const [mapPickerTarget, setMapPickerTarget] = useState(null); // "pickup" | "dropoff" | null
  // "Use Current Location" never opens this modal (see handleUseCurrentLocation
  // below) — it's only ever reached via "Select on Map", so every confirm
  // out of it is tagged source: "map".
  const [locating, setLocating] = useState({ pickup: false, dropoff: false });
  const [locateError, setLocateError] = useState({ pickup: "", dropoff: "" });
  // "pickup" | "destination" | "custom" — the two "Same as ___" checkboxes
  // are mutually exclusive (checking one clears the other), and the custom
  // fields below only appear once neither is checked. Defaults to the
  // common case (billed at the pickup address).
  const [billingMode, setBillingMode] = useState(initialFormValues?.billingMode ?? "pickup");
  // A "Same as ___" checkbox only makes sense when that leg actually has an
  // address on file — Self methods don't collect one at all (see section
  // 1/2 above), so there's nothing to copy.
  const pickupAddressAvailable = pickupMethod === "driver";
  const dropoffAddressAvailable = dropoffMethod === "driver";

  // GSTIN field stays name="billing_gstin" (read via FormData on submit,
  // like every other field in this form) but is also mirrored into state
  // here purely to drive the "Verifying… -> Company Name" lookup below —
  // the two don't conflict since FormData reads the input's live DOM value
  // regardless of whether it's also controlled.
  const [gstin, setGstin] = useState(initialFormValues?.billing_gstin ?? "");
  // "idle" | "checking" | "verified" | "not_found" | "error"
  const [gstStatus, setGstStatus] = useState("idle");
  const [gstCompanyName, setGstCompanyName] = useState(null);
  const GSTIN_RE = /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/;

  // Manual now — hits the real verify-gst API only when the customer
  // clicks Verify, not on every keystroke. Editing the field after a
  // result (see the input's onChange below) resets status back to "idle"
  // so a stale "verified"/"not found" badge never lingers over a GSTIN
  // that's since changed.
  async function handleVerifyGstin() {
    if (!GSTIN_RE.test(gstin)) return;
    setGstStatus("checking");
    setGstCompanyName(null);
    try {
      const res = await fetch(`/api/verify-gst?gstin=${encodeURIComponent(gstin)}`);
      const data = await res.json();
      if (data.flag && data.tradeName) {
        setGstStatus("verified");
        setGstCompanyName(data.tradeName);
      } else {
        setGstStatus("not_found");
      }
    } catch {
      setGstStatus("error");
    }
  }
  // Neither source exists — the manual fields are the only option, so they
  // stop being optional.
  const billingCustomRequired = !pickupAddressAvailable && !dropoffAddressAvailable;

  // Adjusting state during render (same pattern as lastEarliestPickupISO
  // above): if the leg billingMode currently points at just stopped
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
  const [submitError, setSubmitError] = useState("");
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
  const formRef = useRef(null);
  const formDraftTimerRef = useRef(null);
  // Pickup date and time slot aren't real form fields (DatePicker only
  // exposes a hidden input, and the time slot buttons have no input at
  // all), so they can't be picked up by formRef.current.elements like
  // everything else validateAndFocusFirstError checks — these two refs are
  // what it scrolls to for those instead.
  const pickupDateRef = useRef(null);
  const timeSlotRef = useRef(null);

  // Bubbles the fields the booking summary sidebar displays up to the
  // shared parent, so it stays live as the customer fills in this form
  // instead of only reflecting the estimate from before this page loaded.
  // pickupCharge/dropoffCharge are 0 for a self leg, the flat ₹1,000
  // default while a driver leg's distance isn't known yet, or the real
  // slab-priced figure once it is — BookingSummary.js uses these to show an
  // adjusted total that accounts for the real distance surcharge.
  useEffect(() => {
    onSummaryChange?.({
      pickupMethod,
      dropoffMethod,
      date: pickupDate,
      timeSlot,
      pickupCharge: pickupMethod === "driver" ? pickupDistance.charge : 0,
      dropoffCharge: dropoffMethod === "driver" ? dropoffDistance.charge : 0,
    });
  }, [onSummaryChange, pickupMethod, dropoffMethod, pickupDate, timeSlot, pickupDistance, dropoffDistance]);

  // Form-stage draft autosave — see saveFormDraft in bookingStore.js. Most
  // of this form's fields are uncontrolled (plain name="..." inputs read
  // via FormData on real submit, not per-keystroke state), so rather than
  // convert ~30 fields to controlled state, this snapshots the live DOM via
  // `new FormData(formRef.current)` instead. Debounced (700ms after the
  // last change) and fire-and-forget, same reasoning as EstimateModal's
  // quote-draft autosave. File inputs are skipped — File objects can't be
  // JSON-serialized, so a resumed draft re-asks for documents, same as
  // today if an estimate existed but nothing had been uploaded yet.
  function scheduleFormDraftSave() {
    if (!estimate) return;
    clearTimeout(formDraftTimerRef.current);
    formDraftTimerRef.current = setTimeout(() => {
      if (!formRef.current) return;
      const values = {};
      for (const [key, value] of new FormData(formRef.current).entries()) {
        if (value instanceof File) continue;
        values[key] = value;
      }
      // Plus the handful of real-React-state fields that never show up in
      // FormData at all — radios/checkboxes without a `name` (billingMode),
      // custom button/dropdown pickers (methods, date, time slot, captured
      // map/GPS locations, selected yard). Distance/charge aren't stashed
      // here — they're recomputed automatically from pickupLocation/
      // pickupYard the moment this draft is resumed, not worth persisting
      // stale.
      const snapshot = {
        ...values,
        pickupMethod,
        dropoffMethod,
        pickupDate,
        timeSlot,
        billingMode,
        pickupYardName: pickupYard?.name ?? null,
        dropoffYardName: dropoffYard?.name ?? null,
        pickupLocation,
        dropoffLocation,
      };
      // Supabase-backed (signed-in customers only — upsertSavedEstimateRow
      // silently no-ops for guests) for cross-device "Continue Booking".
      saveFormDraft(estimate, snapshot);
      // localStorage-backed, works for every customer including guests —
      // what actually makes typed fields survive a Back-to-estimate round
      // trip, read back as initialFormValues by BookingPageClient.js.
      if (draftId) saveLocalFormDraft(draftId, snapshot);
    }, 700);
  }

  // Covers the non-FormData state fields above — set via buttons/custom
  // pickers rather than native inputs, so they never bubble a native
  // 'change' event up to the <form>'s onChange below.
  useEffect(() => {
    scheduleFormDraftSave();
    return () => clearTimeout(formDraftTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scheduleFormDraftSave reads other state (uploads, gstin, FormData) that intentionally isn't tracked here; this effect exists only to catch the non-FormData fields listed below.
  }, [
    estimate,
    pickupMethod,
    dropoffMethod,
    pickupDate,
    timeSlot,
    billingMode,
    pickupYard,
    dropoffYard,
    pickupLocation,
    dropoffLocation,
  ]);

  function triggerUpload(key) {
    pendingUploadKey.current = key;
    fileInputRef.current?.click();
  }

  // Clears an uploaded document back to its empty state so the customer can
  // pick a different file — the card's own "+ Upload" trigger already lets
  // them replace a file directly, this is just for removing one outright.
  function handleRemoveUpload(key) {
    setUploads((prev) => ({ ...prev, [key]: { uploaded: false } }));
    setUploadErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (draftId) removeDocument(draftId, key);
  }

  function handleFileSelected(event) {
    const file = event.target.files?.[0];
    const key = pendingUploadKey.current;
    if (file && key) {
      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setUploadErrors((prev) => ({
          ...prev,
          [key]: `This file is ${sizeMB}MB — each document must be ${MAX_DOCUMENT_SIZE_MB}MB or smaller.`,
        }));
        event.target.value = "";
        return;
      }
      setUploadErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploads((prev) => ({
        ...prev,
        // `file` (the raw File object) travels through to createBooking so
        // it can actually be uploaded to Supabase Storage on submit — see
        // createBookingSupabase in bookingStore.js.
        [key]: { uploaded: true, fileName: file.name, fileSize: `${sizeMB} MB`, file },
      }));
      // Fire-and-forget — see documentDraftStore.js. Lets this file survive
      // a Back-to-estimate-and-return round trip without re-asking for it.
      if (draftId) saveDocument(draftId, key, file);
    }
    event.target.value = "";
  }

  // Fetches GPS + reverse-geocodes it directly — no map shown, nothing to
  // then drag/click to a different spot. That's deliberate: "Use Current
  // Location" should just be the device's actual location, full stop;
  // "Select on Map" below is the only path that lets the customer pick a
  // different one.
  async function handleUseCurrentLocation(target) {
    setLocateError((e) => ({ ...e, [target]: "" }));
    setLocating((l) => ({ ...l, [target]: true }));
    try {
      const location = await locateCurrentPosition();
      const tagged = { ...location, source: "current" };
      if (target === "pickup") setPickupLocation(tagged);
      else setDropoffLocation(tagged);
    } catch (err) {
      setLocateError((e) => ({
        ...e,
        [target]:
          err?.code === 1
            ? "Location permission denied — allow access, or use Select on Map instead."
            : "Couldn't get your current location — use Select on Map instead.",
      }));
    } finally {
      setLocating((l) => ({ ...l, [target]: false }));
    }
  }

  function handleOpenMap(target) {
    setMapPickerTarget(target);
  }

  function handleMapConfirm(location) {
    const tagged = { ...location, source: "map" };
    if (mapPickerTarget === "pickup") setPickupLocation(tagged);
    if (mapPickerTarget === "dropoff") setDropoffLocation(tagged);
    setMapPickerTarget(null);
  }

  function clearFieldError(name) {
    setFieldErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  // Friendlier than the browser's own validationMessage, and consistent
  // with the red error text every other field on this form shows — falls
  // back to the field's own `title` for a pattern mismatch (already set to
  // a human description for phone/pin/GSTIN/registration above) rather than
  // the native "Please match the requested format." wording.
  function describeValidity(el) {
    const v = el.validity;
    if (v.valueMissing) return "This field is required.";
    if (v.patternMismatch) return el.title || "This value isn't in a valid format.";
    if (v.tooShort) return `Enter at least ${el.minLength} characters.`;
    if (v.tooLong) return `Enter no more than ${el.maxLength} characters.`;
    return el.validationMessage || "This value isn't valid.";
  }

  function scrollToElement(el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Focusing right away can fight the smooth scroll in some browsers
    // (jumping straight there instead); giving the scroll a moment first
    // avoids that.
    window.setTimeout(() => el.focus({ preventScroll: true }), 300);
  }

  // Walks the form in the same top-to-bottom order a customer fills it in,
  // stopping at the very first problem — a missing/invalid real field, the
  // pickup date/time slot (not real form fields — see the refs above), or a
  // missing required document — rather than collecting every error at once.
  // Each entry here matches a field that's actually rendered right now (the
  // `pickupMethod === "driver"` etc. conditions mirror the JSX below), so a
  // conditionally-hidden field is never checked while it's hidden.
  function validateAndFocusFirstError() {
    setFieldErrors({});

    if (!pickupDate) {
      setFieldErrors({ pickup_date: "Select a pickup date." });
      pickupDateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    if (!timeSlot) {
      setFieldErrors({ time_slot: "Select a pickup time slot." });
      timeSlotRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    const fieldOrder = [
      "pickup_fullName",
      "pickup_phone",
      ...(pickupMethod === "driver" ? ["pickup_house", "pickup_street", "pickup_city", "pickup_pin"] : []),
      "dropoff_fullName",
      "dropoff_phone",
      ...(dropoffMethod === "driver" ? ["dropoff_house", "dropoff_street", "dropoff_city", "dropoff_pin"] : []),
      "registration_number",
      "billing_gstin",
      ...(billingMode === "custom"
        ? ["billing_fullName", "billing_phone", "billing_house", "billing_street", "billing_city", "billing_pin"]
        : []),
    ];

    if (formRef.current) {
      for (const name of fieldOrder) {
        const el = formRef.current.elements.namedItem(name);
        if (!el) continue; // shouldn't happen — fieldOrder mirrors the JSX below
        if (!el.checkValidity()) {
          setFieldErrors({ [name]: describeValidity(el) });
          scrollToElement(el);
          return false;
        }
      }
    }

    // Checked after every real field, not proactively the whole time the
    // form is open — see docsSubmitAttempted above.
    if (documentTypes.some(({ key, required }) => required && !uploads[key]?.uploaded)) {
      setDocsSubmitAttempted(true);
      documentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateAndFocusFirstError()) return;

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setSubmitError("");

    // Only styled uppercase via CSS above (textTransform) — the stored
    // value needs the same normalization, not just the on-screen look.
    const registrationNumber = (formData.get("registration_number") || "").toString().trim().toUpperCase() || null;
    // Same normalization as registrationNumber above — independent of
    // billingMode, since a GSTIN doesn't have to match whichever address
    // (pickup/destination/custom) the booking is billed to.
    const gstin = (formData.get("billing_gstin") || "").toString().trim().toUpperCase() || null;

    // Replaces whatever flat provisional pickup/dropoff charge EstimateModal
    // quoted (before a location/yard was even picked) with the real,
    // distance-based figure now that it's known — see the
    // pickupDistance/dropoffDistance effects above and driverLegCharge in
    // ../../lib/pricing.js. 0 for a self pickup/drop-off leg, same as before.
    const finalPickupCharge = pickupMethod === "driver" ? pickupDistance.charge : 0;
    const finalDropoffCharge = dropoffMethod === "driver" ? dropoffDistance.charge : 0;
    const finalEstimate = estimate && {
      ...estimate,
      pickupCharge: finalPickupCharge,
      dropoffCharge: finalDropoffCharge,
      total:
        estimate.total -
        (estimate.pickupCharge ?? 0) -
        (estimate.dropoffCharge ?? 0) +
        finalPickupCharge +
        finalDropoffCharge,
    };

    const booking = {
      estimate: finalEstimate,
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
        // Automatic now (see pickupDistance above) rather than self-declared.
        withinHubRadius: pickupDistance.distanceKm != null ? pickupDistance.distanceKm <= 50 : null,
        hubName: pickupYard?.name ?? null,
        hubAddress: pickupYard?.address ?? null,
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
        withinHubRadius: dropoffDistance.distanceKm != null ? dropoffDistance.distanceKm <= 50 : null,
        hubName: dropoffYard?.name ?? null,
        hubAddress: dropoffYard?.address ?? null,
        // No longer customer-picked — expected delivery date is computed
        // from the pickup date + the route's minimum transit days instead
        // (see expectedDeliveryISO above); there's no drop-off time slot
        // concept anymore either.
        date: expectedDeliveryISO,
        timeSlot: null,
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
              gstin,
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
                gstin,
              }
            : {
                fullName: formData.get("billing_fullName"),
                phone: formData.get("billing_phone"),
                house: formData.get("billing_house"),
                street: formData.get("billing_street"),
                landmark: formData.get("billing_landmark"),
                city: formData.get("billing_city"),
                pin: formData.get("billing_pin"),
                gstin,
              },
      documents: uploads,
    };

    try {
      const created = await createBooking(booking);
      // Point of no return — nothing left to resume back to. Bounds
      // IndexedDB/localStorage to one in-progress draft's worth of data at
      // a time, same as this session's established "clean up on success"
      // pattern elsewhere in the codebase.
      clearSavedEstimate();
      clearLocalFormDraft(draftId);
      clearDocuments(draftId);
      router.push(`/my-bookings?id=${created.id}`);
    } catch (err) {
      console.error("Failed to create booking:", err);
      setSubmitError("Something went wrong creating your booking — please try again, or contact us if it keeps happening.");
      setSubmitting(false);
    }
  }

  // Which of the admin's required document types are still missing —
  // enforced in handleSubmit rather than pre-disabling the button, so the
  // "Still required" message only shows up once the customer actually
  // tries to submit with something missing (and then tracks live as they
  // fix it).
  const missingDocs = documentTypes.filter(({ key, required }) => required && !uploads[key]?.uploaded);
  const showDocsError = docsSubmitAttempted && missingDocs.length > 0;
  const canSubmit = confirmedDocs && agreedTerms && !submitting;

  // Rendered in two places depending on the method: for self drop-off/pickup
  // it IS the address section (which yard to go to); for a driver it stays
  // down in the details as the reference point for the automatic distance
  // surcharge (see the pickupDistance/dropoffDistance effects above).
  const pickupHubCard = (
  <HubLocationCard
    city={pickupCity}
    showDistance={pickupMethod === "driver"}
    distanceState={pickupDistance}
    yards={pickupYards}
    yard={pickupYard}
    onYardChange={setPickupYard}
  />
  );
  const dropoffHubCard = (
  <HubLocationCard
    city={dropoffCity}
    showDistance={dropoffMethod === "driver"}
    distanceState={dropoffDistance}
    yards={dropoffYards}
    yard={dropoffYard}
    onYardChange={setDropoffYard}
  />
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={() => {
        scheduleFormDraftSave();
        // Only ever one entry at a time (see validateAndFocusFirstError) —
        // clearing all of it on any edit is enough to dismiss it as soon as
        // the customer starts fixing whatever was flagged.
        if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
      }}
      className="flex flex-col gap-6"
    >
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      {estimate && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4 text-sm">
          <span className="font-semibold text-[#0b1e42]">
            {estimate.fromCity} &rarr; {estimate.toCity} &bull; {estimate.vehicleType}
          </span>
          {/* Same adjusted-total math as BookingSummary.js's sidebar — kept
              in sync here too so this strip never shows a different figure
              than the one the customer sees further down the page. */}
          <span className="font-extrabold text-red-600">
            {formatINR(
              estimate.total -
                (estimate.pickupCharge ?? 0) -
                (estimate.dropoffCharge ?? 0) +
                (pickupMethod === "driver" ? pickupDistance.charge : 0) +
                (dropoffMethod === "driver" ? dropoffDistance.charge : 0)
            )}
          </span>
        </div>
      )}

      <SectionCard
        icon={MapPin}
        title="1. Pickup Address"
        badge={estimate ? `${estimate.fromCity}${estimate.pickupPin ? `, ${estimate.pickupPin}` : ""}` : undefined}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full Name"
            name="pickup_fullName"
            type="text"
            defaultValue={initialFormValues?.pickup_fullName ?? ""}
            placeholder="e.g. Rahul Sharma"
            required
            minLength={2}
            maxLength={80}
            error={fieldErrors.pickup_fullName}
          />
          <TextField
            label="Phone Number"
            name="pickup_phone"
            type="tel"
            inputMode="numeric"
            defaultValue={initialFormValues?.pickup_phone ?? ""}
            placeholder="98765 43210"
            required
            pattern={PHONE_PATTERN}
            maxLength={10}
            title={PHONE_TITLE}
            error={fieldErrors.pickup_phone}
          />
        </div>
        {pickupMethod === "driver" ? (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                label="House / Plot / Flat No."
                name="pickup_house"
                type="text"
                defaultValue={initialFormValues?.pickup_house ?? ""}
                placeholder="B-24, 2nd Floor"
                required
                maxLength={120}
                error={fieldErrors.pickup_house}
              />
              <TextField
                label="Street / Area Name"
                name="pickup_street"
                type="text"
                defaultValue={initialFormValues?.pickup_street ?? ""}
                placeholder="Connaught Place"
                required
                maxLength={150}
                error={fieldErrors.pickup_street}
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <TextField
                label="Landmark (Optional)"
                name="pickup_landmark"
                type="text"
                defaultValue={initialFormValues?.pickup_landmark ?? ""}
                placeholder="Near Metro Pillar 12"
                maxLength={120}
              />
              <TextField
                label="City"
                name="pickup_city"
                type="text"
                defaultValue={initialFormValues?.pickup_city ?? estimate?.fromCity ?? ""}
                placeholder="New Delhi"
                required
                maxLength={60}
                error={fieldErrors.pickup_city}
              />
              <TextField
                label="PIN Code"
                name="pickup_pin"
                type="text"
                inputMode="numeric"
                defaultValue={initialFormValues?.pickup_pin ?? estimate?.pickupPin ?? ""}
                placeholder="110001"
                readOnly={Boolean(estimate?.pickupPin)}
                required
                pattern={PIN_PATTERN}
                maxLength={6}
                title={estimate?.pickupPin ? "Set from your estimate — get a new estimate to change it" : PIN_TITLE}
                error={fieldErrors.pickup_pin}
              />
            </div>
          </>
        ) : (
          // Self Drop-off — no address for a driver to find; the customer
          // just picks which yard they'll bring the car to.
          <>
            <p className="mt-5 text-xs text-slate-400">No address needed — you&apos;ll drop the car off at one of our yards.</p>
            {pickupHubCard}
          </>
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
              locating={locating.pickup}
              error={locateError.pickup}
            />
          )}

          {pickupMethod === "driver" && pickupHubCard}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label ref={pickupDateRef} className="block text-sm font-semibold text-[#0b1e42]">
              Select Date <span className="text-red-600">*</span>
              <span className="mt-2 block">
                <DatePicker
                  name="pickup_date"
                  value={pickupDate}
                  onChange={(value) => {
                    setPickupDate(value);
                    clearFieldError("pickup_date");
                  }}
                  min={earliestPickupISO}
                />
              </span>
              {fieldErrors.pickup_date && (
                <span className="mt-1.5 block text-xs font-semibold text-red-600">{fieldErrors.pickup_date}</span>
              )}
            </label>

            <div ref={timeSlotRef}>
              <p className="text-sm font-semibold text-[#0b1e42]">
                Time Slot <span className="text-red-600">*</span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const selected = timeSlot === slot;
                  const past = isTimeSlotDisabled(slot, pickupDate);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={past}
                      onClick={() => {
                        setTimeSlot(slot);
                        clearFieldError("time_slot");
                      }}
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
              {fieldErrors.time_slot && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.time_slot}</p>
              )}
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
          <TextField
            label="Full Name"
            name="dropoff_fullName"
            type="text"
            defaultValue={initialFormValues?.dropoff_fullName ?? ""}
            placeholder="Recipient Name"
            required
            minLength={2}
            maxLength={80}
            error={fieldErrors.dropoff_fullName}
          />
          <TextField
            label="Phone Number"
            name="dropoff_phone"
            type="tel"
            inputMode="numeric"
            defaultValue={initialFormValues?.dropoff_phone ?? ""}
            placeholder="98765 43210"
            required
            pattern={PHONE_PATTERN}
            maxLength={10}
            title={PHONE_TITLE}
            error={fieldErrors.dropoff_phone}
          />
        </div>
        {dropoffMethod === "driver" ? (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                label="House / Plot / Flat No."
                name="dropoff_house"
                type="text"
                defaultValue={initialFormValues?.dropoff_house ?? ""}
                placeholder="A-12, 5th Floor"
                required
                maxLength={120}
                error={fieldErrors.dropoff_house}
              />
              <TextField
                label="Street / Area Name"
                name="dropoff_street"
                type="text"
                defaultValue={initialFormValues?.dropoff_street ?? ""}
                placeholder="Bandra West"
                required
                maxLength={150}
                error={fieldErrors.dropoff_street}
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <TextField
                label="Landmark (Optional)"
                name="dropoff_landmark"
                type="text"
                defaultValue={initialFormValues?.dropoff_landmark ?? ""}
                placeholder="Near Linking Road"
                maxLength={120}
              />
              <TextField
                label="City"
                name="dropoff_city"
                type="text"
                defaultValue={initialFormValues?.dropoff_city ?? estimate?.toCity ?? ""}
                placeholder="Mumbai"
                required
                maxLength={60}
                error={fieldErrors.dropoff_city}
              />
              <TextField
                label="PIN Code"
                name="dropoff_pin"
                type="text"
                inputMode="numeric"
                defaultValue={initialFormValues?.dropoff_pin ?? estimate?.destinationPin ?? ""}
                placeholder="400001"
                readOnly={Boolean(estimate?.destinationPin)}
                required
                pattern={PIN_PATTERN}
                maxLength={6}
                title={
                  estimate?.destinationPin ? "Set from your estimate — get a new estimate to change it" : PIN_TITLE
                }
                error={fieldErrors.dropoff_pin}
              />
            </div>
          </>
        ) : (
          // Self Pickup — no address for a driver to deliver to; the customer
          // just picks which yard they'll collect the car from.
          <>
            <p className="mt-5 text-xs text-slate-400">No address needed — you&apos;ll collect the car from one of our yards.</p>
            {dropoffHubCard}
          </>
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
              locating={locating.dropoff}
              error={locateError.dropoff}
            />
          )}

          {dropoffMethod === "driver" && dropoffHubCard}

          {/* Read-only — replaces what used to be a customer-pickable
              drop-off date/time slot. Just pickup date + the route's
              minimum transit days (see expectedDeliveryISO above). */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-[#0b1e42]">Expected Delivery Date</p>
            {expectedDeliveryISO ? (
              <p className="mt-2 text-sm font-semibold text-[#0b1e42]">
                {formatISOShort(expectedDeliveryISO)}
                <span className="ml-1.5 font-normal text-slate-400">
                  ({minTransitDays} day{minTransitDays === 1 ? "" : "s"} transit from pickup)
                </span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-400">Select a pickup date above to see the expected delivery date.</p>
            )}
          </div>
        </div>
      </SectionCard>

      <div ref={documentsSectionRef}>
        <SectionCard icon={ShieldCheck} title="3. Vehicle Documents">
          <p className="-mt-2 mb-5 text-xs text-slate-400">
            Documents marked <span className="text-red-600">*</span> are required — the booking can&apos;t be
            submitted until every required one is uploaded. Each file must be {MAX_DOCUMENT_SIZE_MB}MB or smaller.
          </p>

          <TextField
            label="Vehicle Registration Number"
            name="registration_number"
            type="text"
            defaultValue={initialFormValues?.registration_number ?? ""}
            placeholder="e.g. DL01AB1234"
            style={{ textTransform: "uppercase" }}
            required
            minLength={4}
            maxLength={13}
            pattern="[A-Za-z0-9\- ]{4,13}"
            title="Enter a valid vehicle registration number"
            error={fieldErrors.registration_number}
          />

          <div className="mt-5 flex flex-col gap-6">
            {DOCUMENT_CATEGORIES.map(({ key: categoryKey, label: categoryLabel }) => {
              const docs = documentTypes.filter((d) => d.category === categoryKey);
              if (docs.length === 0) return null;
              return (
                <div key={categoryKey}>
                  <p className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">{categoryLabel}</p>
                  <div
                    className={
                      categoryKey === "legal"
                        ? "mt-3 flex flex-col gap-3"
                        : "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
                    }
                  >
                    {docs.map((doc) => (
                      <DocumentCard
                        key={doc.key}
                        doc={{ ...doc, icon: resolveDocIcon(doc.icon) }}
                        state={uploads[doc.key] ?? { uploaded: false }}
                        onUpload={triggerUpload}
                        onRemove={handleRemoveUpload}
                        downloadUrl={documentFormats[doc.key]}
                        error={uploadErrors[doc.key]}
                      />
                    ))}
                  </div>
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

        {/* Independent of which address gets billed above — a GST-registered
            customer's GSTIN doesn't have to match the pickup/drop-off/custom
            address, so this stays visible (and optional) in every mode. */}
        <div className="mt-5">
          <label className="block text-sm font-semibold text-[#0b1e42]">
            GSTIN (Optional - for a GST invoice)
            <div className="mt-2 flex items-center gap-2">
              <input
                name="billing_gstin"
                type="text"
                placeholder="e.g. 07AAAAA0000A1Z5"
                pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}"
                maxLength={15}
                title="Enter a valid 15-character GSTIN"
                style={{ textTransform: "uppercase" }}
                value={gstin}
                onChange={(event) => {
                  setGstin(event.target.value.toUpperCase());
                  setGstStatus("idle");
                  setGstCompanyName(null);
                }}
                className={`min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 ${
                  fieldErrors.billing_gstin ? "bg-red-50 ring-2 ring-red-400" : "bg-slate-50"
                }`}
              />
              <button
                type="button"
                disabled={!GSTIN_RE.test(gstin) || gstStatus === "checking"}
                onClick={handleVerifyGstin}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0b1e42] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#0b1e42]/90 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {gstStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </button>
            </div>
          </label>
          {gstStatus === "checking" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…
            </p>
          )}
          {gstStatus === "verified" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> {gstCompanyName}
            </p>
          )}
          {gstStatus === "not_found" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" /> GSTIN not found — double-check for a typo.
            </p>
          )}
          {gstStatus === "error" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Couldn&apos;t verify right now — you can still continue.
            </p>
          )}
          {fieldErrors.billing_gstin && (
            <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.billing_gstin}</p>
          )}
        </div>

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
                defaultValue={initialFormValues?.billing_fullName ?? ""}
                placeholder="e.g. Rahul Sharma"
                required
                minLength={2}
                maxLength={80}
                error={fieldErrors.billing_fullName}
              />
              <TextField
                label="Phone Number"
                name="billing_phone"
                type="tel"
                inputMode="numeric"
                defaultValue={initialFormValues?.billing_phone ?? ""}
                placeholder="98765 43210"
                required
                pattern={PHONE_PATTERN}
                maxLength={10}
                title={PHONE_TITLE}
                error={fieldErrors.billing_phone}
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField
                label="House / Plot / Flat No."
                name="billing_house"
                type="text"
                defaultValue={initialFormValues?.billing_house ?? ""}
                placeholder="B-24, 2nd Floor"
                required
                maxLength={120}
                error={fieldErrors.billing_house}
              />
              <TextField
                label="Street / Area Name"
                name="billing_street"
                type="text"
                defaultValue={initialFormValues?.billing_street ?? ""}
                placeholder="Connaught Place"
                required
                maxLength={150}
                error={fieldErrors.billing_street}
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <TextField
                label="Landmark (Optional)"
                name="billing_landmark"
                type="text"
                defaultValue={initialFormValues?.billing_landmark ?? ""}
                placeholder="Near Metro Pillar 12"
                maxLength={120}
              />
              <TextField
                label="City"
                name="billing_city"
                type="text"
                defaultValue={initialFormValues?.billing_city ?? ""}
                placeholder="New Delhi"
                required
                maxLength={60}
                error={fieldErrors.billing_city}
              />
              <TextField
                label="PIN Code"
                name="billing_pin"
                type="text"
                inputMode="numeric"
                defaultValue={initialFormValues?.billing_pin ?? ""}
                placeholder="110001"
                pattern={PIN_PATTERN}
                maxLength={6}
                title={PIN_TITLE}
                required
                error={fieldErrors.billing_pin}
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
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Privacy Policy
          </a>
          .
        </label>
      </div>

      {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

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
