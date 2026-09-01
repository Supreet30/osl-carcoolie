"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

// Placeholder Q&A copy — swap for real transport/policy answers before
// shipping.
const FAQ_ITEMS = [
  {
    question: "How long does transport typically take?",
    answer:
      "Most intercity deliveries are completed within 3-7 days depending on distance, route, and the type of carrier booked. You'll get an estimated delivery window at the time of booking and live updates throughout transit.",
  },
  {
    question: "Is my vehicle insured during transit?",
    answer:
      "Yes — every vehicle we transport is covered by comprehensive transit insurance from the moment it's loaded until it reaches your doorstep, at no extra cost to you.",
  },
  {
    question: "Can I track my car in real-time?",
    answer:
      "Absolutely. Every shipment includes GPS-enabled live tracking so you always know exactly where your vehicle is, with instant status updates and accurate arrival estimates.",
  },
  {
    question: "Do you offer door-to-door service?",
    answer:
      "Yes, our standard service includes pickup and drop-off at the addresses you specify, subject to local access restrictions for larger carriers.",
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
          <div>
            <p className="text-sm font-semibold text-red-600">Know Your Queries</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight text-[#0b1e42] sm:text-5xl">
              Frequently Ask <span className="text-red-600">Questions</span>
            </h2>
            <p className="mt-4 text-base text-slate-500">
              Everything You Need To Know Before Booking Car Transport
            </p>

            <div className="mt-10 space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem
                  key={item.question}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
                />
              ))}
            </div>
          </div>

          <div className="lg:mt-28">
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
                href="mailto:support@carcoolie.com"
                className="mt-7 block w-full rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Shoot a Direct Mail
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
