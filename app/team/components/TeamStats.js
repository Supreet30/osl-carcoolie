import Image from "next/image";
import { Building2, Globe, TrendingUp, Users } from "lucide-react";

const STATS = [
  { icon: Users, value: "150+", label: "Team Members" },
  { icon: Globe, value: "12+", label: "Nationalities" },
  { icon: Building2, value: "8", label: "Office" },
  { icon: TrendingUp, value: "92%", label: "Retention Rate" },
];

export default function TeamStats() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl bg-[#0b1e42] px-8 py-10 shadow-2xl sm:px-12 sm:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-2/3 opacity-15">
          <Image src="/contact-hero-truck.png" alt="" fill className="object-cover" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0b1e42] via-[#0b1e42]/85 to-transparent"
        />

        <div className="relative mb-10 max-w-2xl">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Our Team In Numbers</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            We come from different places and backgrounds, but we share one goal: delivering trust
            across India&apos;s vehicle transport network.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                <Icon className="h-10 w-10" strokeWidth={2} />
              </span>
              <div>
                <p className="text-4xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-md text-slate-300">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
