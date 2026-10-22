"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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

export default function ServiceFAQ({ service }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mt-20">
      <p className="text-sm font-semibold text-red-600">Know Your Queries</p>
      <h2 className="mt-2 max-w-xl text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
        {service.title} <span className="text-red-600">FAQs</span>
      </h2>

      <div className="mt-10 space-y-4">
        {service.faqs.map((item, i) => (
          <FAQItem
            key={item.question}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
          />
        ))}
      </div>
    </div>
  );
}
