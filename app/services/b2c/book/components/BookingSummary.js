import { Car, Clock, ShieldCheck, Truck, User } from "lucide-react";
import { MOCK_QUOTE, computeQuoteTotals, formatINR } from "../../mockQuote";

export default function BookingSummary() {
  const { base: _base, gst, discount, total } = computeQuoteTotals(true);

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
      <div className="rounded-3xl bg-[#0b1220] p-6 text-white">
        <p className="text-lg font-extrabold">Booking Summary</p>

        <div className="mt-5 flex gap-3">
          <div className="flex flex-col items-center">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white" />
            <span className="w-px flex-1 bg-white/20" />
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Pickup From</p>
              <p className="text-sm font-bold text-white">{MOCK_QUOTE.pickupCity}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Drop At</p>
              <p className="text-sm font-bold text-white">{MOCK_QUOTE.dropCity}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Vehicle Type</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
              <Car className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
              {MOCK_QUOTE.vehicleType}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Pickup Method</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
              <User className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
              {MOCK_QUOTE.pickupMethod}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Date &amp; Slot</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
            <Clock className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
            {MOCK_QUOTE.date} &bull; {MOCK_QUOTE.timeSlot}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Transportation Base</span>
            <span className="font-semibold text-white">{formatINR(MOCK_QUOTE.transportation)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Pickup Service Fee</span>
            <span className="font-semibold text-white">{formatINR(MOCK_QUOTE.serviceCharges)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Value Added Services (VAS)</span>
            <span className="font-semibold text-white">{formatINR(MOCK_QUOTE.valueAddedServices)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">GST (18%)</span>
            <span className="font-semibold text-white">{formatINR(gst)}</span>
          </div>
          <div className="flex items-center justify-between text-green-400">
            <span>Promo: {MOCK_QUOTE.couponCode}</span>
            <span className="font-semibold">-{formatINR(discount)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
          <p className="text-base font-extrabold text-white">Total Payable</p>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-white">{formatINR(total)}</p>
            <p className="text-[11px] text-slate-400">Inclusive of all taxes</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
          <ShieldCheck className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <p className="text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">Safe &amp; Secure</p>
          <p className="text-xs text-slate-500">Insured transport with 24/7 tracking enabled.</p>
        </div>
      </div>

      <div className="relative h-52 overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
        <iframe
          title="Route from New Delhi to Mumbai"
          src="https://www.google.com/maps?saddr=New+Delhi,+India&daddr=Mumbai,+India&output=embed"
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#0b1e42] shadow-md">
          <Truck className="h-3.5 w-3.5 text-red-600" strokeWidth={2} />
          Route distance: {MOCK_QUOTE.distanceApprox}
        </div>
      </div>
    </aside>
  );
}
