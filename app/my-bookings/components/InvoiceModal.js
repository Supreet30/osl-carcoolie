"use client";

import { X, Printer } from "lucide-react";
import { formatINR } from "../../services/b2c/lib/pricing";

// Printable "invoice" built entirely from data already on the booking —
// there's no billing/PDF backend here, so "Print" just triggers the
// browser's own print dialog (Save as PDF works fine from there) scoped to
// #invoice-printable via the print stylesheet below, so the rest of the
// page (nav, other modal chrome) doesn't end up on the page too.
export default function InvoiceModal({ open, onClose, booking }) {
  if (!open) return null;
  const { estimate, pickup, dropoff } = booking;

  const lineItems = estimate
    ? [
        { label: `Transportation (${estimate.fromCity} → ${estimate.toCity})`, amount: estimate.routePrice },
        estimate.vehicleSurcharge ? { label: `Vehicle Type (${estimate.vehicleType})`, amount: estimate.vehicleSurcharge } : null,
        { label: "Service Charges", amount: estimate.serviceCharge },
        estimate.addOnsTotal ? { label: "Value Added Services", amount: estimate.addOnsTotal } : null,
        { label: "GST", amount: estimate.gst },
        estimate.discount ? { label: `Discount${estimate.coupon ? ` (${estimate.coupon.code})` : ""}`, amount: -estimate.discount } : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 py-8 print:static print:bg-white print:p-0" onClick={onClose}>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-printable,
          #invoice-printable * {
            visibility: visible;
          }
          #invoice-printable {
            position: absolute;
            inset: 0;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl print:max-h-none print:rounded-none print:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-8 py-5 print:hidden">
          <h2 className="text-lg font-extrabold text-[#0b1e42]">Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div id="invoice-printable" className="flex-1 overflow-y-auto px-8 py-6 print:overflow-visible print:px-10 print:py-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-extrabold text-[#0b1e42]">
                OSL <span className="text-red-600">Car Coolie</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Vehicle Transportation Services</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Invoice</p>
              <p className="text-sm font-extrabold text-[#0b1e42]">{booking.id}</p>
              <p className="text-xs text-slate-400">
                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Pickup</p>
              <p className="mt-1 text-sm font-semibold text-[#0b1e42]">{pickup?.fullName || "—"}</p>
              <p className="text-sm text-slate-500">
                {[pickup?.house, pickup?.street, pickup?.city, pickup?.pin].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Destination</p>
              <p className="mt-1 text-sm font-semibold text-[#0b1e42]">{dropoff?.fullName || "—"}</p>
              <p className="text-sm text-slate-500">
                {[dropoff?.house, dropoff?.street, dropoff?.city, dropoff?.pin].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          </div>

          {estimate ? (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Price Breakup</p>
              <div className="mt-3 flex flex-col divide-y divide-slate-100 text-sm">
                {lineItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <span className="text-slate-600">{item.label}</span>
                    <span className={`font-semibold ${item.amount < 0 ? "text-green-600" : "text-[#0b1e42]"}`}>
                      {item.amount < 0 ? "-" : ""}
                      {formatINR(Math.abs(item.amount))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-red-50 p-4">
                <span className="text-sm font-extrabold text-[#0b1e42] uppercase">
                  {booking.finalQuote ? "Final Amount" : "Estimated Total"}
                </span>
                <span className="text-xl font-extrabold text-red-600">{formatINR(booking.finalQuote ?? estimate.total)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-6 border-t border-slate-100 pt-6 text-sm text-slate-400">No pricing details saved for this booking.</p>
          )}

          <p className="mt-8 text-center text-[11px] text-slate-400">
            This is a system-generated estimate/invoice for {booking.id} and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
}
