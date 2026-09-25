import { Fragment } from "react";

// Small markdown renderer for the admin-authored legal pages: headings,
// paragraphs, bullet/numbered lists, blockquotes, horizontal rules, and
// **bold** / *italic* / `code` / [links](url) inline. Everything renders as
// React text nodes (never raw HTML), and link targets are limited to
// http(s), mailto and site-relative URLs.

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function safeHref(href) {
  const url = href.trim();
  return /^(https?:\/\/|mailto:|\/)/i.test(url) ? url : null;
}

function renderInline(text) {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      return href ? (
        <a key={i} href={href} className="font-semibold text-red-600 hover:underline">
          {link[1]}
        </a>
      ) : (
        <Fragment key={i}>{link[1]}</Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const BULLET = /^\s*[-*+]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

function parseBlocks(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
      i += 1;
    } else if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
    } else if (BULLET.test(line)) {
      const items = [];
      while (i < lines.length && BULLET.test(lines[i])) items.push(lines[i++].replace(BULLET, ""));
      blocks.push({ type: "ul", items });
    } else if (NUMBERED.test(line)) {
      const items = [];
      while (i < lines.length && NUMBERED.test(lines[i])) items.push(lines[i++].replace(NUMBERED, ""));
      blocks.push({ type: "ol", items });
    } else if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: quote.join(" ") });
    } else {
      const para = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^#{1,4}\s/.test(lines[i]) &&
        !BULLET.test(lines[i]) &&
        !NUMBERED.test(lines[i]) &&
        !/^>\s?/.test(lines[i])
      ) {
        para.push(lines[i++].trim());
      }
      blocks.push({ type: "p", text: para.join(" ") });
    }
  }
  return blocks;
}

const HEADING_CLASSES = {
  1: "mt-2 mb-4 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl",
  2: "scroll-mt-28 mt-12 mb-3 border-l-4 border-red-500 pl-4 text-xl font-extrabold text-[#0b1e42] first:mt-0 sm:text-2xl",
  3: "scroll-mt-28 mt-7 mb-2 text-lg font-bold text-[#0b1e42]",
  4: "scroll-mt-28 mt-5 mb-2 text-base font-bold text-[#0b1e42]",
};

function plainText(text) {
  return text.replace(/[*`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, (_, label) => label);
}

// Same id sequence for the rendered headings and the page's contents list —
// duplicates get a numeric suffix so anchors never collide.
function makeSlugger() {
  const seen = new Map();
  return (text) => {
    const base =
      plainText(text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

// Splits a document into its title (first "# " line, if any), the body
// without it, the "##" headings for a contents list, and a reading time.
export function outlineMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const h1 = lines.findIndex((l) => /^#\s+/.test(l));
  const title = h1 >= 0 ? plainText(lines[h1].replace(/^#\s+/, "")) : null;
  const body = (h1 >= 0 ? [...lines.slice(0, h1), ...lines.slice(h1 + 1)] : lines).join("\n");
  const slug = makeSlugger();
  const headings = parseBlocks(body)
    .filter((b) => b.type === "h")
    .map((b) => ({ level: b.level, id: slug(b.text), text: plainText(b.text) }))
    .filter((h) => h.level === 2);
  const words = plainText(body).split(/\s+/).filter(Boolean).length;
  return { title, body, headings, readMinutes: Math.max(1, Math.round(words / 200)) };
}

export default function Markdown({ source }) {
  const slug = makeSlugger();
  return (
    <div className="text-sm leading-relaxed text-slate-600 sm:text-base">
      {parseBlocks(source).map((block, index) => {
        switch (block.type) {
          case "h": {
            const Tag = `h${block.level}`;
            return (
              <Tag key={index} id={slug(block.text)} className={HEADING_CLASSES[block.level]}>
                {renderInline(block.text)}
              </Tag>
            );
          }
          case "hr":
            return <hr key={index} className="my-8 border-slate-200" />;
          case "ul":
            return (
              <ul key={index} className="my-3 list-disc space-y-1.5 pl-6">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index} className="my-3 list-decimal space-y-1.5 pl-6">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={index} className="my-4 border-l-4 border-red-200 pl-4 text-slate-500 italic">
                {renderInline(block.text)}
              </blockquote>
            );
          default:
            return (
              <p key={index} className="my-3">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
