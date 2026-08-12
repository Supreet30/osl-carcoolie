import Image from "next/image";
import { ArrowRight, Calendar, Check, Clock, Link2 } from "lucide-react";

// Dummy placeholder — swap in the real latest post once one exists.
const CHECKLIST = [
  "Essential steps before handing over your car",
  "Items to remove from the vehicle",
  "How we ensure safe & secure car delivery",
  "What to expect on delivery day",
];

// lucide-react dropped brand/social glyphs (Facebook, LinkedIn, etc.) a
// while back over trademark concerns — only generic icons remain, so
// Facebook/LinkedIn are rendered as plain text glyphs instead.
const SHARE_LINKS = [
  { label: "Share on Facebook", glyph: "f" },
  { label: "Share on LinkedIn", glyph: "in" },
  { label: "Copy link", icon: Link2 },
];

export default function LatestResource() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">Latest Resources</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b1e42] sm:text-4xl">
          LATEST ACROSS <span className="text-red-600">RESOURCES</span>
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-stretch lg:gap-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">Latest Blog</p>
            <h3 className="mt-3 text-2xl font-extrabold leading-snug text-[#0b1e42]">
              How to Prepare Your Car for Safe Transport
            </h3>

            <ul className="mt-6 space-y-3">
              {CHECKLIST.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-red-600" strokeWidth={2} />
                20 May, 2024
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-red-600" strokeWidth={2} />
                5 Min Read
              </span>
            </div>

            <a
              href="#"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-md font-semibold text-white transition-colors hover:bg-red-700"
            >
              Read Full Article
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="mt-6 flex items-center gap-3">
              <p className="text-sm font-bold text-[#0b1e42]">Share This Article</p>
              <div className="flex items-center gap-2">
                {SHARE_LINKS.map(({ label, glyph, icon: Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                  >
                    {Icon ? (
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <span className="text-xs font-extrabold leading-none">{glyph}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="relative aspect-2/3 overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/res-new-blog.jpg"
                  alt="Latest blog preview — writing a car transport story"
                  fill
                  sizes="(max-width: 1023px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
