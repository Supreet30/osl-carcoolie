"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tag,
  TrendingUp,
} from "lucide-react";
import { BLOG_POSTS } from "../posts";

const CATEGORIES = [
  { id: "all", label: "All Posts", icon: LayoutGrid },
  { id: "Company", label: "Company", icon: Building2 },
  { id: "Industry", label: "Industry", icon: TrendingUp },
  { id: "Guides", label: "Guides", icon: BookOpen },
];

// Dummy placeholder — swap in real blog pillars once they exist. The
// screenshot repeated the exact same "About Blog" lorem-ipsum block three
// times; that reads as an unfinished template rather than a real page, so
// this gives each of the three alternating rows distinct content instead.
const HIGHLIGHTS = [
  {
    tag: "Guides",
    title: "Expert Guides",
    description:
      "Step-by-step advice on preparing your vehicle, choosing between open and enclosed carriers, and knowing exactly what to expect at every stage of transit.",
    image: "/servicehero.png",
  },
  {
    tag: "Industry",
    title: "Industry Insights",
    description:
      "Market trends, regulation updates, and behind-the-scenes looks at how nationwide vehicle logistics actually works — written for anyone who wants to understand the business, not just use it.",
    image: "/contact-hero-truck.png",
  },
  {
    tag: "Company",
    title: "Customer Stories",
    description:
      "Real experiences from dealers, manufacturers, and individual owners who've moved vehicles with CarCoolie — the wins, the lessons, and what made the difference.",
    image: "/core.jpg",
  },
];

// Real per-post data (title, image, author, date, body content) lives in
// ../posts.js so this listing and each /blog/[slug] detail page stay in
// sync — this view only needs the summary fields.
const ARTICLES = BLOG_POSTS;

const ARTICLES_PER_PAGE = 4;

export default function BlogShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  function selectCategory(id) {
    setSelectedCategory(id);
    setCurrentPage(0);
  }

  const filteredHighlights =
    selectedCategory === "all" ? HIGHLIGHTS : HIGHLIGHTS.filter((h) => h.tag === selectedCategory);
  const filteredArticles =
    selectedCategory === "all" ? ARTICLES : ARTICLES.filter((a) => a.tag === selectedCategory);
  const pageCount = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));
  const visibleArticles = filteredArticles.slice(
    currentPage * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE + ARTICLES_PER_PAGE
  );

  return (
    <>
      <section className="relative overflow-hidden bg-white px-6 pt-20 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-red-200" />
            <h2 className="shrink-0 text-4xl font-extrabold text-[#0b1e42]">
              Explore by Categories
            </h2>
            <span className="h-px w-16 bg-red-200" />
          </div>

          <div className="my-8 flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = id === selectedCategory;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectCategory(id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-white text-[#0b1e42] ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-6 py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="relative">
            <span
              aria-hidden
              className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-red-200 lg:block"
            />

            <div className="flex flex-col gap-16 lg:gap-24">
              {filteredHighlights.map(({ title, description, image }, i) => (
                <div
                  key={title}
                  className={`relative flex flex-col items-center gap-10 lg:gap-16 ${
                    i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 ring-4 ring-white lg:block"
                  />

                  <div className="w-full lg:w-1/2">
                    <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-xl">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 1023px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2">
                    <h3 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
                      About <span className="text-red-600">{title}</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-slate-600">{description}</p>
                    <a
                      href="#latest-blogs"
                      className="mt-7 inline-flex items-center rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <span
              aria-hidden
              className="absolute bottom-0 left-1/2 hidden h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-red-600 ring-4 ring-white lg:block"
            />
          </div>
        </div>
      </section>

      <section id="latest-blogs" className="bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <h2 className="shrink-0 text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">
              Latest Articles
            </h2>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {visibleArticles.length > 0 ? (
            <>
              <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {visibleArticles.map(({ slug, category, tag, title, date, image }) => (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-40">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 1023px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">
                        {category}
                      </p>
                      <h3 className="mt-2 text-sm font-extrabold leading-snug text-[#0b1e42] transition-colors group-hover:text-red-600">
                        {title}
                      </h3>
                      <div className="mt-4 flex items-center gap-3 text-[11px] font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" strokeWidth={2} />
                          {date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" strokeWidth={2} />
                          {tag}
                        </span>
                      </div>
                    </div>
                  </Link>
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
              No articles in this category yet — check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
