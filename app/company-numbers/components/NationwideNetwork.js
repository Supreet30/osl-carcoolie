import Image from "next/image";
import { Link2, MapPin, ThumbsUp } from "lucide-react";

const FEATURES = [
  { icon: Link2, title: "Strong Network", subtitle: "Across 28+ States" },
  { icon: MapPin, title: "650+ Service Locations", subtitle: "And Counting" },
  { icon: ThumbsUp, title: "Thousands of Happy", subtitle: "Journeys Every Month" },
];

const STATS = [
  { value: "28", suffix: "+", label: "States Reached" },
  { value: "650", suffix: "+", label: "Service Locations" },
  { value: "75K", suffix: "+", label: "Happy Customers" },
];

export default function NationwideNetwork() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 sm:grid-cols-[0.85fr_1.2fr_0.75fr]">
        {/* Left — heading, copy, feature list */}
        <div>
          <h2 className="max-w-xs text-5xl font-extrabold leading-tight tracking-tight text-[#0b1e42]">
            From One Journey to a <span className="text-red-600">Nationwide</span> Network
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Our growth is not just about numbers — it&apos;s about the growing network, customers
            and journeys behind them.
          </p>
          <div className="mt-4 h-1 w-10 rounded-full bg-red-600" />

          <ul className="mt-6 flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, title, subtitle }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="leading-snug">
                  <span className="block font-bold text-[#0b1e42]">{title}</span>
                  <span className="block text-sm text-slate-500">{subtitle}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Middle — India network map */}
        <div className="relative h-105 sm:h-130">
          <Image
            src="/cnmap.png"
            alt="Map of CarCoolie's transport network across major Indian cities"
            fill
            className="object-contain"
          />
        </div>

        {/* Right — Growth Snapshot card */}
        <div className="rounded-3xl bg-[#0b1220] p-7 shadow-xl">
          <p className="text-xs font-bold tracking-wide text-red-500 uppercase">Growth Snapshot</p>
          <dl className="mt-4 flex flex-col divide-y divide-white/10">
            {STATS.map(({ value, suffix, label }) => (
              <div key={label} className="py-4 first:pt-0 last:pb-0">
                <dt className="text-4xl font-extrabold text-white">
                  {value}
                  <span className="text-red-500">{suffix}</span>
                </dt>
                <dd className="mt-1 text-sm text-slate-400">{label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Growing every day, across India.
          </p>
        </div>
      </div>
    </section>
  );
}
