import { MapPin, MapPinned, Package, Smile, Truck, Users } from "lucide-react";

const STATS = [
  { icon: Truck, value: "750+", label: "Trucks On Road Per Day" },
  { icon: Users, value: "800+", label: "Expert Staffs Working" },
  { icon: Package, value: "35L+", label: "Deliveries Completed" },
  { icon: MapPinned, value: "22+", label: "Years of Experience" },
  { icon: MapPin, value: "650+", label: "Service Locations All Over India" },
  { icon: Smile, value: "75k+", label: "Happy Customers Reached" },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">Our Brand Numbers</p>
        <h2 className="mt-2 text-4xl font-extrabold text-[#0b1e42] sm:text-5xl">
          Vehicle Transport At Scale, <span className="text-red-600">Backed By Data</span>
        </h2>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="group flex flex-col items-center rounded-4xl border-2 border-transparent bg-white p-6 text-center shadow-xl ring-1 ring-slate-100 transition-colors hover:border-red-500"
            >
              <span className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-red-600 transition-shadow duration-300 group-hover:shadow-[0_10px_12px_-8px_rgba(239,68,68,0.5)] sm:h-32 sm:w-32">
                <Icon className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={2} />
              </span>

              <p className="mt-5 text-4xl font-extrabold text-[#0b1e42]">{value}</p>
              <span className="mt-2 h-0.5 w-6 bg-red-500" />
              <p className="mt-3 text-sm font-semibold leading-snug text-red-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
