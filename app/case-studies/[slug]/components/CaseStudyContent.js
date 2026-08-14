import Image from "next/image";
import { Check, Lightbulb, Quote, Target, Trophy, Truck } from "lucide-react";
import RelatedCaseStudies from "./RelatedCaseStudies";

// Wraps each phrase in `highlights` (exact substrings of `text`) in a red
// span, leaving the rest of the quote as plain text.
function renderQuote(text, highlights = []) {
  if (highlights.length === 0) return text;
  const pattern = new RegExp(`(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text.split(pattern).map((part, i) =>
    highlights.includes(part) ? (
      <span key={i} className="text-red-500">
        {part}
      </span>
    ) : (
      part
    )
  );
}

// Tailwind needs full, static class names to pick them up — a template
// literal like `text-${accent}-600` would be invisible to the compiler —
// so each accent's classes are spelled out here instead of assembled.
const ACCENTS = {
  red: { icon: "text-red-600", label: "text-red-600", underline: "bg-red-600", triangle: "border-b-red-600" },
  blue: { icon: "text-blue-600", label: "text-blue-600", underline: "bg-blue-600", triangle: "border-b-blue-600" },
  green: { icon: "text-green-600", label: "text-green-600", underline: "bg-green-600", triangle: "border-b-green-600" },
};

const STORY_STEPS = [
  { key: "challenge", label: "The Challenge", icon: Target, image: "/cs1.png", accent: "red" },
  { key: "solution", label: "Our Solution", icon: Lightbulb, image: "/cs2.png", accent: "blue" },
  { key: "results", label: "The Result", icon: Trophy, image: "/cs3.png", accent: "green" },
];

export default function CaseStudyContent({ study, relatedStudies }) {
  return (
    <>
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {study.stats && (
            <div className="flex flex-col gap-6 rounded-2xl bg-[#0b1220] p-6 sm:flex-row sm:items-center sm:divide-x sm:divide-white/10 sm:p-8">
              {study.stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-1 items-center gap-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                  <span className="flex h-22 w-22 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                    <Icon className="h-10 w-10" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold text-white">{value}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative mt-16 flex items-stretch gap-6 sm:gap-10">
            <div className="relative hidden w-24 shrink-0 sm:block">
              <span aria-hidden className="absolute top-12 bottom-12 left-1/2 w-px -translate-x-1/2 bg-slate-200" />
              <div className="relative flex h-full flex-col justify-between">
                {STORY_STEPS.map(({ key, icon: Icon, accent }) => (
                  <span
                    key={key}
                    className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-slate-900/20 ring-4 ring-white ${ACCENTS[accent].icon}`}
                  >
                    <Icon className="h-11 w-11" strokeWidth={2} />
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-8">
              {STORY_STEPS.map(({ key, label, image, accent }) => (
                <div
                  key={key}
                  className="relative flex flex-col overflow-hidden rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-white shadow-sm ring-1 ring-slate-100 sm:flex-row"
                >
                  <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-72">
                    <Image src={image} alt="" fill sizes="(max-width: 639px) 100vw, 288px" className="object-cover" />
                  </div>
                  <div className="flex-1 p-6 sm:p-8">
                    <p className={`text-xs font-extrabold tracking-wide uppercase ${ACCENTS[accent].label}`}>
                      {label}
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold text-[#0b1e42] sm:text-2xl">
                      {study[`${key}Headline`]}
                    </h2>
                    <span aria-hidden className={`mt-3 block h-1 w-10 rounded-full ${ACCENTS[accent].underline}`} />
                    <p className="mt-4 text-sm leading-relaxed text-slate-500">{study[key]}</p>
                  </div>
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute right-0 bottom-0 h-0 w-0 border-b-28 border-l-28 border-l-transparent ${ACCENTS[accent].triangle}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {study.quote && (
            <div className="mt-16">
              <div className="flex items-center justify-center gap-4">
                <span className="h-px flex-1 bg-slate-200" />
                <div className="flex shrink-0 items-center gap-3">
                  <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
                  <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">
                    Client <span className="text-red-600">Quotes</span>
                  </h2>
                  <Truck className="h-5 w-5 text-red-600" strokeWidth={2} />
                </div>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <blockquote className="relative mt-10 overflow-hidden rounded-3xl bg-linear-to-br from-[#0b1220] to-[#132a5e] px-8 py-10 sm:px-12 sm:py-12">
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute right-8 bottom-6 h-20 w-20 text-white/10"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <p className="relative text-center text-xl leading-relaxed font-bold text-white sm:text-2xl">
                  &quot;{renderQuote(study.quote, study.quoteHighlights)}&quot;
                </p>

                {study.quoteAuthor && (
                  <footer className="relative mt-8 flex items-center gap-3">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-extrabold text-white ring-2 ring-white/20">
                      {study.quoteAuthor
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                      <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 ring-2 ring-[#0b1220]">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-white">{study.quoteAuthor}</p>
                      {study.quoteAttribution && (
                        <p className="text-xs text-slate-400">{study.quoteAttribution}</p>
                      )}
                    </div>
                  </footer>
                )}
              </blockquote>
            </div>
          )}
        </div>
      </section>

      <RelatedCaseStudies studies={relatedStudies} />
    </>
  );
}
