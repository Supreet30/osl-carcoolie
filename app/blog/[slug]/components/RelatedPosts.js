"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const POSTS_PER_PAGE = 3;

export default function RelatedPosts({ posts }) {
  const [page, setPage] = useState(0);

  if (posts.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const visiblePosts = posts.slice(page * POSTS_PER_PAGE, page * POSTS_PER_PAGE + POSTS_PER_PAGE);

  return (
    <section className="relative overflow-hidden bg-slate-50 px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">Related Posts</h2>

          {pageCount > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous related posts"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-400 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page === pageCount - 1}
                aria-label="Next related posts"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {visiblePosts.map(({ slug, category, title, date, image }) => (
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
                  sizes="(max-width: 1023px) 100vw, 33vw"
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
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Browse All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
