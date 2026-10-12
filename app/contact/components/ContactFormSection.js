"use client";

import { motion } from "motion/react";
import ContactForm from "./ContactForm";

// Extracted out of page.js (previously inlined there — every other page's
// page.js is a thin composition shell, this was the one exception) so the
// form/map pair can animate in on scroll like the rest of the page.
export default function ContactFormSection() {
  return (
    <section id="contact-form" className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <p className="text-sm font-semibold text-red-600">Contact Us</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
            Request Your <span className="text-red-600">Car Transport Quote</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
            Fill out the form below with your vehicle transport requirement and we&apos;ll respond as
            soon as possible.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <ContactForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            viewport={{ once: true, amount: 0.2 }}
            className="relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-100 shadow-xl ring-1 ring-slate-100 lg:min-h-full"
          >
            <iframe
              title="Car Coolie location in Gurugram"
              src="https://www.google.com/maps?q=Car+Coolie+Logistics%2C+B-124+Industrial+Area%2C+Block+B%2C+Prem+Puri%2C+Phase+2%2C+Gurugram%2C+Haryana+122011&z=14&output=embed"
              className="h-full min-h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 rounded-2xl bg-white/95 px-5 py-4 shadow-lg backdrop-blur-sm">
              <div>
                <p className="text-xs font-bold text-red-600">Car Coolie Logistics Pvt Ltd</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  B-124 Industrial Area, Block B, Prem Puri, Phase 2, Gurugram, Haryana 122011
                </p>
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Car+Coolie+Logistics%2C+B-124+Industrial+Area%2C+Block+B%2C+Prem+Puri%2C+Phase+2%2C+Gurugram%2C+Haryana+122011"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white whitespace-nowrap transition-colors hover:bg-red-700"
              >
                Get Directions
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
