"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Calendar, Car, MapPin, ShieldCheck, Truck } from "lucide-react";

const TRUST_STATS = [
  { icon: Calendar, target: 22, decimals: 0, prefix: "", suffix: "+", label: "Years Experience" },
  { icon: Car, target: 35, decimals: 0, prefix: "", suffix: "L+", label: "Vehicles" },
  { icon: MapPin, target: 27, decimals: 0, prefix: "", suffix: "+", label: "States" },
  { icon: Truck, target: 850, decimals: 0, prefix: "", suffix: "+", label: "Fleet" },
  { icon: ShieldCheck, target: 0.01, decimals: 2, prefix: "<", suffix: "%", label: "Damage Ratio" },
];

// Counts up from 0 to `target` once `active` flips true, eased so it starts
// fast and settles in — reused per stat so each has its own animation frame.
function useCountUp(target, decimals, active, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value.toFixed(decimals);
}

function StatItem({ stat, active, index }) {
  const Icon = stat.icon;
  const value = useCountUp(stat.target, stat.decimals, active);

  return (
    <div className={`flex flex-col items-center px-4 ${index === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-red-500">
        <Icon className="h-7 w-7" strokeWidth={1.9} />
      </span>
      <p className="mt-5 text-4xl font-extrabold tracking-tight text-red-500 sm:text-5xl">
        {stat.prefix}
        {value}
        {stat.suffix}
      </p>
      <p className="mt-2 text-xs font-semibold tracking-widest text-slate-300 uppercase sm:text-sm">
        {stat.label}
      </p>
    </div>
  );
}

export default function TrustBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-white/10 bg-[#0b1e42] px-6 py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[44px_44px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 15%, rgba(220,38,38,0.25), transparent 50%), radial-gradient(circle at 90% 85%, rgba(220,38,38,0.2), transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-6xl text-center"
      >
        <p className="text-xs font-bold tracking-[0.2em] text-red-500 uppercase">Trusted Nationwide</p>
        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Car Coolie By The Numbers</h2>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-5 sm:gap-y-0 sm:divide-x sm:divide-white/10">
          {TRUST_STATS.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} active={inView} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
