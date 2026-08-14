import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, FolderOpen, Home, Share2, User } from "lucide-react";
import Navbar from "../../../landing-page/components/Navbar";

// lucide-react dropped brand/social glyphs (Facebook, LinkedIn, X, etc.)
// over trademark concerns — same convention as LatestResource.js: render
// them as plain text glyphs inside the circular buttons instead.
const SHARE_LINKS = [
  { label: "Share on Facebook", glyph: "f" },
  { label: "Share on LinkedIn", glyph: "in" },
  { label: "Share on X", glyph: "X" },
];

export default function BlogPostHero({ post }) {
  const { title, highlight, pill, image, author, date, category } = post;
  const highlightIndex = title.indexOf(highlight);
  const titleStart = highlightIndex >= 0 ? title.slice(0, highlightIndex) : title;
  const titleHighlight = highlightIndex >= 0 ? highlight : "";

  return (
    <>
      <Navbar />
      <section className="relative isolate overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-28 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_65%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-400">
            <Link href="/landing-page" aria-label="Home" className="flex items-center text-red-600">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href="/landing-page" className="transition-colors hover:text-red-600">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href="/blog" className="transition-colors hover:text-red-600">
              Blog
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-70 truncate font-bold text-red-600">{title}</span>
          </nav>

          <span className="mt-6 inline-flex items-center rounded-full bg-red-600 px-4 py-1.5 text-xs font-extrabold tracking-wide text-white uppercase">
            {pill}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-[#0b1e42] sm:text-5xl">
            {titleStart}
            <span className="text-red-600">{titleHighlight}</span>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-[#0b1e42]">
              <Share2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              Share
            </span>
            {SHARE_LINKS.map(({ label, glyph }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold text-[#0b1e42] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                {glyph}
              </a>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-red-600" strokeWidth={2} />
              {author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" strokeWidth={2} />
              {date}
            </span>
            <span className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-red-600" strokeWidth={2} />
              {category}
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div aria-hidden className="absolute -right-4 -bottom-4 h-full w-full rounded-[28px] bg-red-600" />
          <div className="relative aspect-4/3 overflow-hidden rounded-[28px] shadow-xl">
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
