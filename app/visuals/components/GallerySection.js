"use client";

import { useState } from "react";
import Image from "next/image";
import { BarChart3, Camera, Maximize2, Play, PlaySquare, RefreshCw, Ship } from "lucide-react";

const CATEGORIES = [
  { id: "photos", label: "Photos", icon: Camera },
  { id: "videos", label: "Videos", icon: PlaySquare },
  { id: "infographics", label: "Infographics", icon: BarChart3 },
];

// Dummy placeholder gallery — swap in real fleet photography once it
// exists. Only two truck photos live in the repo, so they're cycled across
// all 8 tiles with different crops (object-position + scale) rather than
// pretending to have 8 distinct shots.
const GALLERY_ITEMS = [
  { src: "/servicehero.png", position: "20% 30%", zoom: 1.1 },
  { src: "/contact-hero-truck.png", position: "60% 40%", zoom: 1 },
  { src: "/servicehero.png", position: "80% 20%", zoom: 1.3 },
  { src: "/contact-hero-truck.png", position: "30% 60%", zoom: 1.15 },
  { src: "/servicehero.png", position: "50% 50%", zoom: 1.4 },
  { src: "/contact-hero-truck.png", position: "70% 30%", zoom: 1.05 },
  { src: "/servicehero.png", position: "40% 70%", zoom: 1.25 },
  { src: "/contact-hero-truck.png", position: "10% 40%", zoom: 1.2 },
];

function GalleryCard({ item, heightClass }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl ${heightClass}`}>
      <Image
        src={item.src}
        alt="CarCoolie carrier truck on the road"
        fill
        sizes="(max-width: 1023px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ objectPosition: item.position, transform: `scale(${item.zoom})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <div className="absolute inset-x-4 bottom-4 flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white">
          <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-sm font-bold leading-none text-white">On The Move</p>
          <p className="mt-1 text-xs leading-none text-slate-300">Delivering Trust Nationwide</p>
        </div>
      </div>

      <span className="absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </div>
  );
}

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState("photos");

  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[120px] bg-[#0b1e42] px-6 py-14 sm:px-10 sm:py-16">
        <div>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px flex-1 bg-white/20" />
            <p className="shrink-0 text-md font-bold tracking-[0.25em] text-white/70">CATEGORIES</p>
            <span className="h-px flex-1 bg-white/20" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeCategory;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
                    isActive ? "bg-red-600 text-white" : "bg-white text-[#0b1e42] hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {label}
                </button>
              );
            })}
          </div>

          <h2 className="mt-10 text-4xl font-extrabold text-white sm:text-5xl">Our Gallery</h2>

          <div className="relative z-10 -mx-6 mt-10 rounded-[100px] bg-white px-10 py-20 sm:-mx-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <GalleryCard item={GALLERY_ITEMS[0]} heightClass="h-72 sm:h-84" />
              <GalleryCard item={GALLERY_ITEMS[1]} heightClass="h-72 sm:h-84" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <GalleryCard item={GALLERY_ITEMS[2]} heightClass="h-64 sm:h-72" />
              <GalleryCard item={GALLERY_ITEMS[3]} heightClass="h-64 sm:h-72" />
              <GalleryCard item={GALLERY_ITEMS[4]} heightClass="h-64 sm:h-72" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <GalleryCard item={GALLERY_ITEMS[5]} heightClass="h-80 sm:h-96" />
              </div>
              <GalleryCard item={GALLERY_ITEMS[6]} heightClass="h-80 sm:h-96" />
              <GalleryCard item={GALLERY_ITEMS[7]} heightClass="h-80 sm:h-96" />
            </div>
          </div>

          <div className="relative z-10 -mt-16 rounded-[80px] bg-[#132a5c] px-8 py-12 shadow-2xl ring-1 ring-white/10 sm:px-14 sm:py-14">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px flex-1 bg-white/20" />
              <p className="shrink-0 text-md font-bold tracking-[0.25em] text-white/70">FEATURED VIDEO</p>
              <span className="h-px flex-1 bg-white/20" />
            </div>

            <div className="relative mx-auto mt-8 aspect-video max-w-4xl overflow-hidden rounded-[28px] shadow-2xl">
              {/* No port/dockyard footage exists in the repo — a plain dark
                  gradient placeholder stands in for the video thumbnail. */}
              <div className="absolute inset-0 bg-linear-to-br from-[#111827] via-[#0b1e42] to-[#111827]" />
              <Ship
                aria-hidden
                className="absolute inset-0 m-auto h-20 w-20 text-white/10"
                strokeWidth={1}
              />
              <button
                type="button"
                aria-label="Play featured video"
                className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform hover:scale-105"
              >
                <Play className="h-6 w-6 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
