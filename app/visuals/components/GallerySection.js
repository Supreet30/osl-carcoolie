"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, Play, Ship } from "lucide-react";
import GalleryLightbox from "./GalleryLightbox";
import VideoLightbox from "./VideoLightbox";

const IMAGES_PER_PAGE = 16;

// Same "swap in the direction travelled" slide used by nothing else in this
// repo yet — Left exits/enters right-to-left, Right the opposite, via
// motion/react (already a dependency, see ResourcesHero.js etc.) rather
// than hand-rolled CSS keyframes.
const SLIDE_VARIANTS = {
  enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? "-100%" : "100%", opacity: 0 }),
};

// Shows one video at a time — Left/Right only move the focus within this
// card (which video is "up"), separate from clicking the card itself, which
// opens the full VideoLightbox player at whichever one is currently focused.
function VideoCard({ video, direction, onOpen, onPrev, onNext, hasMultiple }) {
  return (
    <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-[28px] shadow-2xl">
      <button type="button" onClick={onOpen} className="group absolute inset-0 h-full w-full overflow-hidden text-left">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={video.src}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* preload="metadata" (no `controls`) shows the real first frame
                as a static thumbnail, same effect a poster image would
                give, without needing a separate poster file per video. */}
            <video muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
              <source src={video.src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-linear-to-br from-[#111827]/80 via-[#0b1e42]/60 to-[#111827]/80 transition-opacity group-hover:opacity-70" />
            <Ship aria-hidden className="absolute inset-0 m-auto h-16 w-16 text-white/10" strokeWidth={1} />
            <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform group-hover:scale-105">
              <Play className="h-6 w-6 fill-current" />
            </span>
            <p className="absolute bottom-4 left-4 right-4 text-sm font-bold text-white capitalize">{video.title}</p>
          </motion.div>
        </AnimatePresence>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            aria-label="Previous video"
            className="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Next video"
            className="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}

function GalleryCard({ src, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square overflow-hidden rounded-2xl text-left"
    >
      <Image
        src={src}
        alt="Car Coolie vehicle transport"
        fill
        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </button>
  );
}

export default function GallerySection({ images = [], videos = [] }) {
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [videoLightboxIndex, setVideoLightboxIndex] = useState(null);
  // Which video the inline Featured Video card currently shows — separate
  // from videoLightboxIndex (the full-player modal), which always opens on
  // whichever one is focused here. featuredDirection drives VideoCard's
  // slide animation (+1 = travelling right/forward, -1 = left/backward).
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredDirection, setFeaturedDirection] = useState(1);

  function navigateVideoLightbox(delta) {
    setVideoLightboxIndex((prev) => (prev === null ? prev : (prev + delta + videos.length) % videos.length));
  }

  function navigateFeatured(delta) {
    setFeaturedDirection(delta);
    setFeaturedIndex((prev) => (prev + delta + videos.length) % videos.length);
  }

  const totalPages = Math.max(1, Math.ceil(images.length / IMAGES_PER_PAGE));
  const pageStart = (page - 1) * IMAGES_PER_PAGE;
  const pageImages = images.map((src, i) => ({ src, i })).slice(pageStart, pageStart + IMAGES_PER_PAGE);

  function goToPage(next) {
    setPage(Math.min(Math.max(next, 1), totalPages));
  }

  function navigateLightbox(delta) {
    setLightboxIndex((prev) => {
      if (prev === null) return prev;
      const next = (prev + delta + images.length) % images.length;
      // Keeps the grid's own page in sync with whatever image the lightbox
      // lands on, so closing it leaves the gallery scrolled to the right page.
      setPage(Math.floor(next / IMAGES_PER_PAGE) + 1);
      return next;
    });
  }

  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[120px] bg-[#0b1e42] px-6 py-14 sm:px-10 sm:py-16">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-white sm:text-5xl">Our Gallery</h2>

          <div className="relative z-10 -mx-6 mt-10 rounded-[100px] bg-white px-10 py-20 sm:-mx-10">
            {images.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No photos uploaded yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {pageImages.map(({ src, i }) => (
                    <GalleryCard key={src} src={src} onOpen={() => setLightboxIndex(i)} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => goToPage(page - 1)}
                      aria-label="Previous page"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#0b1e42] transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-bold text-[#0b1e42]">
                      Page {page} of {totalPages}
                    </p>
                    <button
                      type="button"
                      disabled={page === totalPages}
                      onClick={() => goToPage(page + 1)}
                      aria-label="Next page"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#0b1e42] transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="relative z-10 -mt-16 rounded-[80px] bg-[#132a5c] px-8 py-12 shadow-2xl ring-1 ring-white/10 sm:px-14 sm:py-14">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px flex-1 bg-white/20" />
              <p className="shrink-0 text-md font-bold tracking-[0.25em] text-white/70">FEATURED VIDEO</p>
              <span className="h-px flex-1 bg-white/20" />
            </div>
            <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-slate-300">
              Follow our journey and stay updated with real moments from real vehicle deliveries
              across India.
            </p>

            {videos.length === 0 ? (
              <div className="relative mx-auto mt-8 aspect-video max-w-4xl overflow-hidden rounded-[28px] shadow-2xl">
                {/* No footage uploaded to public/visuals-videos yet — a plain
                    dark gradient placeholder stands in for the thumbnail. */}
                <div className="absolute inset-0 bg-linear-to-br from-[#111827] via-[#0b1e42] to-[#111827]" />
                <Ship aria-hidden className="absolute inset-0 m-auto h-20 w-20 text-white/10" strokeWidth={1} />
                <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600/50 text-white">
                  <Play className="h-6 w-6 fill-current" />
                </span>
              </div>
            ) : (
              <div className="mt-8">
                <VideoCard
                  video={videos[featuredIndex]}
                  direction={featuredDirection}
                  onOpen={() => setVideoLightboxIndex(featuredIndex)}
                  onPrev={() => navigateFeatured(-1)}
                  onNext={() => navigateFeatured(1)}
                  hasMultiple={videos.length > 1}
                />
                {videos.length > 1 && (
                  <p className="mt-4 text-center text-xs font-bold text-white/60">
                    {featuredIndex + 1} / {videos.length}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={navigateLightbox}
        />
      )}

      {videoLightboxIndex !== null && (
        <VideoLightbox
          videos={videos}
          index={videoLightboxIndex}
          onClose={() => setVideoLightboxIndex(null)}
          onNavigate={navigateVideoLightbox}
        />
      )}
    </section>
  );
}
