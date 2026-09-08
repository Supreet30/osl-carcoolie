import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const CHECKS = ["Safe & Secure", "Nationwide Reach", "Dedicated Support"];

export default function CompanyNumbersCta() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0b1220] px-6 py-20">
      {/* Full-bleed, edge-to-edge — unlike the rounded CTA cards elsewhere,
          this section's background spans the whole viewport width. */}
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 w-full opacity-40 sm:w-[65%]">
        <Image src="/finalimages/company-numbers/hero.JPG" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0b1220] via-[#0b1220]/85 to-[#0b1220]/40" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-red-900/20 via-transparent to-transparent" />

      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold tracking-wide text-red-500 uppercase">Ready to Move?</p>
        <h2 className="mt-3 max-w-xl text-5xl font-extrabold leading-[1.15] text-white sm:text-6xl">
          Your Car Deserves More Than Just a Ride.
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
          Experience safe, reliable, and transparent car transportation backed by a growing
          nationwide network.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-bold tracking-wide text-white uppercase shadow-lg transition-colors hover:bg-red-700"
          >
            Get a Transport Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:text-red-400"
          >
            Explore Our Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          {CHECKS.map((label) => (
            <span
              key={label}
              className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-300 uppercase"
            >
              <Check className="h-4 w-4 shrink-0 text-red-500" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
