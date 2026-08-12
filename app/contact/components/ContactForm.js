"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const FIELDS = [
  { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@company.com" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
];

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // No backend wired up yet — this just simulates a submission so the form
  // has real interactive feedback. Swap for an actual API call/route
  // handler once one exists.
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setForm(initialForm);
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-100 sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Send className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-2xl font-extrabold text-[#0b1e42]">Message Sent</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Thanks for reaching out — our team will get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 sm:p-10"
    >
      <h3 className="text-2xl font-extrabold text-[#0b1e42]">Send Us a Message</h3>
      <p className="mt-2 text-sm text-slate-500">
        Fill out the form below and we&apos;ll respond as soon as possible.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className={field.name === "phone" ? "sm:col-span-2" : undefined}>
            <label htmlFor={field.name} className="text-sm font-semibold text-[#0b1e42]">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0b1e42] outline-none transition-colors placeholder:text-slate-400 focus:border-red-500"
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label htmlFor="message" className="text-sm font-semibold text-[#0b1e42]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Tell us about your shipment — vehicle type, pickup and drop locations, timeline..."
            value={form.message}
            onChange={handleChange}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0b1e42] outline-none transition-colors placeholder:text-slate-400 focus:border-red-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#03123A] px-43 py-3.5 text-md font-bold text-white transition-colors hover:bg-red-600 sm:w-auto"
      >
        Send Message
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
