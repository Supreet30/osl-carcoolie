import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import Navbar from "../../landing-page/components/Navbar";

export default function FaqHero() {
  return (
    <>
      <Navbar />
      <header className="relative isolate overflow-hidden bg-[#fffafa] pt-32 pb-14 sm:pt-40 sm:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -left-28 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_60%_60%,#fee2e2_0%,transparent_70%)]"
        />
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Link href="/landing-page" className="transition-colors hover:text-red-600">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0b1e42]">FAQs</span>
          </nav>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0b1e42] sm:text-5xl">
            Frequently Asked <span className="text-red-600">Questions</span>
          </h1>
          <p className="mt-4 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              2 min read
            </span>
            <span>Answers for B2C customers and B2B partners, organised separately below.</span>
          </p>
        </div>
      </header>
    </>
  );
}
