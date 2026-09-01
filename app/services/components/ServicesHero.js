import Image from "next/image";
import Navbar from "../../landing-page/components/Navbar";

export default function ServicesHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[#0b1e42]">Enclosed And Open </span>
            <span className="text-red-600">Car Carriers, </span>
            <span className="text-[#0b1e42]">Tracked In </span>
            <span className="text-red-600">Real Time</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-slate-600">
            Whether you&apos;re relocating, purchasing a new vehicle or moving luxury cars, Car Coolie
            provides secure truck-based vehicle transportation with real-time tracking and nationwide
            coverage.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Book Transport
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#0b1e42] px-8 py-3 text-sm font-bold text-[#0b1e42] transition-colors hover:bg-[#0b1e42] hover:text-white"
            >
              View Pricing
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="relative aspect-[1494/1052] overflow-hidden rounded-[22px] shadow-xl">
            <Image
              src="/servicehero.png"
              alt="CarCoolie car-carrier truck transporting vehicles across India"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
