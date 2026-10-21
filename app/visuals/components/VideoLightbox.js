"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Same portal/overlay convention as GalleryLightbox.js (itself matching
// AuthModal.js/ApplyModal.js) — fixed inset-0 backdrop, click-outside or the
// X button to close. A plain native <video controls> is "a proper player"
// here (play/pause, seek, volume, fullscreen all come for free), rather
// than a custom-built one.
export default function VideoLightbox({ videos, index, onClose, onNavigate }) {
  const video = videos[index];
  const hasMultiple = videos.length > 1;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (hasMultiple && event.key === "ArrowLeft") onNavigate(-1);
      if (hasMultiple && event.key === "ArrowRight") onNavigate(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate, hasMultiple]);

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/90 px-4 py-8" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(-1);
          }}
          aria-label="Previous video"
          className="absolute top-1/2 left-2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <video key={video.src} controls autoPlay className="aspect-video w-full rounded-2xl bg-black shadow-2xl">
          <source src={video.src} type="video/mp4" />
        </video>
        <p className="mt-3 text-center text-sm font-bold text-white capitalize">{video.title}</p>
      </div>

      {hasMultiple && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(1);
          }}
          aria-label="Next video"
          className="absolute top-1/2 right-2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>,
    document.body
  );
}
