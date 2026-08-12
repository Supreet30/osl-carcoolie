import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function VisualsCta() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-red-600 shadow-2xl">
        <div className="grid sm:grid-cols-2 sm:items-center">
          <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">SEE MORE. TRUST MORE.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-red-50">
              Follow our journey and stay updated with real moments from real deliveries across
              India.
            </p>
          </div>

          <div className="relative h-56 sm:h-full sm:min-h-72">
            <Image
              src="/contact-hero-truck.png"
              alt="CarCoolie carrier truck outside a service depot"
              fill
              sizes="(max-width: 639px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-red-600/75" />
            <div className="absolute inset-0 flex items-center justify-center sm:justify-end sm:pr-16">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0b1e42] shadow-xl transition-transform hover:scale-105"
              >
                Follow Us
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
