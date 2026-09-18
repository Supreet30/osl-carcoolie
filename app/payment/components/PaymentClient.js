"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { BOOKING_STATUS, getBooking, updateBooking } from "../../services/b2c/lib/bookingStore";
import { formatINR } from "../../services/b2c/lib/pricing";

// Which booking status this page collects money for, and what paying moves
// the booking to next. Keyed by the CURRENT status so this page can tell,
// from booking.status alone, whether there's actually anything payable
// right now — a booking sitting in some other status (still docs_review,
// or already past midway_paid) has nothing due here.
const PAYMENT_STAGES = {
  [BOOKING_STATUS.QUOTE_SENT]: {
    amountFn: (booking) => Math.round(booking.finalQuote * 0.1),
    heading: "Advance Payment",
    subheading: "Pay a 10% advance to move this booking forward. The remaining balance is settled on delivery.",
    dueLabel: "Advance Due Now (10%)",
    targetStatus: BOOKING_STATUS.ADVANCE_PAID,
    paidField: "advancePaid",
    successHeading: "Advance Payment Received",
  },
  [BOOKING_STATUS.CONFIRMED]: {
    amountFn: (booking) => Math.round(booking.finalQuote * 0.5),
    heading: "50% Payment",
    subheading: "Pay the 50% checkpoint to keep this booking moving. The remaining balance is settled on delivery.",
    dueLabel: "Due Now (50%)",
    targetStatus: BOOKING_STATUS.MIDWAY_PAID,
    paidField: "midwayPaid",
    successHeading: "50% Payment Received",
    // Unlike the advance (implicitly gated by reaching quote_sent at all),
    // the booking sits in "confirmed" for a while before the 50% is
    // actually due — this stage only applies once the admin has explicitly
    // sent the request (see MidwayPaymentCard in the admin panel).
    requiresFlag: "midwayRequested",
  },
  [BOOKING_STATUS.OUT_FOR_DELIVERY]: {
    // Not a flat percentage — whatever's actually left of the final quote
    // once the advance/midway checkpoints and any admin-added charges
    // (pickup, dropoff, tolls) are accounted for. See remainingBalance in
    // bookingStore.js's rowToBooking().
    amountFn: (booking) => booking.remainingBalance ?? 0,
    heading: "Final Payment",
    subheading: "Pay your remaining balance to complete this booking.",
    dueLabel: "Remaining Balance Due",
    // Paying this doesn't move the booking to Delivered by itself — that's
    // a real-world event the admin confirms separately once the vehicle's
    // actually handed over, same as Advance Paid still needs a dedicated
    // "Mark Booking Confirmed" click. Status just stays out_for_delivery.
    targetStatus: null,
    paidField: "finalPaid",
    successHeading: "Final Payment Received",
    requiresFlag: "finalRequested",
  },
};

export default function PaymentClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState(undefined);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const found = bookingId ? await getBooking(bookingId) : null;
      if (!cancelled) setBooking(found);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (booking === undefined) return null;

  if (!booking) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <p className="text-lg font-extrabold text-[#0b1e42]">Booking not found</p>
        <p className="mt-2 text-sm text-slate-500">
          We couldn&apos;t find a booking to pay for. Check your bookings list and try again.
        </p>
        <Link
          href="/my-bookings"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          Go to My Bookings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!booking.finalQuote || booking.status === BOOKING_STATUS.DOCS_REVIEW) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <p className="text-lg font-extrabold text-[#0b1e42]">Payment not available yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Your documents are still under review — the payment option unlocks once we send your final
          quote.
        </p>
        <Link
          href={`/my-bookings?id=${booking.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          View Booking Status
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  let stage = PAYMENT_STAGES[booking.status];
  if (stage?.requiresFlag && !booking[stage.requiresFlag]) stage = undefined;
  const amountDue = stage ? stage.amountFn(booking) : 0;

  if (paid) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
        </span>
        <p className="mt-4 text-lg font-extrabold text-[#0b1e42]">{stage.successHeading}</p>
        <p className="mt-2 text-sm text-slate-500">
          {formatINR(amountDue)} paid towards booking {booking.id}. We&apos;ll be in touch on the next step.
        </p>
        <Link
          href={`/my-bookings?id=${booking.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          View Booking Status
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Booking's current status isn't one this page collects money for —
  // either something's still due elsewhere in the pipeline before this
  // page applies (e.g. advance paid, waiting on the admin to confirm), or
  // every payment this page handles has already gone through.
  if (!stage) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
        </span>
        <p className="mt-4 text-lg font-extrabold text-[#0b1e42]">Nothing to pay right now</p>
        <p className="mt-2 text-sm text-slate-500">
          There&apos;s no payment due for booking {booking.id} at the moment — check My Bookings for the latest
          status.
        </p>
        <Link
          href={`/my-bookings?id=${booking.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          View Booking Status
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  function handlePay(event) {
    event.preventDefault();
    setPaying(true);
    // No real payment gateway wired up yet — this is UI only.
    setTimeout(async () => {
      // targetStatus is null for the final-payment stage — that transition
      // is a separate, deliberate admin action, not automatic on payment
      // (see PAYMENT_STAGES above), so status is left out of the patch
      // entirely rather than sent as null.
      const updates = { [stage.paidField]: amountDue };
      if (stage.targetStatus) updates.status = stage.targetStatus;
      await updateBooking(booking.id, updates);
      setPaying(false);
      setPaid(true);
    }, 1400);
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#0b1e42]">{stage.heading}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{stage.subheading}</p>

      <div className="mt-6 rounded-3xl bg-[#0b1220] p-6 text-white sm:p-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Final Quote</span>
          <span className="font-semibold">{formatINR(booking.finalQuote)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-300">{stage.dueLabel}</span>
          <span className="font-semibold">{formatINR(amountDue)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-lg font-extrabold">Pay Now</span>
          <span className="text-2xl font-extrabold">{formatINR(amountDue)}</span>
        </div>
      </div>

      <form onSubmit={handlePay} className="mt-6 flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
        <label className="block text-sm font-semibold text-[#0b1e42]">
          Card Number
          <span className="relative mt-2 block">
            <CreditCard className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              defaultValue="4242 4242 4242 4242"
              className="w-full rounded-xl bg-slate-50 py-3 pr-4 pl-11 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
            />
          </span>
        </label>
        <div className="grid grid-cols-2 gap-5">
          <label className="block text-sm font-semibold text-[#0b1e42]">
            Expiry
            <input
              type="text"
              placeholder="MM/YY"
              defaultValue="12/28"
              className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
            />
          </label>
          <label className="block text-sm font-semibold text-[#0b1e42]">
            CVV
            <input
              type="text"
              placeholder="123"
              defaultValue="123"
              className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={paying}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-80"
        >
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Payment&hellip;
            </>
          ) : (
            <>
              Pay {formatINR(amountDue)} Now
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> Secure checkout
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> No real charge — demo only
          </span>
        </p>
      </form>
    </div>
  );
}
