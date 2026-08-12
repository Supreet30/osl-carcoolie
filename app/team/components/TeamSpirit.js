import { Brain, Handshake, Lightbulb, ShieldCheck, User } from "lucide-react";

const VALUES = [
  { icon: User, label: "Customer First" },
  { icon: ShieldCheck, label: "Safety Always" },
  { icon: Brain, label: "Ownership Mindset" },
  { icon: Lightbulb, label: "Innovation Everyday" },
  { icon: Handshake, label: "Respect & Team work" },
];

export default function TeamSpirit() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl text-center">
        <p className="text-md font-semibold tracking-wide text-red-600">OUR TEAM SPIRIT</p>
        <h2 className="mt-3 text-5xl font-extrabold text-[#0b1e42]">
          Stronger <span className="text-red-600">Together</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-500">
          We come from different places, different backgrounds, but we share one goal — delivering
          trust across India.
        </p>

        <div className="relative mt-16 flex flex-wrap items-start justify-center">
          {VALUES.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-start">
              {i !== 0 && <span aria-hidden className="mx-6 mt-10 hidden h-20 w-px bg-slate-200 sm:block" />}
              <div className="flex w-40 flex-col items-center">
                <span className="flex h-40 w-40 items-center justify-center rounded-full bg-white text-red-600 shadow-lg transition-shadow duration-300 hover:shadow-[0_20px_35px_-10px_rgba(239,68,68,0.5)]">
                  <Icon className="h-16 w-16" strokeWidth={1.5} />
                </span>
                <p className="mt-4 text-md font-semibold text-[#0b1e42]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
