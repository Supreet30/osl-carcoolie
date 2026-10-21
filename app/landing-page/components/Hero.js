import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import HeroVideoBackground from "./HeroVideoBackground";

// Stays a plain (non-async) component so /landing-page still prerenders
// statically at build time — only the background itself is admin-editable
// (see HeroVideoBackground.js for why that part fetches client-side instead).
export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-slate-900"
    >
      <HeroVideoBackground />
      {/* Flat dark tint, separate from the directional gradient below —
          real video footage can run much brighter/busier than the designed
          gradient placeholder ever did, so this keeps the white text
          readable across the whole hero, not just near the bottom. */}
      <div className="absolute inset-0 -z-10 bg-black/30" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/40 to-black/10" />

      <div className="mx-auto w-full max-w-5xl px-6 pt-30 text-center sm:pt-36">
        <h1 className="text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-[64px]">
          Always Safe. Always On Time. <span className="text-red-600">Always Tracked.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Hidden costs, damaged cars and zero visibility ruin vehicle transport for most owners.<br />
          Car Coolie fixes it with transparent pricing, trained handling, GPS tracking
          and full insurance, from a car transport company trusted by 20+ businesses across India.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/services/b2c"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
          >
            Get Free Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-[#0b1e42] shadow-lg ring-1 ring-black/5 transition-colors hover:bg-slate-50"
          >
            <Phone className="h-4 w-4" />
            Talk to Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
