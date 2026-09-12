"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  FileCheck,
  FileSignature,
  FileText,
  Fingerprint,
  IdCard,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Shield,
  ShieldCheck,
  Tag,
  Truck,
  Upload,
  User,
  Wind,
} from "lucide-react";
import { BOOKING_STATUS, STATUS_STEPS, getBooking, getBookings, updateBookingDocument } from "../../services/b2c/lib/bookingStore";
import { formatINR } from "../../services/b2c/lib/pricing";
import InvoiceModal from "./InvoiceModal";

// Same number the site-wide WhatsApp CTA (app/components/Whatsapp.jsx) uses
// — kept as its own constant here since an enquiry from a booking's detail
// page carries a booking-specific pre-filled message, not the generic one.
const ENQUIRY_PHONE = "911234567890";

// Mirrors DOCUMENT_TYPES in book/components/BookingForm.js — kept as its
// own list here since this is a read-only summary of what was uploaded,
// not the upload UI itself.
const DOC_TYPES = [
  { key: "puc", label: "PUC", icon: Wind },
  { key: "noc", label: "NOC", icon: FileCheck },
  { key: "rc", label: "RC Card", icon: FileText },
  { key: "aadhaar", label: "Aadhaar", icon: Fingerprint },
  { key: "insurance", label: "Insurance", icon: Shield },
  { key: "authority_letter", label: "Customer Authority Letter", icon: FileSignature },
  { key: "pan", label: "PAN Card", icon: IdCard },
];

const DOC_STATUS_STYLES = {
  verified: { label: "Verified", bg: "bg-green-50", text: "text-green-700" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700" },
  uploaded: { label: "Uploaded", bg: "bg-blue-50", text: "text-blue-700" },
};

const STATUS_BADGE_STYLES = {
  [BOOKING_STATUS.DOCS_REVIEW]: "bg-amber-50 text-amber-700",
  [BOOKING_STATUS.QUOTE_SENT]: "bg-blue-50 text-blue-700",
  [BOOKING_STATUS.ADVANCE_PAID]: "bg-violet-50 text-violet-700",
  [BOOKING_STATUS.CONFIRMED]: "bg-teal-50 text-teal-700",
  [BOOKING_STATUS.IN_TRANSIT]: "bg-orange-50 text-orange-700",
  [BOOKING_STATUS.DELIVERED]: "bg-green-50 text-green-700",
};

function statusLabel(status) {
  return STATUS_STEPS.find((s) => s.key === status)?.label ?? status;
}

function StatusStepper({ status }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  // 0-based currentIndex over a 1-based step count — the docs_sent lead-in
  // step is always already "done" by the time a booking exists (see the
  // comment on STATUS_STEPS in bookingStore.js), so it never lowers this.
  const progressPct = Math.round((currentIndex / (STATUS_STEPS.length - 1)) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-red-500 to-red-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-slate-500">{progressPct}%</span>
      </div>
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {done || current ? (
                <CheckCircle2 className={`h-5 w-5 ${current ? "text-red-600" : "text-green-600"}`} strokeWidth={2} />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" strokeWidth={2} />
              )}
              {i < STATUS_STEPS.length - 1 && (
                <span className={`mt-1 h-8 w-px ${i < currentIndex ? "bg-green-300" : "bg-slate-200"}`} />
              )}
            </div>
            <p
              className={`pb-6 text-sm font-semibold ${
                current ? "text-red-600" : done ? "text-[#0b1e42]" : "text-slate-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
      <p className="text-lg font-extrabold text-[#0b1e42]">No bookings yet</p>
      <p className="mt-2 text-sm text-slate-500">Get a quote and complete a booking to see it show up here.</p>
      <Link
        href="/services/b2c"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        Get an Estimate
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// One card per booking — clicking it navigates to /my-bookings?id=<code>
// for the full detail view.
function BookingCard({ booking }) {
  const { estimate } = booking;
  const badgeStyle = STATUS_BADGE_STYLES[booking.status] ?? "bg-slate-100 text-slate-500";

  return (
    <Link
      href={`/my-bookings?id=${booking.id}`}
      className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Booking ID</p>
          <p className="text-base font-extrabold text-[#0b1e42]">{booking.id}</p>
        </div>
        <span className={`rounded-full ${badgeStyle} px-3 py-1 text-xs font-bold whitespace-nowrap`}>
          {statusLabel(booking.status)}
        </span>
      </div>

      {estimate ? (
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-[#0b1e42]">
          <Truck className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />
          {estimate.fromCity} <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" /> {estimate.toCity}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">No route saved</div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </span>
        <span className="font-extrabold text-red-600">{estimate ? formatINR(estimate.total) : "—"}</span>
      </div>
    </Link>
  );
}

const DETAIL_TABS = [
  { key: "summary", label: "Summary" },
  { key: "status", label: "Status" },
];

function PriceRow({ label, value, muted, negative }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className={muted ? "text-slate-400" : "text-slate-600"}>{label}</span>
      <span className={`font-semibold ${negative ? "text-green-600" : "text-[#0b1e42]"}`}>{value}</span>
    </div>
  );
}

// Every line the estimate was built from — mirrors the breakup shown in
// EstimateModal.js at quote time, plus what actually happened after (final
// quote / advance paid), so this reads as the definitive record for the
// booking rather than just what was estimated up front.
function PriceBreakdownCard({ booking }) {
  const { estimate, finalQuote, advancePaid } = booking;
  if (!estimate) return null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
        <Receipt className="h-3.5 w-3.5 text-red-600" /> Price Breakdown
      </p>
      <div className="mt-3 flex flex-col divide-y divide-slate-100">
        <PriceRow
          label={`Transportation (${estimate.fromCity ?? "—"} → ${estimate.toCity ?? "—"})`}
          value={formatINR(estimate.routePrice ?? 0)}
        />
        {Boolean(estimate.vehicleSurcharge) && (
          <PriceRow
            label={`Vehicle Type (${estimate.vehicleType})`}
            value={`${estimate.vehicleSurcharge > 0 ? "+" : "-"}${formatINR(Math.abs(estimate.vehicleSurcharge))}`}
            negative={estimate.vehicleSurcharge < 0}
          />
        )}
        <PriceRow label="Service Charges" value={formatINR(estimate.serviceCharge ?? 0)} />
        {estimate.addOnBreakdown?.map((a) => (
          <PriceRow key={a.key ?? a.label} label={a.label} value={formatINR(a.price)} />
        ))}
        <PriceRow label="GST" value={formatINR(estimate.gst ?? 0)} />
        {Boolean(estimate.discount) && (
          <PriceRow
            label={
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> Discount{estimate.coupon?.code ? ` (${estimate.coupon.code})` : ""}
              </span>
            }
            value={`-${formatINR(estimate.discount)}`}
            negative
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-red-50 p-4">
        <span className="text-sm font-extrabold text-[#0b1e42] uppercase">{finalQuote ? "Final Amount" : "Estimated Total"}</span>
        <span className="text-xl font-extrabold text-red-600">{formatINR(finalQuote ?? estimate.total)}</span>
      </div>

      {finalQuote && (
        <PriceRow
          label={<span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Advance Due (30%)</span>}
          value={formatINR(finalQuote * 0.3)}
        />
      )}
      {typeof advancePaid === "number" && (
        <PriceRow
          label={<span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Advance Paid</span>}
          value={formatINR(advancePaid)}
        />
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <p className="flex items-start gap-1.5 text-sm text-slate-500">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span>
        <span className="text-slate-400">{label}: </span>
        <span className="font-semibold text-[#0b1e42]">{value || "—"}</span>
      </span>
    </p>
  );
}

// Full pickup/drop-off leg — contact, address, method (self vs. driver),
// captured location for a driver leg, and the scheduled date/slot. The
// old "Addresses" card only showed name + address; this is everything
// BookingForm.js actually collects for that leg. `simple` (the Billing
// card) drops all of that leg-specific detail — there's no method, no
// driver location, no date/slot for a billing address — down to just
// contact + address.
function AddressDetailCard({ title, icon: Icon, address, simple = false, sameAsNote }) {
  const isDriver = !simple && address?.method === "driver";
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
          <Icon className="h-3.5 w-3.5 text-red-600" /> {title}
        </p>
        {address && !simple && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
              isDriver ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            <User className="h-3 w-3" /> {isDriver ? "CarCoolie Driver" : "Self"}
          </span>
        )}
        {simple && sameAsNote && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase">
            {sameAsNote}
          </span>
        )}
      </div>

      {address ? (
        <div className="mt-4 flex flex-col gap-2">
          <DetailRow icon={User} label="Contact" value={address.fullName} />
          <DetailRow icon={Phone} label="Phone" value={address.phone} />
          <DetailRow
            icon={MapPin}
            label="Address"
            value={[address.house, address.street, address.landmark, address.city, address.pin].filter(Boolean).join(", ")}
          />
          {address.gstin && <DetailRow icon={Receipt} label="GSTIN" value={address.gstin} />}
          {!simple &&
            isDriver &&
            (address.capturedLocation ? (
              <p className="mt-1 flex items-start gap-1.5 rounded-xl bg-green-50 p-2.5 text-xs font-semibold text-green-700">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {address.capturedLocation.address}
              </p>
            ) : (
              <p className="mt-1 rounded-xl bg-amber-50 p-2.5 text-xs font-semibold text-amber-700">
                No pickup/drop-off location captured yet
              </p>
            ))}
          {!simple && (
            <>
              <DetailRow icon={Calendar} label="Date" value={address.date ? new Date(address.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null} />
              <DetailRow icon={Clock} label="Time Slot" value={address.timeSlot} />
            </>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">Not provided.</p>
      )}
    </div>
  );
}

// Every document type BookingForm.js can collect, with whatever status
// the admin's Document Verification screen has set — matching what the
// admin panel's own BookingDetailClient.js shows, just read-only here.
// `onReupload` and `busyKey`/`error` are only passed in from the detail
// view, which is the only place a document can actually have been reviewed
// (and possibly rejected) yet — the list view's BookingCard never renders
// this with them, so re-upload just doesn't apply there.
function DocumentsCard({ documents, registrationNumber, onReupload, busyKey, error }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
          <ShieldCheck className="h-3.5 w-3.5 text-red-600" /> Documents
        </p>
        {registrationNumber && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-[#0b1e42]">{registrationNumber}</span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {DOC_TYPES.map(({ key, label, icon: Icon }) => {
          const doc = documents?.[key];
          const style = doc?.uploaded ? (DOC_STATUS_STYLES[doc.status] ?? DOC_STATUS_STYLES.uploaded) : null;
          const rejected = doc?.status === "rejected";
          const busy = busyKey === key;
          return (
            <div key={key} className="rounded-2xl border border-slate-200 p-3">
              <Icon className={`h-4 w-4 ${doc?.uploaded ? "text-slate-500" : "text-slate-300"}`} strokeWidth={2} />
              <p className="mt-2 text-xs font-bold text-[#0b1e42]">{label}</p>
              {style ? (
                <span className={`mt-1.5 inline-block rounded-full ${style.bg} ${style.text} px-2 py-0.5 text-[10px] font-bold uppercase`}>
                  {style.label}
                </span>
              ) : (
                <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">
                  Not uploaded
                </span>
              )}
              {rejected && doc?.rejectionReason && <p className="mt-1.5 text-[10px] text-red-500">{doc.rejectionReason}</p>}
              {rejected && onReupload && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onReupload(key)}
                  className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase transition-colors hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {busy ? "Uploading…" : "Re-upload"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="mt-4 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function addressesMatch(a, b) {
  if (!a || !b) return false;
  return ["fullName", "phone", "house", "street", "landmark", "city", "pin"].every((k) => (a[k] || "") === (b[k] || ""));
}

function BookingDetailView({ booking, onBookingChange }) {
  const { estimate, pickup, dropoff, billing } = booking;
  // Compares the actual field values rather than trusting a stored flag
  // (none is persisted — billing is just another booking_addresses row) so
  // this stays correct even if the customer had unchecked one of the
  // "Same as ___" boxes but then retyped the exact same details by hand.
  const billingSameAsPickupNote = addressesMatch(billing, pickup)
    ? "Same as Pickup"
    : addressesMatch(billing, dropoff)
      ? "Same as Destination"
      : null;
  const [tab, setTab] = useState("summary");
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  // Re-uploading a rejected document — a fresh pick reaches
  // handleDocFileSelected via the same hidden-input trigger pattern
  // BookingForm.js uses for the original upload.
  const [reuploadKey, setReuploadKey] = useState(null); // doc key currently uploading, or null
  const [reuploadError, setReuploadError] = useState("");
  const docFileInputRef = useRef(null);
  const pendingReuploadKey = useRef(null);

  function triggerReupload(key) {
    setReuploadError("");
    pendingReuploadKey.current = key;
    docFileInputRef.current?.click();
  }

  async function handleDocFileSelected(event) {
    const file = event.target.files?.[0];
    const key = pendingReuploadKey.current;
    event.target.value = "";
    if (!file || !key) return;
    setReuploadError("");
    setReuploadKey(key);
    try {
      await updateBookingDocument(booking.id, key, file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      // Optimistic local patch instead of a full refetch — we already know
      // exactly what updateBookingDocument just wrote.
      onBookingChange?.((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [key]: { uploaded: true, fileName: file.name, fileSize: `${sizeMB} MB`, status: "uploaded", rejectionReason: null },
        },
      }));
    } catch (err) {
      setReuploadError(`Couldn't re-upload — ${err.message}`);
    } finally {
      setReuploadKey(null);
    }
  }

  const enquiryUrl = `https://wa.me/${ENQUIRY_PHONE}?text=${encodeURIComponent(
    `Hi! I have an enquiry about my booking ${booking.id}.`
  )}`;

  return (
    <div>
      <input ref={docFileInputRef} type="file" className="hidden" onChange={handleDocFileSelected} />

      <Link href="/my-bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b1e42]">
        &larr; All Bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Booking ID</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold text-[#0b1e42]">{booking.id}</p>
            <span className={`rounded-full ${STATUS_BADGE_STYLES[booking.status] ?? "bg-slate-100 text-slate-500"} px-2.5 py-1 text-xs font-bold`}>
              {statusLabel(booking.status)}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            Booked{" "}
            {booking.createdAt
              ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
        {estimate && (
          <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
            <Truck className="h-4 w-4" strokeWidth={2} />
            {estimate.fromCity} <ArrowRight className="h-3 w-3" /> {estimate.toCity}
          </div>
        )}
      </div>

      {/* Summary = every booking detail (addresses, final quote/payment,
          testing controls); Status = just the tracking chart, kept
          separate so checking progress doesn't mean scrolling past
          everything else. */}
      <div className="mt-6 flex gap-1 rounded-full bg-slate-100 p-1 sm:inline-flex">
        {DETAIL_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-5 py-2 text-sm font-bold transition-colors sm:flex-initial ${
              tab === t.key ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-[#0b1e42]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {tab === "status" && (
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
            <p className="text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">Tracking Status</p>
            <div className="mt-6">
              <StatusStepper status={booking.status} />
            </div>
          </div>
        )}

        {tab === "summary" && (
          <>
            {booking.status === BOOKING_STATUS.QUOTE_SENT && booking.finalQuote && (
              <div className="rounded-3xl bg-[#0b1220] p-6 text-white sm:p-8">
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Final Quote</p>
                <p className="mt-1 text-3xl font-extrabold">{formatINR(booking.finalQuote)}</p>
                <p className="mt-2 text-sm text-slate-300">
                  Reviewed and confirmed by our team. Pay a 30% advance to lock in your booking.
                </p>
                <Link
                  href={`/payment?bookingId=${booking.id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
                >
                  Proceed to Payment (30% Advance)
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <AddressDetailCard title="Pickup" icon={MapPin} address={pickup} />
              <AddressDetailCard title="Drop-off" icon={MapPin} address={dropoff} />
            </div>

            <AddressDetailCard title="Billing" icon={CreditCard} address={billing} simple sameAsNote={billingSameAsPickupNote} />

            <DocumentsCard
              documents={booking.documents}
              registrationNumber={booking.registrationNumber}
              onReupload={triggerReupload}
              busyKey={reuploadKey}
              error={reuploadError}
            />

            <PriceBreakdownCard booking={booking} />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setInvoiceOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b1e42] shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <FileText className="h-4 w-4 text-red-600" strokeWidth={2} />
                Invoice
              </button>
              <a
                href={enquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b1e42] shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4 text-red-600" strokeWidth={2} />
                Enquiry
              </a>
            </div>
          </>
        )}
      </div>

      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} booking={booking} />
    </div>
  );
}

export default function MyBookingsClient() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");
  // undefined = loading, null = none found, array = list view, object = detail view
  const [result, setResult] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = requestedId ? await getBooking(requestedId) : await getBookings();
      if (!cancelled) setResult(data ?? null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [requestedId]);

  if (result === undefined) return null;

  // Detail view: a specific ?id= was requested.
  if (requestedId) {
    if (!result) {
      return (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-extrabold text-[#0b1e42]">Booking not found</p>
          <p className="mt-2 text-sm text-slate-500">We couldn&apos;t find a booking with that ID.</p>
          <Link
            href="/my-bookings"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            View All Bookings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      );
    }
    return <BookingDetailView booking={result} onBookingChange={setResult} />;
  }

  // List view: every booking as a card.
  if (!result || result.length === 0) return <EmptyState />;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {result.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
