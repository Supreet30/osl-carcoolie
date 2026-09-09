"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const ROTATE_INTERVAL_MS = 3000;

// Dummy placeholder content — swap in real posts/case studies/visuals once
// they exist. The right-side mockup photo (res-blog-placeholder) is the
// only such image in the repo, so it's reused across all three categories
// rather than pretending to have a dedicated one per category.
const CATEGORIES = [
  {
    id: "blogs",
    label: "Blogs",
    singular: "Blog",
    caption: "Helpful articles, tips and news from the car transport and vehicle logistics world.",
    image: "/res-blog.jpg",
    items: [
      {
        title: "How to Prepare Your Car for Long-Distance Transport",
        excerpt: "A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "5 Signs You Need a Professional Car Carrier",
        excerpt: "When DIY towing stops making sense — and what to book instead.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "Standard vs Premium Enclosed Transport: Which One Should You Choose?",
        excerpt: "Weighing cost and how much extra protection your vehicle actually needs.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "Understanding Vehicle Insurance During Transit",
        excerpt: "What's covered, what isn't, and questions worth asking upfront.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
    ],
  },
  {
    id: "case-studies",
    label: "Case Studies",
    singular: "Case Study",
    caption: "Real client outcomes from businesses that trust Car Coolie for fleet and vehicle logistics.",
    image: "/res-cs.jpg",
    items: [
      {
        title: "Relocating a 40-Car Dealership Fleet Across 3 States",
        excerpt: "How we coordinated a multi-stop transfer without missing a delivery window.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "Zero-Damage Delivery for a Luxury Car Collector",
        excerpt: "Enclosed carriers and white-glove handling for a 6-vehicle collection.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "Scaling Dealer Stock Transfers for a Growing Retailer",
        excerpt: "Moving from ad-hoc pickups to a recurring weekly logistics schedule.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "24-Hour Turnaround for an Emergency Fleet Move",
        excerpt: "Rapid-response dispatch when a client needed vehicles relocated overnight.A quick pre-pickup checklist to keep your vehicle safe from door to door.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
    ],
  },
  {
    id: "visuals",
    label: "Visuals",
    singular: "Visual",
    caption: "Photos and videos from real vehicle transport operations across India.",
    image: "/res-visuals.jfif",
    items: [
      {
        title: "Behind the Scenes: Loading an Enclosed Carrier",
        excerpt: "A look at how our crews secure vehicles before every trip.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "A Day in the Life of a CarCoolie Driver",
        excerpt: "From pre-trip inspection to final handover, on the road with our fleet.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "Our Fleet, Ready for the Road",
        excerpt: "A closer look at the carriers that move your vehicles nationwide.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
      {
        title: "Tracking Dashboard: Real-Time Visibility",
        excerpt: "What live shipment tracking looks like from the customer side.A quick pre-pickup checklist to keep your vehicle safe from door to door.",
      },
    ],
  },
];

export default function ExploreResources() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const [itemIndex, setItemIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = CATEGORIES.find((c) => c.id === activeId);
  const item = active.items[itemIndex];

  function selectCategory(id) {
    setActiveId(id);
    setItemIndex(0);
  }

  // Advance to the next item every 3s, restarting whenever the category,
  // item, or pause state changes — and pausing entirely on hover.
  useEffect(() => {
    if (paused) return undefined;
    const timer = setTimeout(() => {
      setItemIndex((i) => (i + 1) % active.items.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [active, itemIndex, paused]);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative px-6 pt-14">
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-red-600">Resources</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b1e42] sm:text-4xl">
            EXPLORE OUR <span className="text-red-600">RESOURCES</span>
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr_1fr] lg:gap-10">
          <div className="flex gap-4 overflow-x-auto lg:flex-col lg:overflow-visible lg:border-r lg:border-slate-200 lg:pr-8">
            {CATEGORIES.map((category) => {
              const isActive = category.id === activeId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={`group relative flex h-42 w-56 shrink-0 flex-col justify-end overflow-hidden rounded-2xl text-left shadow-md ring-2 transition-all lg:w-full ${
                    isActive ? "ring-red-500" : "ring-transparent hover:ring-red-200"
                  }`}
                >
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 1023px) 224px, 260px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <p className="relative p-4 pb-0 text-lg font-extrabold text-white">{category.label}</p>
                  <p className="relative px-4 pb-4 pt-1 text-xs leading-snug text-slate-200">
                    {category.caption}
                  </p>
                  <span className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="flex flex-col lg:justify-center"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div key={`${active.id}-${itemIndex}`} style={{ animation: "slideInRight 0.5s ease-out" }}>
              <p className="text-2xl font-bold text-[#0b1e42]">{item.title}</p>
              <p className="mt-3 text-lg leading-relaxed text-slate-600">{item.excerpt}</p>
            </div>

            <a
              href="#"
              className="mt-6 inline-flex w-fit items-center self-start rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Learn More
            </a>
          </div>

          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/res-blog-placeholder.jpg"
              alt="Resource content preview"
              fill
              sizes="(max-width: 1023px) 100vw, 30vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
