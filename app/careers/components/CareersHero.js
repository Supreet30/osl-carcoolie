import Image from "next/image";
import Navbar from "../../landing-page/components/Navbar";
import BrandMark from "../../components/BrandMark";

export default function CareersHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
        />

        <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="max-w-lg">
            <p className="text-sm font-semibold text-red-600">
              Careers at <BrandMark />
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl">
              <span className="text-[#0b1e42]">Build Your Career In </span>
              <span className="text-red-600">Vehicle Logistics</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-slate-600">
              We&apos;re a growing vehicle transport network across India, and we&apos;re always looking for
              people who care about getting it right — on the road, in the yard, and with our customers.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#openings"
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                View Open Positions
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#0b1e42] px-8 py-3 text-sm font-bold text-[#0b1e42] transition-colors hover:bg-[#0b1e42] hover:text-white"
              >
                Get In Touch
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl pb-6 lg:pb-0">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 -right-4 hidden h-24 w-24 rounded-full border-2 border-red-100 sm:block"
            />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] shadow-xl">
              <Image
                src="/finalimages/team/hero.JPG"
                alt="The Car Coolie team at work"
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
