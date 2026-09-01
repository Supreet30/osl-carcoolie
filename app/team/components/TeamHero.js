import Image from "next/image";
import { Settings, ShieldCheck, Users } from "lucide-react";
import Navbar from "../../landing-page/components/Navbar";

const VALUES = [
  { icon: ShieldCheck, prefix: "Driven By", label: "Integrity" },
  { icon: Users, prefix: "United By", label: "Passion" },
  { icon: Settings, prefix: "Committed To", label: "Excellence" },
];

export default function TeamHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      {/* Full-bleed image on the right half with a white gradient blending
          its left edge into the page background — same technique as
          BlogHero, just white instead of navy since this hero is light. */}
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] sm:block lg:w-[52%]">
        <Image src="/team-hero.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-white via-white/40 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <div className="max-w-xl">
          <p className="text-md font-bold text-red-600">Our Team</p>
          <h1 className="mt-3 text-6xl font-extrabold leading-[1.2] tracking-tight">
            <span className="block text-[#0b1e42]">Meet The Team Behind</span>
            <span className="block text-red-600">India&apos;s Vehicle Transport Network</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
            Meet the drivers, coordinators and support staff who work around the clock to move your
            vehicle safely, the team behind every Car Coolie delivery.
          </p>
          <div className="mt-30 flex flex-wrap items-center gap-8">
            {VALUES.map(({ icon: Icon, prefix, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon className="h-8 w-8" strokeWidth={2} />
                </span>
                <p className="text-lg leading-snug">
                  <span className="block text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {prefix}
                  </span>
                  <span className="font-semibold text-[#0b1e42]">{label}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
