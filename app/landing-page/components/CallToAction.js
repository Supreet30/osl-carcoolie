import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-white px-6 py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
        <Image
          src="/ctabg.png"
          alt=""
          fill
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative flex flex-col items-center px-6 py-20 text-center sm:px-12 md:py-28">
          <h2 className="max-w-2xl text-5xl font-extrabold leading-tight text-red-500">
            Ready to Transport Your Vehicle Safely?
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-black">
            Join 500+ companies that trust Car Coolie to deliver on time, every
            time. No contracts. No minimums.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-red-600 shadow-lg ring-1 ring-black/5 transition-colors hover:bg-slate-50"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
            >
              <Phone className="h-4 w-4" />
              Talk to sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
