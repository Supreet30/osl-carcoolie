import Image from "next/image";
import { Share2 } from "lucide-react";

const TOP_STATS = [
  { value: "27+", label: "States Reached", subtitle: "Coast to coast coverage", progress: "60%", image: "/finalimages/company-numbers/service-locs.JPG" },
  { value: "650+", label: "Service Locations", subtitle: "City & highway hubs", progress: "78%", image: "/finalimages/company-numbers/service-locs.JPG" },
];

const BOTTOM_STATS = [
  { value: "100+", label: "Cities Covered", subtitle: "Coast to coast coverage", progress: "55%", image: "/finalimages/company-numbers/cities-covered.JPG" },
  { value: "22+", label: "Years Experience", subtitle: "Coast to coast coverage", progress: "70%", image: "/finalimages/company-numbers/years-exp.JPG" },
  { value: "35L+", label: "Cars Delivery", subtitle: "Coast to coast coverage", progress: "85%", image: "/finalimages/company-numbers/cars-delivery.png" },
  { value: ">99.89%", label: "On time Delivery", subtitle: "Coast to coast coverage", progress: "99%", image: "/finalimages/company-numbers/on-time-delivery.png" },
];

function StatCard({ value, label, subtitle, progress, image }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1220]/95 via-[#0b1220]/75 to-[#0b1220]/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </>
      )}
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-3xl font-extrabold text-[#0b1e42] transition-colors duration-300 group-hover:text-white">
            {value}
          </p>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <Share2 className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-3 text-sm font-bold text-[#0b1e42] transition-colors duration-300 group-hover:text-white">
          {label}
        </p>
        <p className="text-xs text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
          {subtitle}
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 transition-colors duration-300 group-hover:bg-white/20">
          <div className="h-full rounded-full bg-red-600" style={{ width: progress }} />
        </div>
      </div>
    </div>
  );
}

export default function NumbersThatDefineUs() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold text-red-600">Our Growth</p>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          <span className="text-[#0b1e42]">Numbers That </span>
          <span className="text-red-600">Define Us</span>
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Happy Customers — large image card */}
          <div className="relative min-h-100 overflow-hidden rounded-3xl">
            <Image src="/finalimages/company-numbers/happy-cust.JPG" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b1220]/95 via-[#0b1220]/70 to-[#0b1220]/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <p className="text-xs font-bold tracking-wide text-red-400 uppercase">
                Happy Customers
              </p>
              <div>
                <p className="text-5xl font-extrabold text-white">75K+</p>
                <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-slate-300">
                  Individuals, families and dealerships who trusted CarCoolie to move what
                  matters.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-red-500" />
                  <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Since 2022
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {TOP_STATS.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* Fleet & Transport Partners — wide image card */}
            <div className="relative min-h-40 flex-1 overflow-hidden rounded-3xl">
              <Image src="/finalimages/company-numbers/fleet.JPG" alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-[#0b1220]/70" />
              <div className="absolute inset-0 flex flex-col justify-center p-6">
                <p className="text-4xl font-extrabold text-white">150+</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  Fleet &amp; Transport Partners
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {BOTTOM_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
