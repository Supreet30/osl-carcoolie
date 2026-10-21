"use client";

import { useEffect, useState } from "react";
import { getHeroVideoUrl } from "../lib/settings";

// Split out from Hero.js on purpose: Hero.js (and the rest of /landing-page)
// stays a plain static component so the page still prerenders at build
// time, same as before this existed. Only this one piece fetches
// client-side — same convention as every other admin-editable bit of
// customer-facing content in this codebase (getDocumentFormats,
// getAddOnServices, etc.) — so uploading a new video from carcoolie-admin's
// Landing Page panel goes live immediately, not just on the next deploy.
// Starts (and stays, until the fetch resolves) on the gradient placeholder,
// so there's no layout shift once the real background decides which to show.
export default function HeroVideoBackground() {
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getHeroVideoUrl().then((url) => {
      if (!cancelled) setVideoUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (videoUrl) {
    return (
      <video autoPlay muted loop playsInline className="absolute inset-0 -z-20 h-full w-full object-cover">
        <source src={videoUrl} type="video/mp4" />
      </video>
    );
  }

  return <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_30%,#c2410c_70%,#f59e0b_100%)]" />;
}
