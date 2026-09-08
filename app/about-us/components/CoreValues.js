import Image from "next/image";
import { Eye, Heart, Rocket, ShieldCheck } from "lucide-react";

const VALUES = [
  {
    icon: Rocket,
    title: "Our Mission",
    description:
      "To provide the most secure, reliable and transparent vehicle logistics ecosystem in India, using technology to eliminate uncertainty in car transport.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To redefine luxury vehicle transport through continuous innovation, becoming the benchmark for customer-centric logistics excellence in India.",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Safety First, Customer Obsession, Operational Excellence and Radical Transparency in every mile of vehicle transport we deliver.",
  },
];

export default function CoreValues() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">Our Core Values</p>
        <h2 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-[#0b1e42]">What Drives Our </span>
          <span className="text-red-600">Vehicle Logistics</span>
          <span className="text-[#0b1e42]"> Business</span>
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-16">
          <div className="flex flex-col gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex-1 rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start gap-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0b1e42]">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-8 sm:pb-10">
            <div className="relative h-full min-h-105 overflow-hidden rounded-3xl shadow-xl">
              <Image
                src="/finalimages/about/ourvalues.JPG"
                alt="CarCoolie technician carefully detailing a vehicle before delivery"
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-10 max-w-56 rounded-2xl bg-red-600 p-5 text-white shadow-xl sm:right-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck className="h-8 w-8" />
              </span>
              <p className="mt-3 text-md font-medium leading-snug">
                Every vehicle is treated as our own personal asset.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
