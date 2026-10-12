"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { MapPin, ShieldCheck, Truck, Users } from "lucide-react";
import Navbar from "../../landing-page/components/Navbar";

const STATS = [
  { icon: Truck, value: "35L+", label: "Vehicles Delivered" },
  { icon: MapPin, value: "27+", label: "States Covered" },
  { icon: Users, value: "75K+", label: "Happy Customers" },
  { icon: ShieldCheck, value: ">99.89%", label: "On-Time Delivery" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function CaseStudiesHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
          className="max-w-lg"
        >
          <motion.h1 variants={fadeUp} className="text-6xl font-extrabold leading-[1.2] tracking-tight">
            <span className="block text-[#0b1e42]">Real Vehicle Logistics</span>
            <span className="block">
              <span className="text-[#0b1e42]">Results, </span>
              <span className="text-red-600">Backed</span>
            </span>
            <span className="block text-red-600">By Data</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-md text-base leading-relaxed text-slate-600">
            From manufacturers to dealerships and individual owners, see how our nationwide vehicle
            transportation network delivers speed, safety and reliability at scale.
          </motion.p>

          <motion.div variants={container} className="mt-10 grid grid-cols-4 gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <motion.div key={label} variants={fadeUp}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon className="h-8 w-8" strokeWidth={2} />
                </span>
                <p className="mt-3 text-xl font-extrabold text-[#0b1e42]">{value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          {/* Sized well past the grid column and positioned absolute so it
              bleeds beyond the max-w-6xl container — only the section's own
              overflow-hidden edge (near the viewport edge) clips it, not
              the content max-width. */}
          <div className="relative aspect-3/2 w-[110vw] max-w-none sm:w-280 lg:absolute lg:top-1/2 lg:-left-50 lg:-translate-y-4/7">
            <Image
              src="/cs-hero.png"
              alt="CarCoolie carrier truck loaded with vehicles"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 1400px"
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>
      </section>
    </>
  );
}
