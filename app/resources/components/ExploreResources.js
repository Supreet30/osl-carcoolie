"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, Briefcase, FileText, Image as ImageIcon } from "lucide-react";

// Dummy placeholder content — swap in real posts/case studies/visuals once
// they exist. The right-side mockup photo (res-blog-placeholder) is the
// only such image in the repo, so it's reused across all three categories
// rather than pretending to have a dedicated one per category.
const CATEGORIES = [
  {
    id: "blogs",
    icon: FileText,
    label: "Blogs",
    caption: "Helpful articles, tips and news from the car transport and vehicle logistics world.",
    title: "How to Prepare Your Car for Long-Distance Transport",
    description: "A quick pre-pickup checklist to keep your vehicle safe from door to door.",
  },
  {
    id: "case-studies",
    icon: Briefcase,
    label: "Case Studies",
    caption: "Real client outcomes from businesses that trust Car Coolie for fleet and vehicle logistics.",
    title: "Relocating a 40-Car Dealership Fleet Across 3 States",
    description: "How we coordinated a multi-stop transfer without missing a delivery window.",
  },
  {
    id: "visuals",
    icon: ImageIcon,
    label: "Visuals",
    caption: "Photos and videos from real vehicle transport operations across India.",
    title: "Behind the Scenes: Loading an Enclosed Carrier",
    description: "A look at how our crews secure vehicles before every trip.",
  },
];

const railContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function ExploreResources() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const activeIndex = CATEGORIES.findIndex((c) => c.id === activeId);
  const active = CATEGORIES[activeIndex];

  function focusTab(index) {
    const next = CATEGORIES[(index + CATEGORIES.length) % CATEGORIES.length];
    setActiveId(next.id);
    document.getElementById(`resource-tab-${next.id}`)?.focus();
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold text-red-600">Resources</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b1e42] sm:text-4xl">
            EXPLORE OUR <span className="text-red-600">RESOURCES</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={railContainer}
          role="tablist"
          aria-label="Resource categories"
          className="mt-8 grid gap-2.5 rounded-[26px] border border-red-100 bg-red-50 p-2.5 sm:grid-cols-3"
        >
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const isActive = category.id === activeId;
            return (
              <motion.button
                key={category.id}
                id={`resource-tab-${category.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                variants={fadeUp}
                onClick={() => setActiveId(category.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") focusTab(index + 1);
                  if (e.key === "ArrowLeft") focusTab(index - 1);
                }}
                className={`group grid grid-cols-[54px_1fr_34px] items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${
                  isActive
                    ? "border-transparent bg-red-600 text-white shadow-xl shadow-red-600/30"
                    : "border-transparent bg-white text-[#0b1e42] hover:-translate-y-1 hover:border-red-600 hover:shadow-xl hover:shadow-red-600/15"
                }`}
              >
                <span
                  key={isActive ? `${category.id}-active` : category.id}
                  className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                    isActive ? "bg-white text-red-600" : "bg-red-50 text-red-600"
                  }`}
                  style={isActive ? { animation: "exploreTabPop 0.5s" } : undefined}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-xl font-bold ${isActive ? "text-white" : "text-[#0b1e42]"}`}>
                    {category.label}
                  </span>
                  <span
                    className={`mt-1 block text-[13.5px] leading-snug ${isActive ? "text-white/90" : "text-slate-500"}`}
                  >
                    {category.caption}
                  </span>
                </span>
                <span
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    isActive ? "bg-white text-red-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <div aria-hidden className="mx-auto mt-8 h-px w-full bg-red-600" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.15 }}
          role="tabpanel"
          aria-live="polite"
          className="relative mt-8 grid overflow-hidden rounded-[28px] border border-red-100 bg-white p-9 sm:grid-cols-[1.1fr_0.9fr] sm:gap-14 sm:p-14"
        >
          <span
            aria-hidden
            className="absolute top-11 bottom-11 left-0 hidden w-[5px] rounded-r-full bg-red-600 sm:block"
          />

          <div key={active.id} style={{ animation: "fadeIn 0.4s ease-out" }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white">
              <span
                className="h-1.5 w-1.5 rounded-full bg-white"
                style={{ animation: "exploreChipPulse 1.6s infinite" }}
              />
              {active.label}
            </span>
            <h3 className="text-2xl font-extrabold leading-tight text-[#0b1e42] sm:text-4xl">{active.title}</h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-500 sm:text-base">
              {active.description}
            </p>
            <a
              href="#"
              className="mt-7 inline-flex items-center rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-colors hover:bg-red-700"
            >
              Learn More
            </a>
          </div>

          <div className="relative mx-auto mt-10 w-full max-w-70 sm:mt-0">
            <div
              aria-hidden
              className="absolute -right-6 -bottom-6 h-28 w-28 opacity-50"
              style={{
                backgroundImage: "radial-gradient(#dc2626 2.5px, transparent 3px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="relative aspect-3/4 overflow-hidden rounded-[22px] shadow-xl">
              <Image
                src="/res-blog-placeholder.jpg"
                alt="Resource content preview"
                fill
                sizes="(max-width: 1023px) 100vw, 30vw"
                className="object-cover"
              />
            </div>
            <span className="absolute -top-5 -right-5 flex h-[62px] w-[62px] items-center justify-center rounded-full border-4 border-white bg-[#0b1e42] text-[11px] font-bold tracking-wide text-white">
              NEW
              <span
                aria-hidden
                className="absolute -inset-1 rounded-full border-2 border-[#0b1e42]"
                style={{ animation: "exploreBadgeRing 2s infinite" }}
              />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
