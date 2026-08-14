import Image from "next/image";
import Navbar from "../../landing-page/components/Navbar";

export default function ResourcesHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/resourcesbg.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40" /> */}
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="max-w-lg">
          <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl">
            <span className="block text-[#0b1e42]">Car Transport</span>
            <span className="block text-red-600">Resources &amp; Story.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-slate-600">
            Explore Helpful guides, real clients stories and expert tips about car transport, logistics
            and everything that keeps your vehicle moving safely.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#contact-form"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Book Vehicle
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#0b1e42] px-8 py-3 text-sm font-bold text-[#0b1e42] transition-colors hover:bg-[#0b1e42] hover:text-white"
            >
              Talk to Expert
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl pb-6 lg:pb-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] shadow-xl">
            <Image
              src="/contact-hero-truck.png"
              alt="Red CarCoolie carrier truck driving down a highway at sunset"
              fill
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
