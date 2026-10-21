"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Same portal/overlay convention as AuthModal.js/ApplyModal.js — fixed
// inset-0 backdrop, click-outside or the X button to close. Navigates
// across the *full* image list (not just the current gallery page), so
// Left/Right never dead-ends at a page boundary.
export default function GalleryLightbox({ images, index, onClose, onNavigate }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate(-1);
      if (event.key === "ArrowRight") onNavigate(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

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

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate(-1);
        }}
        aria-label="Previous image"
        className="absolute top-1/2 left-2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="relative h-full max-h-[80vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <Image
          key={images[index]}
          src={images[index]}
          alt={`Car Coolie gallery photo ${index + 1}`}
          fill
          sizes="100vw"
          priority
          className="object-contain"
        />
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate(1);
        }}
        aria-label="Next image"
        className="absolute top-1/2 right-2 flex h-11 w-11 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-white/70">
        {index + 1} / {images.length}
      </p>
    </div>,
    document.body
  );
}
