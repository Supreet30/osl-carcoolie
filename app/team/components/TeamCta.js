import { ArrowRight } from "lucide-react";

export default function TeamCta() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-4xl bg-[#0b1e42] px-8 py-10 shadow-2xl sm:px-12 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-md font-semibold text-slate-300">Be Part Of Our Journey</p>
            <h2 className="mt-2 text-4xl font-extrabold text-white">
              Move Your Career In The <span className="text-red-500">Right Direction</span>
            </h2>
            <p className="mt-3 max-w-lg text-md leading-relaxed text-slate-400">
              We are always looking for passionate people who want to create impact and grow with
              us.
            </p>
          </div>

          <a
            href="#"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-white py-3 pr-3 pl-6 text-sm font-bold text-[#0b1e42] shadow-xl transition-transform hover:scale-105"
          >
            View Openings
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1e42] text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
