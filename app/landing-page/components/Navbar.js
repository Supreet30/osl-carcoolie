"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";

// Absolute (not bare-hash) hrefs — this Navbar is shared across routes
// (landing page + contact page), so section links must route back to
// /landing-page's anchors rather than trying to scroll within whatever
// page currently renders the Navbar.
const NAV_LINKS = [
  { label: "Home", href: "/landing-page#home" },
  { label: "Services", href: "/services", chevron: true, dropdown: "services" },
  { label: "Resources", href: "/landing-page#resources", chevron: true, dropdown: "resources" },
  { label: "About Us", href: "/about-us" },
  { label: "Blogs", href: "/landing-page#blogs" },
];

const SERVICES_HEADING = {
  label: "Services",
  description: "Choose the right transport for your vehicle",
};

const SERVICES_GROUPS = [
  {
    heading: "For Business to Customers",
    links: [
      { label: "Enclosed Car Carrier", href: "/services" },
      { label: "Open Car Carrier", href: "/services" },
      { label: "Full Truck Car Carrier", href: "/services" },
      { label: "Half Truck Car Carrier", href: "/services" },
    ],
  },
  {
    heading: "For Business to Business",
    links: [
      { label: "Dealer Stock Transfer", href: "/services" },
      { label: "Manufacturer Plant Dispatch", href: "/services" },
      { label: "Fleet Relocation", href: "/services" },
      { label: "Bulk Vehicle Logistics", href: "/services" },
    ],
  },
];

const RESOURCES_HEADING = {
  label: "Resources",
  description: "Helpful insights & information",
  icon: (
    <path
      d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Zm16 0A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"
      strokeLinejoin="round"
    />
  ),
};

const RESOURCE_ITEMS = [
  {
    label: "Blogs",
    description: "Latest updates, tips & industry insights",
    href: "/landing-page#blogs",
    icon: (
      <>
        <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" strokeLinejoin="round" />
        <path d="M14 3.5V8h4.5" strokeLinejoin="round" />
        <path d="M9 12.5h6M9 15.5h6M9 9.5h2" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: "Case Studies",
    description: "Real stories. Real results.",
    href: "/landing-page#case-studies",
    icon: (
      <>
        <rect x="3.5" y="7.5" width="17" height="12" rx="1.8" strokeLinejoin="round" />
        <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" strokeLinejoin="round" />
        <path d="M3.5 12.5h17" />
      </>
    ),
  },
];

function ChevronDown({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ResourcesDropdown() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-40 w-95 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="mx-auto -mb-2.25 h-4 w-4 rotate-45 rounded-sm bg-white shadow-[0_2px_2px_-1px_rgba(15,23,42,0.08)]" />
      <div className="rounded-[28px] bg-white p-3 shadow-2xl ring-1 ring-slate-900/5">
        <div className="flex items-center gap-4 px-2 pb-4 pt-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
              {RESOURCES_HEADING.icon}
            </svg>
          </span>
          <span>
            <span className="block text-base font-extrabold text-[#0b1e42]">
              {RESOURCES_HEADING.label}
            </span>
            <span className="block text-sm text-slate-500">{RESOURCES_HEADING.description}</span>
          </span>
        </div>

        <ul className="divide-y divide-slate-100">
          {RESOURCE_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="group/item flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                    {item.icon}
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="block text-base font-extrabold text-[#0b1e42]">{item.label}</span>
                  <span className="block text-sm text-slate-500">{item.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover/item:text-red-600" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-1 flex items-center gap-3 rounded-2xl bg-red-50 p-3">
          <div className="flex-1">
            <p className="text-sm font-extrabold leading-snug text-[#0b1e42]">
              Need help transporting your vehicle?
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Get a free quote in less than 2 minutes.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
          >
            Get Free Quote
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ServicesDropdown() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-40 w-140 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="mx-auto -mb-2.25 h-4 w-4 rotate-45 rounded-sm bg-white shadow-[0_2px_2px_-1px_rgba(15,23,42,0.08)]" />
      <div className="rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
        <div className="flex items-center gap-4 pb-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Truck className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-base font-extrabold text-[#0b1e42]">
              {SERVICES_HEADING.label}
            </span>
            <span className="block text-sm text-slate-500">{SERVICES_HEADING.description}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-4">
          {SERVICES_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="px-2 text-xs font-extrabold uppercase tracking-wide text-[#0b1e42]">
                {group.heading}
              </p>
              <ul className="mt-1">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block rounded-xl px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-red-50 p-3">
          <div className="flex-1">
            <p className="text-sm font-extrabold leading-snug text-[#0b1e42]">
              Need help transporting your vehicle?
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Get a free quote in less than 2 minutes.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
          >
            Get Free Quote
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur sm:px-6">
        <Link href="/landing-page#home" className="shrink-0">
          <Image
            src="/carcoolie_logo.png"
            alt="Car Coolie"
            width={150}
            height={46}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <ul className="hidden items-center gap-8 text-base font-medium text-slate-800 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className={link.dropdown ? "group relative" : undefined}>
              <Link
                href={link.href}
                className="flex items-center gap-1 transition-colors hover:text-red-600"
              >
                {link.label}
                {link.chevron && <ChevronDown className="h-4 w-4" />}
              </Link>
              {link.dropdown === "resources" && <ResourcesDropdown />}
              {link.dropdown === "services" && <ServicesDropdown />}
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          className="hidden shrink-0 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 md:inline-block"
        >
          Contact Us
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-800 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl bg-white p-4 shadow-lg md:hidden">
          <ul className="flex flex-col gap-3 text-base font-medium text-slate-800">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1 py-1"
                >
                  {link.label}
                  {link.chevron && <ChevronDown className="h-4 w-4" />}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-red-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}
