"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  LayoutGrid,
  Maximize2,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "office", label: "Office", icon: Building2 },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "work", label: "Work", icon: Briefcase },
];

// Dummy placeholder — swap in real photography once it exists. Only two
// truck photos live in the repo, cycled across the grid with different
// crops (object-position + scale) rather than pretending to have 8
// distinct shots.
const GALLERY_ITEMS = [
  { category: "work", src: "/servicehero.png", position: "20% 30%", zoom: 1.1, height: 300 },
  { category: "office", src: "/contact-hero-truck.png", position: "60% 40%", zoom: 1, height: 340 },
  { category: "events", src: "/servicehero.png", position: "80% 20%", zoom: 1.3, height: 260 },
  { category: "work", src: "/contact-hero-truck.png", position: "30% 60%", zoom: 1.15, height: 320 },
  { category: "office", src: "/servicehero.png", position: "50% 50%", zoom: 1.4, height: 280 },
  { category: "events", src: "/contact-hero-truck.png", position: "70% 30%", zoom: 1.05, height: 380 },
  { category: "work", src: "/servicehero.png", position: "40% 70%", zoom: 1.25, height: 300 },
  { category: "office", src: "/contact-hero-truck.png", position: "10% 40%", zoom: 1.2, height: 260 },
];

const PAGE_SIZE = 4;

export default function GalleryShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function selectCategory(id) {
    setSelectedCategory(id);
    setVisibleCount(PAGE_SIZE);
  }

  const filteredItems =
    selectedCategory === "all"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[120px] bg-[#0b1e42] px-6 py-14 sm:px-10 sm:py-16">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-white/20" />
          <h2 className="shrink-0 text-3xl font-extrabold text-white sm:text-4xl">
            Explore Our <span className="text-red-600">Moments</span>
          </h2>
          <span className="h-px w-10 bg-white/20" />
        </div>
        <p className="mt-3 text-center text-sm text-slate-400">
          From daily vehicle transport operations to team milestones, here&apos;s a look inside Car
          Coolie.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = id === selectedCategory;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectCategory(id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "bg-white text-[#0b1e42] hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative z-10 -mx-2 mt-10 rounded-[100px] bg-white px-8 py-20 sm:-mx-4">
          {visibleItems.length > 0 ? (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {visibleItems.map((item, i) => (
                <div
                  key={`${item.src}-${i}-${item.category}`}
                  className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl shadow-md"
                  style={{ height: item.height }}
                >
                  <Image
                    src={item.src}
                    alt="CarCoolie carrier truck on the road"
                    fill
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: item.position, transform: `scale(${item.zoom})` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

                  <div className="absolute inset-x-4 bottom-4 flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white">
                      <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-sm font-bold leading-none text-white">On The Move</p>
                      <p className="mt-1 text-xs leading-none text-slate-300">
                        Delivering Trust Nationwide
                      </p>
                    </div>
                  </div>

                  <span className="absolute right-4 bottom-4 flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
                    <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-14 text-center text-sm text-slate-500">
              No moments in this category yet — check back soon.
            </p>
          )}

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Load More
                <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
