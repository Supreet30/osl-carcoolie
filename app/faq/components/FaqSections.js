"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, ChevronDown, Users } from "lucide-react";

// General, booking-process-level FAQs for the two audiences the site
// already distinguishes elsewhere (ServicesShowcase's b2c/b2b tabs,
// ExploreServices' bookHref split) — grounded in how CarCoolie's booking
// flow, payments and documentation actually work (milestone payments,
// IRDAI-regulated transit insurance, GST invoicing, National Permit
// fleet). Per-service FAQs already live on each /services/[slug] page;
// these stay general to the whole audience rather than one service.
const B2C_FAQS = [
  {
    question: "How do I book a vehicle transport with CarCoolie?",
    answer:
      "Get an instant estimate on our website by entering your pickup and drop locations and vehicle details, choose your preferred method (self pickup/drop-off or door to door), and confirm your booking online in a few minutes.",
  },
  {
    question: "Is my vehicle insured during transit?",
    answer:
      "Yes, every vehicle is covered under goods-in-transit insurance for the full journey, arranged in line with IRDAI norms, at no extra cost to you.",
  },
  {
    question: "How can I track my vehicle?",
    answer:
      "Once your booking is confirmed, you can track your vehicle's status from the My Bookings page, including scheduled location updates while it's in transit.",
  },
  {
    question: "What documents do I need to provide?",
    answer:
      "Typically your vehicle's RC and a valid ID proof; any additional document needed for your specific booking is listed during checkout.",
  },
  {
    question: "How is payment structured?",
    answer:
      "Payments are split into milestones — 10% at booking, 50% at the midway checkpoint, and the remaining 40% before final delivery — so you're never paying the full amount upfront.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "You can cancel before your vehicle is loaded onto the carrier. Any applicable refund is processed after deducting handling charges, as outlined in our Terms and Conditions.",
  },
  {
    question: "Will I get a GST invoice?",
    answer: "Yes, a GST-compliant invoice is generated for every booking and is downloadable from your My Bookings page.",
  },
  {
    question: "What if my vehicle is damaged in transit?",
    answer:
      "Report it to our team as soon as you notice it at delivery. We review the condition report, photos and relevant documents to assess and resolve the claim.",
  },
];

const B2B_FAQS = [
  {
    question: "Does CarCoolie work with OEMs and dealer networks?",
    answer:
      "Yes, we run structured plant-to-showroom dispatch, dealer transfers, and nationwide distribution for OEMs and dealer networks under dedicated account management.",
  },
  {
    question: "Can you handle recurring, scheduled dispatch volumes?",
    answer:
      "Yes, we align carrier capacity with your production and delivery calendar, running recurring dispatch cycles rather than one-off bookings.",
  },
  {
    question: "Are your carriers compliant with National Permit regulations?",
    answer:
      "Yes, our fleet operates under valid National Permits issued under the Motor Vehicles Act, 1988, allowing lawful, unrestricted interstate movement across every state.",
  },
  {
    question: "Do you offer dedicated account management?",
    answer: "Yes, every B2B partnership is assigned a dedicated account manager coordinating dispatch, documentation and escalations.",
  },
  {
    question: "Can you provide storage or warehousing alongside transport?",
    answer: "Yes, we offer monitored vehicle stockyard storage and dedicated automotive parts warehousing alongside our transport services.",
  },
  {
    question: "How is billing and documentation handled for bulk shipments?",
    answer:
      "Every dispatch comes with a GST-compliant invoice and an e-way bill where applicable under CGST rules, with consolidated billing available for recurring partners.",
  },
  {
    question: "What kind of reporting or visibility do you provide?",
    answer:
      "Your account manager shares dispatch and delivery status updates, with AIS-140 compliant GPS tracked shipments visible throughout transit.",
  },
  {
    question: "How do we get started as a business partner?",
    answer: "Reach out through our contact page with your requirement, and our team will get back to you to scope a tailored logistics plan.",
  },
];

const AUDIENCES = [
  { id: "b2c", label: "B2C Customers", icon: Users, faqs: B2C_FAQS, ctaHref: "/services/b2c", ctaLabel: "Get An Instant Estimate" },
  { id: "b2b", label: "B2B Partners", icon: Building2, faqs: B2B_FAQS, ctaHref: "/contact", ctaLabel: "Talk To Our Team" },
];

function FaqItem({ item, isOpen, onToggle }) {
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

export default function FaqSections() {
  const [activeId, setActiveId] = useState("b2c");
  const [openIndex, setOpenIndex] = useState(0);
  const active = AUDIENCES.find((a) => a.id === activeId);
  const ActiveIcon = active.icon;

  return (
    <section className="relative overflow-hidden bg-white px-6 py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-4xl">
        <div className="mx-auto flex max-w-md items-center rounded-full bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
          {AUDIENCES.map((audience) => (
            <button
              key={audience.id}
              type="button"
              onClick={() => {
                setActiveId(audience.id);
                setOpenIndex(0);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors ${
                activeId === audience.id ? "bg-[#0b1e42] text-white" : "text-[#0b1e42] hover:bg-slate-50"
              }`}
            >
              <audience.icon className="h-4 w-4" />
              {audience.label}
            </button>
          ))}
        </div>

        <div key={activeId} className="mt-10 space-y-4" style={{ animation: "fadeIn 0.4s ease-out" }}>
          {active.faqs.map((item, i) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
            <ActiveIcon className="h-5 w-5" />
          </span>
          <p className="text-base font-extrabold text-[#0b1e42]">Still have questions as a {active.label.toLowerCase()}?</p>
          <Link
            href={active.ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            {active.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
