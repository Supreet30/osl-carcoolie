import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import StatsSection from "../../components/StatsSection";
import ComplianceStandards from "./ComplianceStandards";
import ServiceWhoItsFor from "./ServiceWhoItsFor";
import ServiceFAQ from "./ServiceFAQ";
import RelatedServices from "./RelatedServices";

export default function ServiceDetailContent({ service, relatedServices }) {
  const isB2c = service.tabId === "b2c";
  const bookHref = isB2c ? "/services/b2c" : "/contact";

  return (
    <>
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-red-600">Service Overview</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">{service.title}</h2>
              <p className="mt-6 text-base leading-relaxed text-slate-600">{service.details}</p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{service.overview}</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-100 sm:p-8">
              <p className="text-xs font-extrabold tracking-wide text-red-600 uppercase">Why Choose This Service</p>
              <ul className="mt-5 space-y-3">
                {service.highlights.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-semibold text-[#0b1e42]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={bookHref}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                {isB2c ? "Book This Service" : "Contact Our Team"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <ServiceWhoItsFor service={service} />
          <ComplianceStandards />
        </div>
      </section>

      <StatsSection />

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <ServiceFAQ service={service} />

          <div className="relative mt-20 overflow-hidden rounded-3xl bg-linear-to-br from-[#0b1220] to-[#132a5e] px-8 py-12 text-center sm:px-12">
            <p className="text-sm font-bold tracking-wide text-red-400 uppercase">Ready When You Are</p>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              {isB2c ? "Book Your " : "Talk To Us About "}
              <span className="text-red-500">{service.title}</span>
              {isB2c ? " Today" : ""}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
              {isB2c
                ? "Get an instant estimate and schedule your pickup in minutes."
                : "Share your requirement with our team and we'll get back to you with a tailored plan."}
            </p>
            <Link
              href={bookHref}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              {isB2c ? "Book This Service" : "Contact Our Team"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <RelatedServices services={relatedServices} />
    </>
  );
}
