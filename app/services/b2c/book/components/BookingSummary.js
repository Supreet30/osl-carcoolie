"use client";

import { Car, Clock, MapPin, ShieldCheck, User } from "lucide-react";
import { formatINR } from "../../lib/pricing";

const PICKUP_METHOD_LABELS = { self: "Self Drop-off", driver: "Driver Pickup" };
const DROPOFF_METHOD_LABELS = { self: "Self Pickup", driver: "Driver Drop-off" };

function cityLabel(city, pin) {
  if (!city) return "—";
  return pin ? `${city}, ${pin}` : city;
}

// `details.date` is the DatePicker's raw ISO value (YYYY-MM-DD) — display
// it the same friendly way the picker itself shows it ("15 Sept 2026").
function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookingSummary({ estimate, details }) {
  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-28">
      <div className="rounded-3xl bg-[#0b1220] p-6 text-white">
        <p className="text-lg font-extrabold">Booking Summary</p>

        {!estimate ? (
          <p className="mt-5 text-sm text-slate-400">
            No estimate found for this session yet — figures here will fill in once you get one from{" "}
            <span className="font-semibold text-white">Get an Estimate</span>.
          </p>
        ) : (
          <>
            <div className="mt-5 flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white" />
                <span className="w-px flex-1 bg-white/20" />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Pickup From</p>
                  <p className="text-sm font-bold text-white">{cityLabel(estimate.fromCity, estimate.pickupPin)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Drop At</p>
                  <p className="text-sm font-bold text-white">{cityLabel(estimate.toCity, estimate.destinationPin)}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Vehicle Type</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Car className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
                  {estimate.vehicleType || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Pickup Method</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <User className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
                  {PICKUP_METHOD_LABELS[details?.pickupMethod] ?? "—"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Date &amp; Slot</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                <Clock className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
                {formatDate(details?.date) || "Not set"} &bull; {details?.timeSlot || "Not set"}
              </p>
            </div>

            {details?.dropoffMethod && (
              <div className="mt-4">
                <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Drop-off Method</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <MapPin className="h-3.5 w-3.5 text-red-500" strokeWidth={2} />
                  {DROPOFF_METHOD_LABELS[details.dropoffMethod] ?? "—"}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Transportation Base</span>
                <span className="font-semibold text-white">{formatINR(estimate.routePrice)}</span>
              </div>
              {Boolean(estimate.vehicleSurcharge) && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Vehicle Type ({estimate.vehicleType})</span>
                  <span className={`font-semibold ${estimate.vehicleSurcharge > 0 ? "text-white" : "text-green-400"}`}>
                    {estimate.vehicleSurcharge > 0 ? "+" : "-"}
                    {formatINR(Math.abs(estimate.vehicleSurcharge))}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Pickup Service Fee</span>
                <span className="font-semibold text-white">{formatINR(estimate.serviceCharge)}</span>
              </div>
              {estimate.addOnsTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Value Added Services (VAS)</span>
                  <span className="font-semibold text-white">{formatINR(estimate.addOnsTotal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">GST (18%)</span>
                <span className="font-semibold text-white">{formatINR(estimate.gst)}</span>
              </div>
              {estimate.coupon && (
                <div className="flex items-center justify-between text-green-400">
                  <span>Promo: {estimate.coupon.code}</span>
                  <span className="font-semibold">-{formatINR(estimate.discount)}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <p className="text-base font-extrabold text-white">Estimated Total</p>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-white">{formatINR(estimate.total)}</p>
                <p className="text-[11px] text-slate-400">Estimate &bull; final quote after review</p>
              </div>
            </div>
          </>
        )}
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
    </aside>
  );
}
