import Link from "next/link";
import { ArrowRight, Headset, Truck } from "lucide-react";

export default function B2cCta() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-slate-50 px-8 py-14 text-center ring-1 ring-slate-100 sm:px-16 sm:py-16">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
          <Truck className="h-6 w-6" strokeWidth={2} />
        </span>

        <h2 className="mt-6 text-5xl font-extrabold text-[#0b1e42]  ">Ready to Move Your Car?</h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500">
          Get a quick estimate and let CarCoolie handle the journey safely from pickup to delivery.
        </p>

        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#quote"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
          >
            Get Estimated Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#0b1e42] ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
          >
            <Headset className="h-4 w-4" />
            Talk to an Expert
          </Link>
        </div>

        <svg
          aria-hidden
          viewBox="0 0 1000 40"
          preserveAspectRatio="none"
          className="absolute right-0 bottom-8 left-0 h-6 w-full text-red-200"
        >
          <path
            d="M0 20 C 125 -5, 208 45, 333 20 C 458 -5, 542 45, 667 20 C 792 -5, 875 45, 1000 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </section>
  );
}
