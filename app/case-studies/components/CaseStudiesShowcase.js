"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { FEATURED_STUDIES, MORE_CASE_STUDIES } from "../case-studies";

const INDUSTRIES = ["All", "BFSI", "Automotive", "Healthcare", "Retail", "E-commerce", "Manufacturing"];

const CASE_STUDIES_PER_PAGE = 3;

export default function CaseStudiesShowcase() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  function selectIndustry(industry) {
    setSelectedIndustry(industry);
    setActiveIndex(0);
    setCurrentPage(0);
  }

  const filteredFeatured =
    selectedIndustry === "All"
      ? FEATURED_STUDIES
      : FEATURED_STUDIES.filter((s) => s.industry === selectedIndustry);
  const featured = filteredFeatured[activeIndex] ?? null;

  function goPrev() {
    setActiveIndex((i) => (i === 0 ? filteredFeatured.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i + 1) % filteredFeatured.length);
  }

  const filteredMore =
    selectedIndustry === "All"
      ? MORE_CASE_STUDIES
      : MORE_CASE_STUDIES.filter((s) => s.category === selectedIndustry);
  const pageCount = Math.max(1, Math.ceil(filteredMore.length / CASE_STUDIES_PER_PAGE));
  const visibleCaseStudies = filteredMore.slice(
    currentPage * CASE_STUDIES_PER_PAGE,
    currentPage * CASE_STUDIES_PER_PAGE + CASE_STUDIES_PER_PAGE
  );

  return (
    <>
      <section className="bg-white px-6 pt-20 sm:pt-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[#0b1e42] px-8 py-10 sm:px-12">
          <p className="text-center text-xs font-bold tracking-[0.25em] text-white/50">
            EXPLORE BY INDUSTRY
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {INDUSTRIES.map((industry) => {
              const isActive = industry === selectedIndustry;
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => selectIndustry(industry)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "border border-white/15 text-white hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {featured && (
        <section className="bg-white px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-red-600">Featured Case Study</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b1e42] sm:text-4xl">
                  EXPLORE OUR <span className="text-red-600">CASE STUDIES..</span>
                </h2>
              </div>
              {filteredFeatured.length > 1 && (
                <div className="mt-6 flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous case study"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next case study"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-10 grid overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 lg:grid-cols-2">
              <div className="relative h-96 lg:h-auto">
                <Image
                  key={featured.image + featured.title}
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover"
                  style={{ animation: "fadeIn 0.4s ease-out" }}
                />
              </div>

              <div key={featured.title} className="p-8 sm:p-12" style={{ animation: "fadeIn 0.4s ease-out" }}>
                <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">
                  {featured.category}
                </p>
                <h3 className="mt-4 text-2xl font-extrabold leading-tight text-[#0b1e42] sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{featured.description}</p>

                <div className="mt-8 flex flex-wrap gap-8">
                  {featured.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-extrabold text-[#0b1e42]">{stat.value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/case-studies/${featured.slug}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-red-600 transition-colors hover:text-red-700"
                >
                  Read Full Story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-50 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <div className="flex shrink-0 items-center gap-3">
              <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
              <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">More Case Studies</h2>
              <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
            </div>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {visibleCaseStudies.length > 0 ? (
            <>
              <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCaseStudies.map(({ slug, category, title, description, icon: Icon }) => (
                  <div
                    key={slug}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
                  >
                    <div className="relative h-60">
                      <Image
                        src="/contact-hero-truck.png"
                        alt={title}
                        fill
                        sizes="(max-width: 1023px) 100vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-md">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                        {category}
                      </p>
                      <h3 className="mt-2 text-xl font-extrabold text-[#0b1e42]">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                      <Link
                        href={`/case-studies/${slug}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition-colors hover:text-red-700"
                      >
                        View Case Study
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {pageCount > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    aria-label="Previous page"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(i)}
                      aria-label={`Go to page ${i + 1}`}
                      aria-current={currentPage === i ? "page" : undefined}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        currentPage === i
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={currentPage === pageCount - 1}
                    aria-label="Next page"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="mt-14 text-center text-sm text-slate-500">
              No case studies for this industry yet — check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
