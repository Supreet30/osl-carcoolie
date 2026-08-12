"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Play } from "lucide-react";

// Dummy placeholder — swap in real Instagram/YouTube post thumbnails once
// they exist. Only two truck photos live in the repo, cycled across the
// ring (truck content is the honest fit here — reusing a generic office
// stock photo would have nothing to do with a logistics brand's socials).
const basePosts = [
  { id: 1, image: "/servicehero.png", type: "photo" },
  { id: 2, image: "/contact-hero-truck.png", type: "video" },
  { id: 3, image: "/servicehero.png", type: "photo" },
  { id: 4, image: "/contact-hero-truck.png", type: "video" },
  { id: 5, image: "/servicehero.png", type: "photo" },
  { id: 6, image: "/contact-hero-truck.png", type: "video" },
  { id: 7, image: "/servicehero.png", type: "photo" },
  { id: 8, image: "/contact-hero-truck.png", type: "video" },
  { id: 9, image: "/servicehero.png", type: "photo" },
  { id: 10, image: "/contact-hero-truck.png", type: "video" },
];

// Doubled so the ring has enough items to stay full-looking as it turns.
const POSTS = [...basePosts, ...basePosts].map((post, index) => ({
  ...post,
  uniqueId: index,
}));

export default function SocialCarousel() {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const requestRef = useRef(0);
  const speedRef = useRef(0.15);

  const numItems = POSTS.length;
  const theta = 360 / numItems;
  const itemWidth = 240;
  const itemHeight = 380;
  const radius = 850;

  function animate() {
    const targetSpeed = isHovered ? 0 : 0.15;
    speedRef.current += (targetSpeed - speedRef.current) * 0.05;

    setRotation((prev) => prev - speedRef.current);
    requestRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHovered]);

  return (
    <section className="relative w-full overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-4 px-6">
        <span className="h-px flex-1 bg-slate-200" />
        <p className="shrink-0 text-xs font-bold tracking-[0.25em] text-[#0b1e42]">
          EXPLORE MORE ON INSTAGRAM &amp; YOUTUBE
        </p>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/6 bg-linear-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/6 bg-linear-to-l from-white to-transparent" />

      <div
        className="relative mt-14 flex w-full cursor-pointer items-center justify-center"
        style={{ perspective: "2000px", height: `${itemHeight + 60}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d", transform: `rotateY(${rotation}deg)` }}
        >
          {POSTS.map((post, i) => {
            const itemAngle = -i * theta;

            let absoluteAngle = (itemAngle + rotation) % 360;
            if (absoluteAngle < 0) absoluteAngle += 360;
            const diff = Math.min(absoluteAngle, 360 - absoluteAngle);

            const isVisible = diff <= 85;
            const isCenter = diff <= theta / 2;

            const scale = isCenter ? (isHovered ? 1.15 : 1) : 0.85;
            const brightness = isCenter ? (isHovered ? "brightness-105" : "brightness-95") : "brightness-50";
            const shadow = isCenter && isHovered
              ? "shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
              : isCenter
                ? "shadow-xl"
                : "shadow-md";

            const Icon = post.type === "photo" ? Camera : Play;

            return (
              <div
                key={post.uniqueId}
                className="absolute flex items-center justify-center will-change-transform"
                style={{
                  width: `${itemWidth}px`,
                  height: `${itemHeight}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(-${radius}px) scale(${scale})`,
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isVisible ? "auto" : "none",
                  zIndex: isCenter ? 20 : 10,
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out",
                }}
              >
                <Image
                  src={post.image}
                  alt="CarCoolie social media post"
                  fill
                  sizes="240px"
                  priority={i < 6}
                  draggable={false}
                  className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isCenter && isHovered ? "rounded-3xl" : "rounded-2xl"
                  } ${brightness} ${shadow}`}
                />
                <span className="absolute -top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1e42] text-white shadow-lg ring-4 ring-white">
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={2}
                    fill={post.type === "video" ? "currentColor" : "none"}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
