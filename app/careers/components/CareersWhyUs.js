import { HeartHandshake, Shield, TrendingUp } from "lucide-react";

const VALUES = [
  {
    icon: TrendingUp,
    title: "Real Growth",
    description: "A fast-growing vehicle logistics network with new roles opening up as we expand across India.",
  },
  {
    icon: HeartHandshake,
    title: "A Team That Backs You",
    description: "Drivers, coordinators and support staff who work together — no one moves a vehicle alone.",
  },
  {
    icon: Shield,
    title: "Safety-First Culture",
    description: "The same discipline we promise customers on every delivery starts with how we treat our own people.",
  },
];

export default function CareersWhyUs() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">Why Car Coolie</p>
        <h2 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-[#0b1e42]">A Place To </span>
          <span className="text-red-600">Build, Not Just Work</span>
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-[#0b1e42]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
