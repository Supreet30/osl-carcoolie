import Image from "next/image";
import Link from "next/link";

export default function UsVsMarketCta() {
  return (
    <section className="bg-white px-6 py-14">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
        <Image
          src="/usvscta.jpg"
          alt=""
          fill
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0b1e42]/85" />

        <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            See the Difference for Yourself.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Join thousands of customers and dealerships across India who trust CarCoolie with
            their vehicles.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              Get Instant Quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Speak with an Expert
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
