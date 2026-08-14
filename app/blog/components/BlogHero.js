import Image from "next/image";
import { FileText, ShieldCheck, TrendingUp } from "lucide-react";
import Navbar from "../../landing-page/components/Navbar";

export default function BlogHero() {
  return (
    <>
      <Navbar />
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#0b1220] px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] sm:block lg:w-[52%]">
        <Image src="/blog-hero.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0b1220] via-[#0b1220]/20 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            Our Official Blog
          </span>

          <h1 className="mt-6 text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
            Insights, Updates
            <span className="block">
              <span className="text-white">&amp; </span>
              <span className="text-red-600">Stories.</span>
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">
            Stay informed with expert tips, industry insights, and the latest updates from the world
            of car transport.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#latest-blogs"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0b1e42] transition-colors hover:bg-slate-100"
            >
              <FileText className="h-4 w-4" />
              Browse Blogs
            </a>
            <a
              href="#market-insights"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <TrendingUp className="h-4 w-4" />
              Market Insights
            </a>
          </div>

          <div className="mt-20 flex items-center gap-3">
            <div className="flex -space-x-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white ring-2 ring-[#0b1220]">
                JD
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500 text-xs font-bold text-white ring-2 ring-[#0b1220]">
                AS
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white ring-2 ring-[#0b1220]">
                +5k
              </span>
            </div>
            <p className="text-sm text-slate-300">Joined by 5,000+ industry professionals</p>
          </div>
        </div>
      </div>

      <div className="absolute right-[6%] bottom-16 hidden items-center gap-3 rounded-2xl bg-black/50 px-5 py-4 backdrop-blur-sm sm:flex sm:right-[10%] lg:right-[18%]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-white">Delivering Trust</p>
          <p className="text-xs text-slate-300">Across Every Mile</p>
        </div>
      </div>
      </section>
    </>
  );
}
