"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Placeholder Q&A copy — swap for real transport/policy answers before
// shipping.
const FAQ_ITEMS = [
  {
    question: "How long does transport typically take?",
    answer: "Usually 3-7 days depending on distance and route, with an estimated window given at booking.",
  },
  {
    question: "Is my vehicle insured during transit?",
    answer: "Yes — every vehicle is covered by comprehensive transit insurance at no extra cost, door to door.",
  },
  {
    question: "Can I track my car?",
    answer: "Yes, every shipment includes GPS live tracking with instant status updates and arrival estimates.",
  },
  {
    question: "Do you offer door-to-door service?",
    answer: "Yes, pickup and drop-off at the addresses you specify, subject to access for larger carriers.",
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FA] px-6 py-5 shadow-sm ring-1 ring-slate-100">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-base font-bold text-[#0b1e42]">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#0b1e42] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-slate-500">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={container}
          >
            <motion.div variants={fadeUp}>
              <p className="text-sm font-semibold text-red-600">Know Your Queries</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight text-[#0b1e42] sm:text-5xl">
                Frequently Ask <span className="text-red-600">Questions</span>
              </h2>
              <p className="mt-4 text-base text-slate-500">
                Everything You Need To Know Before Booking Car Transport
              </p>
            </motion.div>

            <div className="mt-10 space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div key={item.question} variants={fadeUp}>
                  <FAQItem
                    item={item}
                    isOpen={openIndex === i}
                    onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:mt-28"
          >
            <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-100">
              <div className="relative mx-auto h-24 w-24">
                <Image src="/mailicon.png" alt="" fill sizes="96px" className="object-contain" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-[#0b1e42]">
                Still Need Help With Your <span className="text-red-600">Vehicle Transport Booking?</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Reach out directly and our vehicle transport experts will help with quotes, scheduling
                and any other booking questions.
              </p>
              <a
                href="mailto:carcooliesupport@oslgroup.co.in"
                className="mt-7 block w-full rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Shoot a Direct Mail
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
