import Image from "next/image";
import Navbar from "../../landing-page/components/Navbar";

export default function ContactHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#fffafa] px-6 pt-32 pb-16 sm:pt-36 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="max-w-lg">
          <h1 className="text-6xl font-extrabold leading-[1.2] tracking-tight text-[#0b1e42]">
            Talk To India&apos;s <span className="block text-red-600">Vehicle Transport Experts</span>
          </h1>
          <p className="mt-10 max-w-md text-md leading-relaxed text-slate-600">
            Need to transport your vehicle safely anywhere in India? Our logistics experts help with
            quotations, shipment tracking, pickup scheduling and door-to-door delivery, all handled by
            specialized carrier trucks.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#contact-form"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Request A Quote
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#0b1e42] px-8 py-3 text-sm font-bold text-[#0b1e42] transition-colors hover:bg-[#0b1e42] hover:text-white"
            >
              Call Our Team
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl pb-6 lg:pb-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] shadow-xl">
            <Image
              src="/finalimages/contact/hero.JPG"
              alt="Red logistics truck travelling on a highway at sunset"
              fill
              preload
              sizes="(max-width: 1023px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-0 rounded-xl bg-[#0b1e42] px-5 py-4 text-white shadow-lg sm:-left-9">
            <p className="text-2xl font-extrabold leading-none">&lt;0.01%</p>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.14em] text-slate-300">DAMAGE RATIO</p>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
