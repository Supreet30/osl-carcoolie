import { ArrowRight, ChevronRight, Clock, FileText, Mail, ShieldCheck } from "lucide-react";
import Navbar from "../landing-page/components/Navbar";
import Footer from "../landing-page/components/Footer";
import { getLegalPage } from "../../lib/legal";
import Markdown, { outlineMarkdown } from "./Markdown";

const LEGAL_PAGES = [
  { slug: "terms", label: "Terms of Service", href: "/terms-of-service", icon: FileText },
  { slug: "privacy", label: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
];

function Title({ text }) {
  const words = text.split(" ");
  if (words.length < 2) return text;
  return (
    <>
      {words.slice(0, -1).join(" ")} <span className="text-red-600">{words[words.length - 1]}</span>
    </>
  );
}

export default async function LegalDocument({ slug }) {
  const page = await getLegalPage(slug);
  const { title: docTitle, body, headings, readMinutes } = outlineMarkdown(page.content);
  const title = docTitle ?? page.title;
  const current = LEGAL_PAGES.find((p) => p.slug === slug);

  return (
    <main className="relative bg-slate-50">
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
            <a href="/landing-page" className="transition-colors hover:text-red-600">
              Home
            </a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Legal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0b1e42]">{current?.label ?? title}</span>
          </nav>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0b1e42] sm:text-5xl">
            <Title text={title} />
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readMinutes} min read
            </span>
            <span>{headings.length} sections</span>
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pt-10 pb-20 sm:px-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
              {LEGAL_PAGES.map(({ slug: s, label, href, icon: LinkIcon }) => (
                <a
                  key={s}
                  href={href}
                  aria-current={s === slug ? "page" : undefined}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center text-xs font-bold transition-colors ${
                    s === slug ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-[#0b1e42]"
                  }`}
                >
                  <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                  {s === "terms" ? "Terms" : "Privacy"}
                </a>
              ))}
            </div>

            {headings.length > 0 && (
              <details open className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:[&>summary]:pointer-events-none">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-extrabold tracking-wide text-[#0b1e42] uppercase">
                  On this page
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90 lg:hidden" />
                </summary>
                <ol className="mt-4 flex flex-col gap-0.5 border-l border-slate-100">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-slate-500 transition-colors hover:border-red-500 hover:text-red-600"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div className="hidden rounded-2xl bg-[#0b1e42] p-5 text-white lg:block">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Mail className="h-4 w-4" />
              </span>
              <p className="mt-3 text-sm font-bold">Questions about this?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">Our team is happy to help.</p>
              <a
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-red-300 transition-colors hover:text-white"
              >
                Contact us <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </aside>

        <article className="min-w-0 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10 lg:p-12">
          <Markdown source={body} />
        </article>
      </div>

      <Footer />
    </main>
  );
}
