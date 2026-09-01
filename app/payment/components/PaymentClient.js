"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { BOOKING_STATUS, getBooking, updateBooking } from "../../services/b2c/lib/bookingStore";
import { formatINR } from "../../services/b2c/lib/pricing";

const ADVANCE_RATE = 0.3;

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

  const advanceAmount = Math.round(booking.finalQuote * ADVANCE_RATE);

  if (paid || booking.status === BOOKING_STATUS.ADVANCE_PAID || booking.status === BOOKING_STATUS.CONFIRMED) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
        </span>
        <p className="mt-4 text-lg font-extrabold text-[#0b1e42]">Advance Payment Received</p>
        <p className="mt-2 text-sm text-slate-500">
          {formatINR(advanceAmount)} paid towards booking {booking.id}. We&apos;ll be in touch to confirm
          pickup.
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
      await updateBooking(booking.id, { status: BOOKING_STATUS.ADVANCE_PAID, advancePaid: advanceAmount });
      setPaying(false);
      setPaid(true);
    }, 1400);
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#0b1e42]">Advance Payment</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Pay a 30% advance to confirm booking {booking.id}. The remaining balance is settled on delivery.
      </p>

      <div className="mt-6 rounded-3xl bg-[#0b1220] p-6 text-white sm:p-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Final Quote</span>
          <span className="font-semibold">{formatINR(booking.finalQuote)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-300">Advance Due Now (30%)</span>
          <span className="font-semibold">{formatINR(advanceAmount)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-lg font-extrabold">Pay Now</span>
          <span className="text-2xl font-extrabold">{formatINR(advanceAmount)}</span>
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
              Pay {formatINR(advanceAmount)} Now
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
