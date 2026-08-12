"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "Aman Kumar" },
  { name: "email", label: "Email", type: "email", placeholder: "amankr49@gmail.com" },
];

const initialForm = { name: "", email: "", message: "" };

export default function JoinUsSection() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialForm);
  }

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(#fee2e2_1px,transparent_1px),linear-gradient(90deg,#fee2e2_1px,transparent_1px)] bg-size-[48px_48px]"
      />

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-red-600">Our Contact Info</p>
          <h2 className="mt-3 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
            JOIN <span className="text-red-600">US</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-12">
          <div className="relative flex min-h-140 flex-col justify-end overflow-hidden rounded-3xl bg-linear-to-br from-[#0b1e42] to-[#13224a] p-8 shadow-xl sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(239,68,68,0.25),transparent_55%)]"
            />
            <div className="relative">
              <h3 className="max-w-xs text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                Join India&apos;s Fastest Growing Vehicle Logistics Company
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
                We&apos;re always looking for passionate automotive lovers and logistics experts to join
                our team.
              </p>
              <a
                href="#openings"
                className="mt-6 inline-flex w-fit items-center rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                View Openings
              </a>
            </div>
          </div>

          <div className="relative flex lg:items-center">
            <span
              aria-hidden
              className="absolute -top-4 -right-4 hidden h-16 w-16 rounded-tr-3xl border-t-4 border-r-4 border-red-200 lg:block"
            />
            <form
              onSubmit={handleSubmit}
              className="relative flex min-h-140 w-full flex-col justify-center rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-100 sm:p-10"
            >
              <h3 className="text-4xl font-extrabold text-[#0b1e42]">
                Get in <span className="text-red-600">Touch</span>
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Have a specific transport requirement or a question? Our experts are here to help.
              </p>

              {submitted ? (
                <div className="flex min-h-52 flex-col items-start justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Send className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xl font-extrabold text-[#0b1e42]">Message sent!</p>
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
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {FIELDS.map((field) => (
                      <label
                        key={field.name}
                        className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42]"
                      >
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
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#0b1e42] sm:col-span-2">
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
                    className="mt-6 w-full rounded-xl bg-[#0b1e42] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
                  >
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
