"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  Circle,
  ExternalLink,
  Clock,
  CreditCard,
  FileCheck,
  FileSignature,
  FileText,
  Fingerprint,
  Gift,
  Handshake,
  IdCard,
  LayoutList,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  Upload,
  User,
  Utensils,
  Wind,
  X,
  XCircle,
} from "lucide-react";
import {
  BOOKING_STATUS,
  buildStatusSteps,
  cancelBooking,
  CANCELLABLE_STATUSES,
  CANCELLATION_FEE_PERCENT,
  CANCELLATION_REASONS,
  getBooking,
  getBookings,
  getChargeReceiptUrl,
  listAvailableBenefits,
  selectBookingBenefit,
  submitBookingReview,
  updateBookingDocument,
} from "../../services/b2c/lib/bookingStore";
import { formatINR, getPaymentSplit, PAYMENT_SPLIT } from "../../services/b2c/lib/pricing";
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";
import AuthModal from "../../components/AuthModal";

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
  [BOOKING_STATUS.MIDWAY_PAID]: "bg-indigo-50 text-indigo-700",
  [BOOKING_STATUS.LOADED_ON_CARRIER]: "bg-cyan-50 text-cyan-700",
  [BOOKING_STATUS.IN_TRANSIT]: "bg-orange-50 text-orange-700",
  [BOOKING_STATUS.OUT_FOR_DELIVERY]: "bg-pink-50 text-pink-700",
  [BOOKING_STATUS.DELIVERED]: "bg-green-50 text-green-700",
  [BOOKING_STATUS.CANCELLED]: "bg-slate-100 text-slate-500",
};

function statusLabel(status, split = PAYMENT_SPLIT) {
  if (status === BOOKING_STATUS.CANCELLED) return "Cancelled";
  return buildStatusSteps(split).find((s) => s.key === status)?.label ?? status;
}

function formatStepTime(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Compact nested block for the admin-entered POC under a status step —
// see PocCard below for the fuller Summary-tab version of the same data.
function PocDetailsRow({ label, poc }) {
  return (
    <div className="mt-2 max-w-xs rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
      <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#0b1e42]">{poc.name}</p>
      <a href={`tel:${poc.phone}`} className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
        <Phone className="h-3 w-3 shrink-0" /> {poc.phone}
      </a>
    </div>
  );
}

function StatusStepper({ status, statusTimes = {}, inspections = [], split = PAYMENT_SPLIT, booking }) {
  // Exit state, not a position on the pipeline above — a negative
  // currentIndex (status isn't in `steps`) would otherwise render every
  // step as not-yet-reached, which reads as "still in progress" rather
  // than "cancelled".
  if (status === BOOKING_STATUS.CANCELLED) {
    const cancellationFee = booking?.cancellationFee ?? 0;
    const refundAmount = booking?.refundAmount ?? 0;
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" strokeWidth={2} />
        <div>
          <p className="text-sm font-bold text-[#0b1e42]">Booking Cancelled</p>
          {booking?.cancelledAt && (
            <p className="mt-0.5 text-xs text-slate-400">{formatStepTime(booking.cancelledAt)}</p>
          )}
          {refundAmount > 0 || cancellationFee > 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Cancellation fee ({CANCELLATION_FEE_PERCENT}% of the advance paid):{" "}
              <span className="font-semibold text-[#0b1e42]">{formatINR(cancellationFee)}</span>
              {" · "}
              Refunded: <span className="font-semibold text-green-600">{formatINR(refundAmount)}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Cancelled before any payment was made — nothing was charged.</p>
          )}
          {booking?.refundMethod === "coupon" && booking?.refundCouponCode && (
            <p className="mt-2 text-sm text-slate-500">
              Your refund is a coupon:{" "}
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-sm font-bold text-[#0b1e42] ring-1 ring-slate-200">
                {booking.refundCouponCode}
              </span>{" "}
              — valid on your next booking for 12 months.
            </p>
          )}
        </div>
      </div>
    );
  }

  const steps = buildStatusSteps(split);
  const currentIndex = steps.findIndex((s) => s.key === status);
  // 0-based currentIndex over a 1-based step count — the docs_sent lead-in
  // step is always already "done" by the time a booking exists (see the
  // comment on buildStatusSteps in bookingStore.js), so it never lowers this.
  const progressPct = Math.round((currentIndex / (steps.length - 1)) * 100);

  // Signed URLs are short-lived, so one is minted per click; the blank tab
  // is opened first so the popup isn't blocked by the async gap.
  async function handleViewInspection(path) {
    const win = window.open("", "_blank");
    try {
      const url = await getChargeReceiptUrl(path);
      if (url && win) win.location.href = url;
      else win?.close();
    } catch {
      win?.close();
    }
  }

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
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        const reachedAt = done || current ? formatStepTime(statusTimes[step.key]) : null;
        // Inspection reports the admin attached to this stage — the stage
        // keys match the step keys ("confirmed", "out_for_delivery").
        const stepInspections = done || current ? inspections.filter((f) => f.stage === step.key) : [];
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center self-stretch">
              {done || current ? (
                <CheckCircle2 className={`h-5 w-5 ${current ? "text-red-600" : "text-green-600"}`} strokeWidth={2} />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" strokeWidth={2} />
              )}
              {i < steps.length - 1 && (
                <span className={`mt-1 min-h-8 w-px flex-1 ${i < currentIndex ? "bg-green-300" : "bg-slate-200"}`} />
              )}
            </div>
            <div className="pb-6">
              <p
                className={`text-sm font-semibold ${
                  current ? "text-red-600" : done ? "text-[#0b1e42]" : "text-slate-400"
                }`}
              >
                {step.label}
              </p>
              {reachedAt && <p className="mt-0.5 text-xs text-slate-400">{reachedAt}</p>}
              {stepInspections.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Inspection Documents</p>
                  {stepInspections.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => handleViewInspection(file.path)}
                      className="flex max-w-xs items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-[#0b1e42] ring-1 ring-slate-200 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 text-red-500" />
                      <span className="min-w-0 flex-1 truncate">{file.fileName}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              {/* Admin-entered contact — see PocDetailsCard in the admin
                  panel. Nested under whichever step it's tied to, same as
                  inspection documents above, once that step's reached. */}
              {step.key === BOOKING_STATUS.CONFIRMED && booking?.pickupPoc && (done || current) && (
                <PocDetailsRow label="Pickup Point of Contact" poc={booking.pickupPoc} />
              )}
              {step.key === BOOKING_STATUS.OUT_FOR_DELIVERY && booking?.dropoffPoc && (done || current) && (
                <PocDetailsRow label="Drop-off Point of Contact" poc={booking.dropoffPoc} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// One set of pre-written, selectable comments per star rating (1-5) — see
// the spec: each rating has its own dropdown of options, worded positively/
// neutrally/subtly even at the low end so nothing reads as an overtly
// negative complaint. The first option in each list is the one that
// auto-fills the dropdown the moment that rating is picked (see ReviewCard's
// handleRate) — the customer can still change it to another option in the
// same list before submitting.
const REVIEW_COMMENTS = {
  5: ["The overall experience was very smooth and convenient.", "Everything went exactly as expected — great service."],
  4: ["The experience was good and the process was quite convenient.", "A positive experience overall, with minor room for improvement."],
  3: ["The overall experience was satisfactory.", "The process worked out fine overall."],
  2: ["The experience was okay, with some areas that could be improved.", "There were a few bumps along the way, but it got done."],
  1: ["The experience could have been more convenient.", "There's definitely room to improve the process."],
};

const BENEFIT_CATEGORY_ICONS = {
  gift_card: Gift,
  brand_coupon: Tag,
  food_beverage_voucher: Utensils,
  ecommerce_voucher: ShoppingBag,
  partner_offer: Handshake,
  other: Sparkles,
};

// Shown once a review is submitted but before a benefit's been decided
// (booking.review.benefitSelectedAt is still null) — rendered inline below
// the review summary in ReviewCard, not as its own separate card, so the
// stars/comment the customer just submitted stay visible while they pick.
// See list_available_benefits()/select_booking_benefit's comments in
// supabase-schema.sql. Picking a benefit (or "No thanks") is final, same
// as the review itself — there's no way back to this screen afterwards.
function BenefitChooser({ booking, onBookingChange }) {
  const [state, setState] = useState({ loading: true, error: "", benefits: [] });
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    listAvailableBenefits()
      .then((benefits) => setState({ loading: false, error: "", benefits }))
      .catch((err) => setState({ loading: false, error: err.message || "Couldn't load benefits.", benefits: [] }));
  }, []);

  async function handleChoose(benefitId) {
    setSelectingId(benefitId ?? "skip");
    try {
      const saved = await selectBookingBenefit(booking.id, benefitId);
      onBookingChange?.((prev) => ({ ...prev, review: saved }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || "Couldn't record your choice — try again." }));
      setSelectingId(null);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
        <Gift className="h-3.5 w-3.5 text-red-600" />
        Choose Your Benefit
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Thanks for the feedback — pick a thank-you gift if you&apos;d like one. Totally optional.
      </p>

      {state.loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading&hellip;
        </div>
      ) : state.benefits.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">No benefits are available right now.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.benefits.map((benefit) => {
            const Icon = BENEFIT_CATEGORY_ICONS[benefit.category] ?? Sparkles;
            const busy = selectingId === benefit.id;
            return (
              <button
                key={benefit.id}
                type="button"
                onClick={() => handleChoose(benefit.id)}
                disabled={selectingId !== null}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" strokeWidth={1.75} />}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-[#0b1e42]">{benefit.name}</span>
                  {benefit.brand && <span className="block text-xs text-slate-400">{benefit.brand}</span>}
                  {benefit.description && (
                    <span className="mt-1 block text-xs text-slate-500">{benefit.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {state.error && <p className="mt-3 text-xs font-semibold text-red-600">{state.error}</p>}

      <button
        type="button"
        onClick={() => handleChoose(null)}
        disabled={selectingId !== null}
        className="mt-5 text-xs font-bold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline disabled:cursor-wait"
      >
        {selectingId === "skip" ? "Saving…" : "No thanks, I'll pass"}
      </button>
    </div>
  );
}

// Offered once a booking reaches Delivered — one review per booking, and
// it's final: the moment a rating or comment is saved, this switches to a
// frozen, read-only view instead of an editable form. There's no "Update
// Review" — a submitted review can't be changed. Once submitted, the
// benefit choice (BenefitChooser above) is offered next if it hasn't been
// decided yet (booking.review.benefitSelectedAt is null).
function ReviewCard({ booking, onBookingChange }) {
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [selectedComment, setSelectedComment] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (booking.review) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
          <Star className="h-3.5 w-3.5 text-red-600" />
          Your Review
        </p>
        <div className="mt-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              className={`h-6 w-6 ${
                value <= booking.review.rating ? "fill-red-500 text-red-500" : "fill-transparent text-slate-300"
              }`}
              strokeWidth={1.5}
            />
          ))}
        </div>
        {booking.review.selectedComment && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{booking.review.selectedComment}</p>
        )}
        {booking.review.comment && <p className="mt-2 text-sm leading-relaxed text-slate-600">{booking.review.comment}</p>}
        <p className="mt-4 text-xs text-slate-400">Submitted — reviews can&apos;t be edited once sent.</p>

        {!booking.review.benefitSelectedAt ? (
          <BenefitChooser booking={booking} onBookingChange={onBookingChange} />
        ) : (
          <div className="mt-4 border-t border-slate-100 pt-4">
            {booking.review.benefitId ? (
              <>
                <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  <Gift className="h-3.5 w-3.5 text-red-600" />
                  Your Benefit
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#0b1e42]">{booking.review.benefitType}</p>
                {booking.review.benefitStatus === "issued" ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Code: <span className="font-mono font-bold text-red-600">{booking.review.benefitReference}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">We&apos;ll issue this shortly — check back here.</p>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400">You chose not to select a benefit this time.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const displayRating = hoverRating ?? rating;
  const commentOptions = rating === null ? [] : REVIEW_COMMENTS[rating];

  function handleRate(value) {
    setRating(value);
    setSelectedComment(REVIEW_COMMENTS[value][0]);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (rating === null) {
      setError("Pick a star rating before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const saved = await submitBookingReview(booking.id, { rating, selectedComment, comment });
      onBookingChange?.((prev) => ({ ...prev, review: saved }));
    } catch (err) {
      setError(err.message || "Couldn't submit your review — try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
        <Star className="h-3.5 w-3.5 text-red-600" />
        Rate Your Experience
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Your car&apos;s been delivered — let us know how it went. You won&apos;t be able to change this once submitted.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(null)} role="radiogroup" aria-label="Rating out of 5 stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onMouseEnter={() => setHoverRating(value)}
              onClick={() => handleRate(value)}
              className="p-0.5"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  displayRating !== null && value <= displayRating
                    ? "fill-red-500 text-red-500"
                    : "fill-transparent text-slate-300"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {rating !== null && (
          <div className="relative mt-4">
            <select
              value={selectedComment}
              onChange={(e) => setSelectedComment(e.target.value)}
              className="w-full appearance-none rounded-xl bg-slate-50 px-4 py-3 pr-10 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
            >
              {commentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Anything else you'd like to add? (optional)"
          rows={3}
          className="mt-3 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
        />

        {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
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

// Bookings are scoped to the signed-in account (see getBookings in
// bookingStore.js) — without a session there's no account to list, so this
// replaces EmptyState rather than showing a misleading "No bookings yet".
function SignInPrompt({ onSignIn }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
      <p className="text-lg font-extrabold text-[#0b1e42]">Sign in to see your bookings</p>
      <p className="mt-2 text-sm text-slate-500">Your bookings are tied to your account — sign in to view them.</p>
      <button
        type="button"
        onClick={onSignIn}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        Sign In
      </button>
    </div>
  );
}

// One card per booking — clicking it navigates to /my-bookings?id=<code>
// for the full detail view.
function BookingCard({ booking, split = PAYMENT_SPLIT }) {
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
          {statusLabel(booking.status, split)}
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
  { key: "status", label: "Status" },
  { key: "summary", label: "Summary" },
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
function PriceBreakdownCard({ booking, split = PAYMENT_SPLIT }) {
  const { estimate, finalQuote, advancePaid, midwayPaid, finalPaid, charges, chargesTotal, remainingBalance } = booking;
  if (!estimate) return null;

  // Opens a blank tab synchronously (so it isn't caught by popup blockers
  // once the async signed-URL fetch below resolves) and points it at the
  // receipt once the URL comes back.
  async function handleViewReceipt(path) {
    const win = window.open("", "_blank");
    try {
      const url = await getChargeReceiptUrl(path);
      if (url && win) win.location.href = url;
      else win?.close();
    } catch {
      win?.close();
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
        <Receipt className="h-3.5 w-3.5 text-red-600" /> Price Breakdown
      </p>
      <div className="mt-3 flex flex-col divide-y divide-slate-100">
        <PriceRow
          label={`Transportation (${estimate.fromCity ?? "—"} → ${estimate.toCity ?? "—"})`}
          value={formatINR(
            (estimate.routePrice ?? 0) +
              (estimate.vehicleSurcharge || 0) +
              (estimate.pickupCharge || 0) +
              (estimate.dropoffCharge || 0)
          )}
        />
        {estimate.addOnBreakdown?.map((a) => (
          <PriceRow key={a.key ?? a.label} label={a.label} value={formatINR(a.price)} />
        ))}
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
        <div>
          <span className="text-sm font-extrabold text-[#0b1e42] uppercase">{finalQuote ? "Final Amount" : "Estimated Total"}</span>
        </div>
        <span className="text-xl font-extrabold text-red-600">{formatINR(finalQuote ?? estimate.total)}</span>
      </div>

      {finalQuote && (
        <PriceRow
          label={<span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Advance Due ({split.advancePercent}%)</span>}
          value={formatINR(finalQuote * (split.advancePercent / 100))}
        />
      )}
      {typeof advancePaid === "number" && (
        <PriceRow
          label={<span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Advance Paid</span>}
          value={formatINR(advancePaid)}
        />
      )}
      {finalQuote && typeof advancePaid === "number" && typeof midwayPaid !== "number" && (
        <PriceRow
          label={
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />{" "}
              {booking.midwayRequested ? `${split.midwayPercent}% Payment Due` : `${split.midwayPercent}% Payment (Upcoming)`}
            </span>
          }
          value={formatINR(finalQuote * (split.midwayPercent / 100))}
        />
      )}
      {typeof midwayPaid === "number" && (
        <PriceRow
          label={<span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> {split.midwayPercent}% Payment Paid</span>}
          value={formatINR(midwayPaid)}
        />
      )}
      {finalQuote && typeof midwayPaid === "number" && typeof finalPaid !== "number" && (
        <PriceRow
          label={
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />{" "}
              {booking.finalRequested ? "Final Payment Due" : "Final Payment (Upcoming)"} (
              {Math.round((((remainingBalance ?? 0) - chargesTotal) / finalQuote) * 100)}%)
            </span>
          }
          value={formatINR((remainingBalance ?? 0) - chargesTotal)}
        />
      )}
      {Boolean(chargesTotal) && typeof finalPaid !== "number" && (
        <PriceRow
          label={
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Additional Charges Due
            </span>
          }
          value={formatINR(chargesTotal)}
        />
      )}
      {typeof finalPaid === "number" && (
        <PriceRow
          label={<span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Final Payment Paid</span>}
          value={formatINR(finalPaid)}
        />
      )}

      {charges?.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Additional Charges</p>
          <div className="mt-2 flex flex-col divide-y divide-slate-100">
            {charges.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-2 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-slate-500">{c.label}</span>
                  {c.note && <span className="block truncate text-xs text-slate-400">{c.note}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {c.receiptUrl && (
                    <button
                      type="button"
                      onClick={() => handleViewReceipt(c.receiptUrl)}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      <Receipt className="h-3 w-3" /> View Receipt
                    </button>
                  )}
                  <span className="text-sm text-slate-600">{formatINR(c.amount)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {typeof remainingBalance === "number" && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <span className="text-xs font-extrabold tracking-wide text-slate-500 uppercase">
            Remaining Balance{chargesTotal ? " (incl. charges)" : ""}
          </span>
          <span className="text-sm font-extrabold text-[#0b1e42]">{formatINR(remainingBalance)}</span>
        </div>
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
  const isDropoff = title === "Drop-off";
  // Self pickup/drop-off never collects an address at all — showing
  // "Address: —" for every one of those (the common case) just reads as
  // noise; only show the row once there's something to show.
  const addressLine = address
    ? [address.house, address.street, address.landmark, address.city, address.pin].filter(Boolean).join(", ")
    : "";
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
          {addressLine && <DetailRow icon={MapPin} label="Address" value={addressLine} />}
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
          {/* Drop-off no longer has a customer-picked time slot — its date
              is the computed expected delivery date instead (see
              BookingForm.js), so it gets its own label and drops the row
              entirely rather than showing "Time Slot: —" for every booking. */}
          {!simple && isDropoff && (
            <DetailRow
              icon={Calendar}
              label="Expected Delivery Date"
              value={address.date ? new Date(address.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null}
            />
          )}
          {!simple && !isDropoff && (
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

// Pickup/Drop-off Point of Contact — admin-entered (see PocDetailsCard in
// the admin panel), read-only here. Only ever rendered once that data
// exists (see its call sites), so there's no "Not provided" empty state.
function PocCard({ title, poc }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
        <Phone className="h-3.5 w-3.5 text-red-600" /> {title}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <DetailRow icon={User} label="Contact" value={poc.name} />
        <DetailRow icon={Phone} label="Phone" value={poc.phone} />
      </div>
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

// Three payment slabs — advance, midway, and whatever's left (the balance
// plus any additional charges), per the live split from the admin's
// Payment Settings page — shown as soon as a final quote exists, well
// before any of them are actually due, so the whole payment shape is
// visible up front rather than surfacing one stage at a time.
function PaymentMilestones({ booking, split = PAYMENT_SPLIT }) {
  const { finalQuote, advancePaid, midwayPaid, finalPaid, remainingBalance, chargesTotal } = booking;

  const advanceDone = typeof advancePaid === "number";
  const midwayDone = typeof midwayPaid === "number";
  const finalDone = typeof finalPaid === "number";
  const charges = chargesTotal ?? 0;

  const slabs = [
    {
      key: "advance",
      label: "Advance",
      percent: `${split.advancePercent}%`,
      amount: advanceDone ? advancePaid : finalQuote * (split.advancePercent / 100),
      status: advanceDone ? "paid" : "due",
    },
    {
      key: "midway",
      label: "Midway",
      percent: `${split.midwayPercent}%`,
      amount: midwayDone ? midwayPaid : finalQuote * (split.midwayPercent / 100),
      status: midwayDone ? "paid" : advanceDone ? "due" : "upcoming",
    },
    {
      key: "final",
      label: "Balance",
      percent: `~${split.balancePercent}%`,
      // Charges get their own card below, so this is the finalQuote portion
      // only — finalPaid (once paid) bundles both together, same as
      // bookingStore.js splits it back apart when logging the payment row.
      amount: finalDone ? finalPaid - charges : (remainingBalance ?? finalQuote * (split.balancePercent / 100)) - charges,
      status: finalDone ? "paid" : midwayDone ? "due" : "upcoming",
    },
  ];

  // Only appears once something's actually been added — a normal charge
  // (positive) is extra owed on top of the balance, a credit/discount
  // (negative, see the admin's Charges & Adjustments panel) reduces it.
  // Settles alongside the final balance, so it shares that slab's paid/due
  // state rather than having its own independent one.
  if (charges !== 0) {
    slabs.push({
      key: "charges",
      label: charges < 0 ? "Credits" : "Additional Charges",
      percent: null,
      amount: charges,
      status: finalDone ? "paid" : midwayDone ? "due" : "upcoming",
    });
  }

  const STATUS_STYLES = {
    paid: { card: "bg-green-50 ring-green-100", badge: "bg-green-600 text-white", text: "Paid" },
    due: { card: "bg-red-50 ring-red-100", badge: "bg-red-600 text-white", text: "Due Now" },
    upcoming: { card: "bg-slate-50 ring-slate-100", badge: "bg-slate-200 text-slate-500", text: "Upcoming" },
  };

  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
        <CreditCard className="h-3.5 w-3.5 text-red-600" />
        Payment Milestones
      </p>
      <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${slabs.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {slabs.map((slab) => {
          const style = STATUS_STYLES[slab.status];
          const negative = slab.amount < 0;
          return (
            <div key={slab.key} className={`rounded-2xl p-4 ring-1 ${style.card}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">
                  {slab.label}
                  {slab.percent ? ` (${slab.percent})` : ""}
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${style.badge}`}>
                  {slab.status === "paid" && <CheckCircle2 className="mr-0.5 inline h-2.5 w-2.5" />}
                  {style.text}
                </span>
              </div>
              <p className={`mt-2 text-xl font-extrabold ${negative ? "text-green-600" : "text-[#0b1e42]"}`}>
                {negative ? `-${formatINR(Math.abs(slab.amount))}` : formatINR(slab.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function addressesMatch(a, b) {
  if (!a || !b) return false;
  return ["fullName", "phone", "house", "street", "landmark", "city", "pin"].every((k) => (a[k] || "") === (b[k] || ""));
}

// Replaces a bare confirm() with a real dialog — booking details, the
// cancellation policy (overview + link to the full page), a required
// reason, and exactly what's deducted/refunded — all before the customer
// commits, rather than a one-line browser prompt.
function CancelBookingModal({ booking, onClose, onCancelled }) {
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("original");
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const advancePaid = Number(booking.advancePaid ?? 0);
  const cancellationFee = Math.round((advancePaid * CANCELLATION_FEE_PERCENT) / 100);
  const refundAmount = Math.round(advancePaid - cancellationFee);

  async function handleConfirm() {
    if (!reason) return;
    setCancelling(true);
    setError("");
    try {
      const updated = await cancelBooking(booking.id, reason, refundMethod);
      onCancelled(updated);
    } catch (err) {
      setError(err.message);
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 py-8" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <p className="text-lg font-extrabold text-[#0b1e42]">Cancel Booking</p>
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">Booking</p>
            <p className="mt-1 text-sm font-extrabold text-[#0b1e42]">{booking.id}</p>
            {booking.estimate?.fromCity && booking.estimate?.toCity && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                <Truck className="h-3.5 w-3.5 shrink-0 text-red-600" strokeWidth={2} />
                {booking.estimate.fromCity} <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" /> {booking.estimate.toCity}
              </p>
            )}
            {(booking.finalQuote ?? booking.estimate?.total) != null && (
              <p className="mt-1.5 text-sm text-slate-600">
                {booking.finalQuote ? "Final Quote" : "Estimated Total"}:{" "}
                <span className="font-semibold text-[#0b1e42]">{formatINR(booking.finalQuote ?? booking.estimate.total)}</span>
              </p>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">Cancellation Policy</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This booking hasn&apos;t been confirmed yet, so it&apos;s still eligible for self-serve cancellation.{" "}
              {advancePaid > 0
                ? `A cancellation fee of ${CANCELLATION_FEE_PERCENT}% of your advance applies — the rest is refunded.`
                : "You haven't paid anything yet, so nothing will be charged."}
            </p>
            <a
              href="/cancellation-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
            >
              Read the full Cancellation Policy <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">Reason for cancellation</span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a reason&hellip;</option>
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 rounded-2xl bg-red-50 p-4">
            <p className="text-xs font-extrabold tracking-wide text-red-700 uppercase">Amount Details</p>
            {advancePaid > 0 ? (
              <div className="mt-2 flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Advance Paid</span>
                  <span className="font-semibold text-[#0b1e42]">{formatINR(advancePaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Cancellation Fee ({CANCELLATION_FEE_PERCENT}%)</span>
                  <span className="font-semibold text-red-600">-{formatINR(cancellationFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-red-100 pt-1.5">
                  <span className="font-bold text-[#0b1e42]">Refund Amount</span>
                  <span className="font-extrabold text-green-600">{formatINR(refundAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No payment has been made yet — nothing will be charged or refunded.</p>
            )}
          </div>

          {refundAmount > 0 && (
            <fieldset className="mt-5">
              <legend className="text-xs font-extrabold tracking-wide text-slate-400 uppercase">Where should we send your refund?</legend>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { key: "original", label: "Original payment source", hint: "Back to the card, UPI or account you paid with." },
                  { key: "coupon", label: "As a coupon", hint: `A one-time ${formatINR(refundAmount)} code, valid for 12 months, for your next booking.` },
                ].map((option) => (
                  <label
                    key={option.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      refundMethod === option.key ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="refund-method"
                      value={option.key}
                      checked={refundMethod === option.key}
                      onChange={() => setRefundMethod(option.key)}
                      className="mt-1 accent-red-600"
                    />
                    <span>
                      <span className="block text-sm font-bold text-[#0b1e42]">{option.label}</span>
                      <span className="block text-xs text-slate-500">{option.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason || cancelling}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {cancelling ? "Cancelling…" : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingDetailView({ booking, onBookingChange, split = PAYMENT_SPLIT }) {
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
  const [tab, setTab] = useState("status");

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

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const canCancel = CANCELLABLE_STATUSES.includes(booking.status);

  function handleCancelled(updated) {
    onBookingChange?.(updated);
    setCancelModalOpen(false);
  }

  return (
    <div>
      <input ref={docFileInputRef} type="file" className="hidden" onChange={handleDocFileSelected} />

      {cancelModalOpen && (
        <CancelBookingModal booking={booking} onClose={() => setCancelModalOpen(false)} onCancelled={handleCancelled} />
      )}

      <Link href="/my-bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0b1e42]">
        &larr; All Bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Booking ID</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold text-[#0b1e42]">{booking.id}</p>
            <span className={`rounded-full ${STATUS_BADGE_STYLES[booking.status] ?? "bg-slate-100 text-slate-500"} px-2.5 py-1 text-xs font-bold`}>
              {statusLabel(booking.status, split)}
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
        <div className="flex items-center gap-3">
          {estimate && (
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
              <Truck className="h-4 w-4" strokeWidth={2} />
              {estimate.fromCity} <ArrowRight className="h-3 w-3" /> {estimate.toCity}
            </div>
          )}
          {booking.status !== BOOKING_STATUS.CANCELLED && booking.status !== BOOKING_STATUS.DELIVERED && (
            <button
              type="button"
              disabled={!canCancel}
              onClick={() => setCancelModalOpen(true)}
              title={canCancel ? undefined : "Cancellation is only available before the booking is confirmed — contact us instead."}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white disabled:hover:text-slate-300"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {(estimate?.make || estimate?.model || estimate?.vehicleType || booking.registrationNumber) && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#0b1e42]">
          <Car className="h-3.5 w-3.5 text-red-600" strokeWidth={2} />
          {[estimate?.make, estimate?.model].filter(Boolean).join(" ") || estimate?.vehicleType || "Vehicle"}
          {booking.registrationNumber && <span className="font-normal text-slate-400">&bull; {booking.registrationNumber}</span>}
        </p>
      )}

      {booking.finalQuote && booking.status !== BOOKING_STATUS.CANCELLED && <PaymentMilestones booking={booking} split={split} />}

      {/* Whichever payment is currently due — sits above the Status/Summary
          tabs (not inside either one) so it's the first thing seen and
          stays visible no matter which tab is selected, instead of being
          buried under Summary only. */}
      {booking.status === BOOKING_STATUS.QUOTE_SENT && booking.finalQuote && (
        <div className="mt-6 rounded-3xl bg-[#0b1220] p-6 text-white sm:p-8">
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Final Quote</p>
          <p className="mt-1 text-3xl font-extrabold">{formatINR(booking.finalQuote)}</p>
          <p className="mt-2 text-sm text-slate-300">
            Reviewed and confirmed by our team. Pay a {split.advancePercent}% advance to lock in your booking.
          </p>
          <Link
            href={`/payment?bookingId=${booking.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Proceed to Payment ({split.advancePercent}% Advance)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {booking.status === BOOKING_STATUS.CONFIRMED && booking.finalQuote && booking.midwayRequested && (
        <div className="mt-6 rounded-3xl bg-[#0b1220] p-6 text-white sm:p-8">
          <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Next Payment</p>
          <p className="mt-1 text-3xl font-extrabold">{formatINR(booking.finalQuote * (split.midwayPercent / 100))}</p>
          <p className="mt-2 text-sm text-slate-300">
            Your booking is confirmed. Pay the {split.midwayPercent}% checkpoint to keep your shipment moving to transit.
          </p>
          <Link
            href={`/payment?bookingId=${booking.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Proceed to Payment ({split.midwayPercent}%)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {booking.status === BOOKING_STATUS.OUT_FOR_DELIVERY &&
        booking.finalQuote &&
        booking.finalRequested &&
        typeof booking.finalPaid !== "number" && (
          <div className="mt-6 rounded-3xl bg-[#0b1220] p-6 text-white sm:p-8">
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Final Payment</p>
            <p className="mt-1 text-3xl font-extrabold">{formatINR(booking.remainingBalance ?? 0)}</p>
            <p className="mt-2 text-sm text-slate-300">
              Your vehicle is out for delivery. Pay your remaining balance to complete the booking.
            </p>
            <Link
              href={`/payment?bookingId=${booking.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Proceed to Payment (Final Balance)
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

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
          <>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
              <p className="text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">Tracking Status</p>
              <div className="mt-6">
                <StatusStepper
                  status={booking.status}
                  statusTimes={booking.statusTimes}
                  inspections={booking.inspections}
                  split={split}
                  booking={booking}
                />
              </div>
            </div>

            {booking.status === BOOKING_STATUS.DELIVERED && (
              <ReviewCard booking={booking} onBookingChange={onBookingChange} />
            )}
          </>
        )}

        {tab === "summary" && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <AddressDetailCard title="Pickup" icon={MapPin} address={pickup} />
              <AddressDetailCard title="Drop-off" icon={MapPin} address={dropoff} />
            </div>

            {(booking.pickupPoc || booking.dropoffPoc) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {booking.pickupPoc && <PocCard title="Pickup Point of Contact" poc={booking.pickupPoc} />}
                {booking.dropoffPoc && <PocCard title="Drop-off Point of Contact" poc={booking.dropoffPoc} />}
              </div>
            )}

            <AddressDetailCard title="Billing" icon={CreditCard} address={billing} simple sameAsNote={billingSameAsPickupNote} />

            <DocumentsCard
              documents={booking.documents}
              registrationNumber={booking.registrationNumber}
              onReupload={triggerReupload}
              busyKey={reuploadKey}
              error={reuploadError}
            />

            <PriceBreakdownCard booking={booking} split={split} />

            <div className="flex flex-wrap gap-3">
              <a
                href={enquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b1e42] shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <MessageCircle className="h-4 w-4 text-red-600" strokeWidth={2} />
                Enquiry
              </a>
              <Link
                href="/my-bookings"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b1e42] shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
              >
                <LayoutList className="h-4 w-4 text-red-600" strokeWidth={2} />
                My Bookings
              </Link>
              {booking.status !== BOOKING_STATUS.CANCELLED && booking.status !== BOOKING_STATUS.DELIVERED && (
                <button
                  type="button"
                  disabled={!canCancel}
                  onClick={() => setCancelModalOpen(true)}
                  title={canCancel ? undefined : "Cancellation is only available before the booking is confirmed — contact us instead."}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white disabled:hover:text-slate-300"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Booking
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MyBookingsClient() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");
  // undefined = loading, null = none found, array = list view, object = detail view
  // Keyed by the id it was loaded for, so a stale detail object is never
  // treated as the list (and vice versa) while navigating between views.
  const [loaded, setLoaded] = useState({ key: undefined, data: undefined });
  const [split, setSplit] = useState(PAYMENT_SPLIT);
  const key = requestedId ?? "";
  const result = loaded.key === key ? loaded.data : undefined;
  // Two call sites (ReviewCard's submit, the rejected-document re-upload)
  // pass a React-setState-style updater function expecting it to run
  // against the current booking; without this, that function itself got
  // stored as `data` instead of its result — rendering off a plain JS
  // function (no booking fields at all) until the next real fetch
  // (navigating away and back, or a refresh) replaced it.
  const setResult = (dataOrUpdater) =>
    setLoaded((prev) => ({
      key,
      data: typeof dataOrUpdater === "function" ? dataOrUpdater(prev.data) : dataOrUpdater,
    }));

  // The list view's getBookings() is scoped to the signed-in account, so a
  // sign-in/out needs to re-fetch it — not just gate the empty state.
  // undefined = not checked yet; without Supabase there's no session to
  // wait on, so it starts resolved (null) instead of hanging forever.
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthModalOpen(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const sessionReady = session !== undefined;

  useEffect(() => {
    if (!sessionReady) return undefined;
    let cancelled = false;
    async function load() {
      const data = requestedId ? await getBooking(requestedId) : await getBookings();
      if (!cancelled) setLoaded({ key: requestedId ?? "", data: data ?? null });
    }
    load();
    return () => {
      cancelled = true;
    };
    // session?.user.id (not the session object itself) as the trigger for
    // "the account changed" — a background token refresh hands
    // onAuthStateChange a new session object every ~50min without the user
    // actually changing, and that shouldn't silently re-fetch the list.
  }, [requestedId, sessionReady, session?.user.id]);

  // Fetched once here (not per-card/per-detail-view) since every status
  // label and payment amount on this page shares the same live split.
  useEffect(() => {
    let cancelled = false;
    getPaymentSplit().then((s) => {
      if (!cancelled) setSplit(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    return <BookingDetailView booking={result} onBookingChange={setResult} split={split} />;
  }

  // List view: every booking as a card. Scoped to the signed-in account
  // (see getBookings), so a signed-out visitor gets a sign-in prompt
  // instead of an empty/"no bookings" state that would misleadingly imply
  // there's nothing tied to them.
  if (isSupabaseConfigured && !session) {
    return (
      <>
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <SignInPrompt onSignIn={() => setAuthModalOpen(true)} />
      </>
    );
  }

  if (!Array.isArray(result) || result.length === 0) return <EmptyState />;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {result.map((booking) => (
        <BookingCard key={booking.id} booking={booking} split={split} />
      ))}
    </div>
  );
}
