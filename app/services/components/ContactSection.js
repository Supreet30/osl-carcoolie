"use client";

import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

// Same contact details as ContactInfoBand.js on /contact — kept in sync
// manually since the two sections use different layouts (a compact list
// here vs. a 4-column banner there).
const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Address",
    value: "Car Coolie Logistics Pvt Ltd, B-124 Industrial Area, Block B, Prem Puri, Phase 2, Gurugram, Haryana 122011, India.",
  },
  { icon: Phone, label: "Phone", value: "+1234567890" },
  { icon: Mail, label: "Email", value: "support@carcoolie.com" },
  { icon: Clock3, label: "Working Hours", value: "Mon to Sat, 10:00 AM to 6:30 PM" },
];

const FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "Aman Kumar" },
  { name: "email", label: "Email", type: "email", placeholder: "amankr49@gmail.com" },
  { name: "phone", label: "Mobile", type: "tel", placeholder: "+9090988878" },
  { name: "service", label: "Service", type: "text", placeholder: "Vehicle Type" },
];

const initialForm = { name: "", email: "", phone: "", service: "", message: "" };

export default function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialForm);
  }

  return (
    <section className="relative overflow-hidden bg-[#fffdfc] px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(#fee2e2_1px,transparent_1px),linear-gradient(90deg,#fee2e2_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-red-600">Our Contact Info</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
            JOIN <span className="text-red-600">US</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <p className="text-xs font-bold tracking-[0.16em] text-red-600">CONTACT</p>
            <h3 className="mt-5 max-w-sm text-3xl font-extrabold leading-tight text-[#0b1e42]">
              Talk to our <span className="text-red-600">transport team.</span>
            </h3>

            <div className="mt-10 space-y-7">
              {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0b1e42]">{label}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <h3 className="text-2xl font-extrabold text-[#0b1e42]">
              Send A <span className="text-red-600">Message.....</span>
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Fill Out the form and our logistics will Contact You Within 30 Minutes..
            </p>

            {submitted ? (
              <div className="flex min-h-68 flex-col items-start justify-center">
                <p className="text-xl font-extrabold text-[#0b1e42]">Message sent!</p>
                <p className="mt-2 text-sm text-slate-500">Our team will get back to you shortly.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-bold text-red-600 hover:text-red-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {FIELDS.map((field) => (
                    <label key={field.name} className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42]">
                      {field.label}
                      <input
                        name={field.name}
                        type={field.type}
                        required
                        value={form[field.name]}
                        onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal normal-case tracking-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:border-red-500"
                      />
                    </label>
                  ))}
                  <label className="sm:col-span-2 block text-xs font-bold uppercase tracking-wide text-[#0b1e42]">
                    Message
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={(event) => setForm({ ...form, message: event.target.value })}
                      placeholder="Tell Us about Your Requirement"
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal normal-case tracking-normal text-[#0b1e42] outline-none placeholder:text-slate-400 focus:border-red-500"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-lg bg-[#071a42] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
                >
                  Send Message
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
