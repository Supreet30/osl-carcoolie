import Image from "next/image";
import Link from "next/link";
import Navbar from "../../../landing-page/components/Navbar";

export default function CaseStudyHero({ study }) {
  const { heroTitle, heroHighlight, breadcrumbLabel, heroSubtitle } = study;
  const highlightIndex = heroTitle.indexOf(heroHighlight);
  const titleStart = highlightIndex >= 0 ? heroTitle.slice(0, highlightIndex) : heroTitle;
  const titleHighlight = highlightIndex >= 0 ? heroHighlight : "";

  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-16 sm:pb-20">
      <Image
        src="/cshimg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#05070d] via-[#05070d]/70 to-[#05070d]/25" />

      <div className="relative mx-auto w-full max-w-6xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/60">
          <Link href="/landing-page" className="transition-colors hover:text-white">
            Home
          </Link>
          <span aria-hidden>&gt;</span>
          <Link href="/case-studies" className="transition-colors hover:text-white">
            Case Studies
          </Link>
          <span aria-hidden>&gt;</span>
          <span className="max-w-70 truncate text-white/60">{breadcrumbLabel}</span>
        </nav>

        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl">
          {titleStart}
          <span className="text-red-600">{titleHighlight}</span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {heroSubtitle}
        </p>
      </div>
      </section>
    </>
  );
}
