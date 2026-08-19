import Image from "next/image";

// Dummy placeholder photos — public/ doesn't have dedicated shots for a
// warehouse safety inspector, a driver in-cab, or cash-in-hand, so these
// reuse the closest existing images until real photography is available.
const ASSURANCE_ITEMS = [
  {
    heading: "Safety",
    highlight: "Checks",
    image: "/core.jpg",
    paragraphs: [
      "Every vehicle gets a multi-point inspection before and after transit, with a photo condition report at each handover — so nothing about your car's state is left to memory or guesswork.",
      "Trucks and drivers are checked against our own safety standards before a booking is even confirmed, not just once when they're first hired.",
    ],
  },
  {
    heading: "Trusted",
    highlight: "Drivers",
    image: "/contact-hero-truck.png",
    paragraphs: [
      "Every driver on our network is vetted, trained, and briefed on secure loading and handling before they're allowed to carry a customer's vehicle.",
      "You get the driver's contact and live location for the full journey — not just a booking confirmation and a wait.",
    ],
  },
  {
    heading: "Transparent",
    highlight: "Pricing",
    image: "/cs3.png",
    paragraphs: [
      "The quote you're given upfront is the amount you pay — no hidden loading fees, no last-minute \"convenience\" charges added at delivery.",
      "Every cost — base fare, insurance, and any optional add-ons — is itemized before you confirm, so you always know exactly what you're paying for.",
    ],
  },
];

export default function AssuranceSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-xs font-extrabold tracking-wide text-red-600 uppercase">
            Assurance
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#0b1e42] sm:text-5xl">
            Your Car, Our <span className="text-red-600">Responsibility.</span>
          </h2>
        </div>

        <div className="relative mt-16">
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-red-200 lg:block"
          />

          <div className="flex flex-col gap-16 lg:gap-24">
            {ASSURANCE_ITEMS.map(({ heading, highlight, image, paragraphs }, i) => (
              <div
                key={heading}
                className={`relative flex flex-col items-center gap-10 lg:gap-16 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 ring-4 ring-white lg:block"
                />

                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-xl">
                    <Image
                      src={image}
                      alt={`${heading} ${highlight}`}
                      fill
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="w-full lg:w-1/2">
                  <h3 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
                    {heading} <span className="text-red-600">{highlight}</span>
                  </h3>
                  <div className="mt-5 flex flex-col gap-4">
                    {paragraphs.map((paragraph, pi) => (
                      <p key={pi} className="text-base leading-relaxed text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <span
            aria-hidden
            className="absolute bottom-0 left-1/2 hidden h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-red-600 ring-4 ring-white lg:block"
          />
        </div>
      </div>
    </section>
  );
}
