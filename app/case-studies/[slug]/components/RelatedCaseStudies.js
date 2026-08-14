"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Factory,
  HeartPulse,
  Landmark,
  PackageSearch,
  ShoppingCart,
  Truck,
} from "lucide-react";

// Keyed by `industry` (a plain string, safe to pass from the server page
// into this Client Component) rather than an `icon` field carrying a
// component reference — lucide icon components can't cross that boundary
// as props. Falls back to Building2 for the FEATURED_STUDIES entries,
// whose industries (Automotive, BFSI) already resolve above anyway.
const INDUSTRY_ICONS = {
  Automotive: Car,
  BFSI: Landmark,
  Healthcare: HeartPulse,
  Retail: ShoppingCart,
  "E-commerce": PackageSearch,
  Manufacturing: Factory,
};

const STUDIES_PER_PAGE = 3;

export default function RelatedCaseStudies({ studies }) {
  const [page, setPage] = useState(0);

  if (studies.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(studies.length / STUDIES_PER_PAGE));
  const visibleStudies = studies.slice(page * STUDIES_PER_PAGE, page * STUDIES_PER_PAGE + STUDIES_PER_PAGE);

  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <div className="flex shrink-0 items-center gap-3">
            <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
            <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">More Case Studies</h2>
            <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
          </div>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {pageCount > 1 && (
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous case studies"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-400 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page === pageCount - 1}
              aria-label="Next case studies"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {visibleStudies.map(({ slug, industry, category, title, description, image }) => {
            const Icon = INDUSTRY_ICONS[industry] ?? Building2;
            return (
              <Link
                key={slug}
                href={`/case-studies/${slug}`}
                className="group rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="relative z-10 -mt-6 ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-1 ring-slate-100">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>

                <div className="mt-3 px-1 pb-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">
                    {category}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#0b1e42]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition-colors group-hover:text-red-700">
                    View Case Study
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Explore More Case Studies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
