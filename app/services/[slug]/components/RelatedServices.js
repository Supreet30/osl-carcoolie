import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

export default function RelatedServices({ services }) {
  if (services.length === 0) return null;

  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <div className="flex shrink-0 items-center gap-3">
            <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
            <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">More Services</h2>
            <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
          </div>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {services.map(({ slug, title, description, image }) => (
            <Link
              key={slug}
              href={`/services/${slug}`}
              className="group rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="mt-4 px-1 pb-1">
                <h3 className="text-lg font-extrabold text-[#0b1e42]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition-colors group-hover:text-red-700">
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Explore All Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
