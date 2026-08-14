import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "../../landing-page/components/Navbar";

export default function UsVsMarketHero() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      {/* Full-bleed image on the right half with a white gradient blending
          its left edge into the page background — same technique/image as
          TeamHero, since this hero is light too. */}
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] sm:block lg:w-[52%]">
        <Image src="/team-hero.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-white via-white/40 to-transparent" />
      </div>

      <Navbar />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-extrabold leading-[1.2] tracking-tight">
            <span className="block text-[#0b1e42]">More Than Transport.</span>
            <span className="block text-[#0b1e42]">
              A <span className="text-red-600">Better Way to</span>
            </span>
            <span className="block text-red-600">Move Your Car.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
            From pickup to delivery, CarCoolie combines professional handling, transparent
            pricing and nationwide reach to make car transportation simple, safe and reliable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#compare"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              Compare CarCoolie
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#different"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#0b1e42] shadow-lg ring-1 ring-slate-900/10 transition-colors hover:bg-slate-50"
            >
              See How We're Different
              <ArrowRight className="h-4 w-4 text-red-600" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
