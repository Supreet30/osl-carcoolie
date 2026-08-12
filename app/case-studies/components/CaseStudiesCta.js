import Link from "next/link";
import { Phone } from "lucide-react";

export default function CaseStudiesCta() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-linear-to-br from-red-600 to-red-500 px-8 py-10 shadow-2xl sm:px-12 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Want Results Like These?</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-red-50">
              Join the 100+ businesses that trust CarCoolie for their mission-critical logistics and
              fleet management.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-red-600 shadow-xl transition-transform hover:scale-105"
          >
            Contact Us Today
            <Phone className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
