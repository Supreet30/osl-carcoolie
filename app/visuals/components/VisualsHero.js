import Image from "next/image";
import { Gauge, MapPin, Truck } from "lucide-react";
import Navbar from "../../landing-page/components/Navbar";

const STATS = [
  { icon: Truck, value: "35L+", label: "Cars Delivered" },
  { icon: MapPin, value: "450+", label: "Cities Covered" },
  { icon: Gauge, value: "98%", label: "Customer Satisfaction" },
];

export default function VisualsHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="max-w-lg">
          <h1 className="text-6xl font-extrabold leading-[1.2] tracking-tight">
            <span className="block text-[#0b1e42]">A Look Into Our</span>
            <span className="block text-red-600">Journey.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
            From car pickups to safe deliveries across India, explore the moments that drive our
            commitment to trust, care and precision.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon className="h-8 w-8" strokeWidth={2} />
                </span>
                <p className="mt-2 text-2xl font-extrabold text-[#0b1e42]">{value}</p>
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full py-4 pl-10 sm:pl-12">
          <div className="relative h-80 w-full overflow-hidden rounded-[28px] shadow-xl sm:h-96 lg:h-105">
            <Image
              src="/visuals/002.jpg"
              alt="OSL Car Coolie carrier fleet lined up at the yard"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 48vw"
              className="object-cover"
            />
          </div>

          {/* Real yard/loading/driver photos from public/visuals, not crops
              of the single main image above — each gets its own gentle zoom
              (not the old 120-160% crop-to-fake-variety trick, unnecessary
              now that these are already distinct shots) just to avoid an
              awkward edge-of-frame crop in a 1:1 thumbnail. */}
          {[
            { src: "/visuals/004.jpg", position: "top-0", zoom: "110%" },
            { src: "/visuals/006.jpg", position: "top-1/2 -translate-y-1/2", zoom: "100%" },
            { src: "/visuals/009.jpg", position: "bottom-0", zoom: "110%" },
          ].map(({ src, position, zoom }) => (
            <div
              key={src}
              className={`absolute -left-2 h-16 w-16 overflow-hidden rounded-2xl shadow-xl sm:-left-3 sm:h-20 sm:w-20 ${position}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                style={{ objectPosition: "center", transform: `scale(${zoom})` }}
              />
            </div>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
