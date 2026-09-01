import { Clock3, Mail, MapPin, Phone } from "lucide-react";

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    title: "Our",
    highlight: "Address",
    lines: [
      { text: "Car Coolie Logistics Pvt Ltd", bold: true },
      {
        text: "B-124 Industrial Area, Block B, Prem Puri, Phase 2, Gurugram, Haryana 122011, India.",
      },
    ],
  },
  {
    icon: Phone,
    title: "Contact",
    highlight: "No.",
    lines: [
      { text: "+1234567890", bold: true },
      { text: "Available Mon to Sat for vehicle transport queries and bookings." },
    ],
  },
  {
    icon: Mail,
    title: "Email",
    highlight: "Us",
    lines: [
      { text: "support@carcoolie.com", bold: true },
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
];

export default function ContactInfoBand() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#fee2e2_1px,transparent_1px),linear-gradient(90deg,#fee2e2_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-red-600">Let&apos;s Connect With Us</p>
        <h2 className="mt-2 text-4xl font-extrabold text-[#0b1e42] sm:text-5xl">
          Contact <span className="text-red-600">Information</span>
        </h2>

        <div className="relative mt-16 grid grid-cols-2 gap-y-14 sm:grid-cols-4 lg:gap-y-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-18 hidden border-t-4 border-dashed border-red-500 lg:block"
          />

          {CONTACT_ITEMS.map(({ icon: Icon, title, highlight, lines }) => (
            <div key={highlight} className="relative z-10 flex flex-col items-center px-2 text-center">
              <span className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-red-500 bg-slate-100 text-red-600 sm:h-36 sm:w-36">
                <Icon className="h-16 w-16 sm:h-20 sm:w-20" strokeWidth={2} />
              </span>

              <h3 className="mt-6 text-xl font-bold text-[#0b1e42]">
                {title} <span className="text-red-600">{highlight}</span>
              </h3>
              <span className="mt-2 h-0.5 w-8 bg-red-500" />

              <div className="mt-4 space-y-1">
                {lines.map((line) => (
                  <p
                    key={line.text}
                    className={
                      line.bold
                        ? "text-lg font-bold text-[#0b1e42]"
                        : "text-sm leading-relaxed text-slate-500"
                    }
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
