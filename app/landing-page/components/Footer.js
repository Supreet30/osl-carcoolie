import Image from "next/image";
import Link from "next/link";
import { Globe, Share2 } from "lucide-react";

// Absolute (not bare-hash) hrefs — this Footer is shared across routes
// (landing page + contact page), so section links must route back to
// /landing-page's anchors rather than trying to scroll within whatever
// page currently renders the Footer.
const LINK_GROUPS = [
  {
    title: "Services",
    links: [
      { label: "Enclosed Transport", href: "/landing-page#services" },
      { label: "Dealer Logistics", href: "/landing-page#services" },
      { label: "Auction Transport", href: "/landing-page#services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/landing-page#about" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "/landing-page#blogs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Live Tracking", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#081B33] px-6 pt-16 pb-8 text-white">
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8">
        <div>
          <div className="inline-flex rounded-xl bg-white px-2 py-2">
            <Image
              src="/carcoolie_logo.png"
              alt="Car Coolie"
              width={150}
              height={46}
              className="h-12 w-auto"
            />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
            Redefining luxury vehicle transport across India since 2014. Safety,
            transparency, and precision in every mile.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Website"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <Globe className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </div>

        {LINK_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-white">{group.title}</p>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-slate-400">
        © {year} OSL Car Coolie. All rights reserved.
      </div>
    </footer>
  );
}
