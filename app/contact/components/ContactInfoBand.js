"use client";

import { motion } from "motion/react";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// lucide-react dropped brand/social glyphs over trademark concerns (see
// AuthModal.js's GoogleIcon) — drawn as a plain outline SVG instead, same
// convention.
function InstagramIcon({ className, strokeWidth = 2 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    title: "Our",
    highlight: "Address",
    lines: [
      { text: "Car Coolie Logistics Pvt Ltd", bold: true },
      { text: "Marble Arch, 236B AJC Bose Road, Kolkata 700020, India." },
    ],
  },
  {
    icon: Phone,
    title: "Contact",
    highlight: "No.",
    href: "tel:+918447990088",
    lines: [
      { text: "+91 84479 90088", bold: true },
      { text: "Available Mon to Sat for vehicle transport queries and bookings." },
    ],
  },
  {
    icon: Mail,
    title: "Email",
    highlight: "Us",
    href: "mailto:carcooliesupport@oslgroup.co.in",
    lines: [
      { text: "carcooliesupport@oslgroup.co.in", bold: true },
      { text: "Our team responds to every vehicle transport enquiry as soon as possible." },
    ],
  },
  {
    icon: Clock3,
    title: "Working",
    highlight: "Hours",
    lines: [
      { text: "Mon to Sat", bold: true },
      { text: "10:00 AM to 6:30 PM", bold: true },
    ],
  },
  {
    icon: InstagramIcon,
    title: "Follow On",
    highlight: "Instagram",
    href: "https://instagram.com/carcooliedotcom",
    lines: [
      { text: "@carcooliedotcom", bold: true },
      { text: "See our latest drops, deliveries and behind-the-scenes." },
    ],
  },
];

export default function ContactInfoBand() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#fee2e2_1px,transparent_1px),linear-gradient(90deg,#fee2e2_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-6xl"
      >
        <p className="text-sm font-semibold text-red-600">Let&apos;s Connect With Us</p>
        <h2 className="mt-2 text-4xl font-extrabold text-[#0b1e42] sm:text-5xl">
          Contact <span className="text-red-600">Information</span>
        </h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
          className="relative mt-16 grid grid-cols-2 gap-y-14 sm:grid-cols-5 lg:gap-y-0"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-[10%] right-[10%] top-18 hidden border-t-4 border-dashed border-red-500 lg:block"
          />

          {CONTACT_ITEMS.map(({ icon: Icon, title, highlight, href, lines }) => {
            const MotionWrapper = href ? motion.a : motion.div;
            // tel:/mailto: open the device's own dialer/mail app in place —
            // target="_blank" only makes sense for a real external page
            // (WhatsApp, Instagram).
            const isExternal = href?.startsWith("http");
            return (
            <MotionWrapper
              key={highlight}
              variants={fadeUp}
              {...(href ? { href, ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}) } : {})}
              className={`relative z-10 flex min-w-0 flex-col items-center px-2 text-center ${href ? "group" : ""}`}
            >
              <span
                className={`flex h-28 w-28 items-center justify-center rounded-full border-8 border-red-500 bg-slate-100 text-red-600 sm:h-36 sm:w-36 ${
                  href ? "transition-colors group-hover:bg-red-600 group-hover:text-white" : ""
                }`}
              >
                <Icon className="h-16 w-16 sm:h-20 sm:w-20" strokeWidth={2} />
              </span>

              <h3 className="mt-6 text-xl font-bold text-[#0b1e42]">
                {title} <span className="text-red-600">{highlight}</span>
              </h3>
              <span className="mt-2 h-0.5 w-8 bg-red-500" />

              <div className="mt-4 w-full space-y-1">
                {lines.map((line) => (
                  <p
                    key={line.text}
                    className={
                      line.bold
                        ? "text-base font-bold wrap-break-word text-[#0b1e42] sm:text-lg"
                        : "text-sm leading-relaxed wrap-break-word text-slate-500"
                    }
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </MotionWrapper>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
