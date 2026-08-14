import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight, Link2, Quote } from "lucide-react";
import { AUTHORS, headingId } from "../../posts";
import RelatedPosts from "./RelatedPosts";

// lucide-react dropped brand/social glyphs (Facebook, LinkedIn, X, etc.)
// over trademark concerns — same convention as BlogPostHero.js: render
// them as plain text glyphs inside the circular buttons instead.
const SHARE_LINKS = [
  { label: "Share on Facebook", glyph: "f" },
  { label: "Share on LinkedIn", glyph: "in" },
  { label: "Share on X", glyph: "X" },
];

// Evergreen quick links into the rest of the site — shown alongside every
// post, not tied to any one article's content.
const RELATED_LINKS = [
  { label: "Car Transport Process", href: "/services" },
  { label: "Packing Tips for Car", href: "/blog/how-to-prepare-your-car-for-long-distance-transport" },
  { label: "Door to Door Delivery", href: "/services" },
  { label: "Car Transport Insurance", href: "/blog/understanding-vehicle-insurance-during-transit" },
  { label: "State to State Transport", href: "/company-numbers" },
];

export default function BlogPostContent({ post, relatedPosts }) {
  const [leadSection, ...restSections] = post.sections;
  const authorInfo = AUTHORS[post.author];

  return (
    <>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_320px]">
          <article className="min-w-0">
            <p className="text-sm font-bold text-red-600">Main Content</p>
            <h2 id={headingId(leadSection.heading)} className="mt-2 scroll-mt-32 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
              {leadSection.heading}
            </h2>

            <div className="mt-6 flex flex-col gap-4">
              <p className="text-base leading-relaxed text-slate-600">{post.excerpt}</p>
              {leadSection.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>

            {post.pullQuote && (
              <blockquote className="relative mt-8 rounded-r-2xl border-l-4 border-red-600 bg-slate-50 py-6 pr-6 pl-8">
                <Quote className="h-6 w-6 text-red-200" fill="currentColor" strokeWidth={0} />
                <p className="mt-2 text-lg leading-relaxed font-medium text-[#0b1e42] italic">
                  {post.pullQuote}
                </p>
              </blockquote>
            )}

            <div className="mt-8 flex flex-col gap-10">
              {restSections.map(({ heading, paragraphs }) => (
                <div key={heading}>
                  <h3 id={headingId(heading)} className="scroll-mt-32 text-2xl font-extrabold text-[#0b1e42]">
                    {heading}
                  </h3>
                  <div className="mt-4 flex flex-col gap-4">
                    {paragraphs.map((paragraph, i) => (
                      <p key={i} className="text-base leading-relaxed text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-start gap-6 rounded-3xl bg-linear-to-r from-[#0b1220] to-[#132a5e] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-5">
                {authorInfo?.image ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
                    <Image src={authorInfo.image} alt={post.author} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-600 text-lg font-extrabold text-white ring-2 ring-white/20">
                    {post.author
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                )}
                <div>
                  <p className="text-lg font-extrabold text-white">{post.author}</p>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-300">
                    {authorInfo?.bio ?? "CarCoolie Editorial Team"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {SHARE_LINKS.map(({ label, glyph }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-sm font-extrabold text-white transition-colors hover:bg-white/10"
                  >
                    {glyph}
                  </a>
                ))}
              </div>
            </div>
          </article>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#0b1e42]">
                <BookOpen className="h-4 w-4 text-red-600" strokeWidth={2} />
                Table of Contents
              </div>
              <ul className="mt-4 flex flex-col gap-1">
                {post.sections.map(({ heading }, i) => (
                  <li key={heading}>
                    <a
                      href={`#${headingId(heading)}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-red-600"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-[11px] font-extrabold text-white">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#0b1e42]">
                <Link2 className="h-4 w-4 text-red-600" strokeWidth={2} />
                Related Links
              </div>
              <ul className="mt-4 flex flex-col divide-y divide-slate-200">
                {RELATED_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-2 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-red-600"
                    >
                      {label}
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-red-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <RelatedPosts posts={relatedPosts} />
    </>
  );
}
