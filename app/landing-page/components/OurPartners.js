import Image from "next/image";

const PARTNERS = [
  { name: "Ford", src: "/logos/ford.png" },
  { name: "Chevrolet", src: "/logos/chevy.png" },
  { name: "Jeep", src: "/logos/jeep.png" },
  { name: "Mustang", src: "/logos/mustang.png" },
  { name: "Buick", src: "/logos/buick.png" },
];

// Rendered twice back to back so the CSS marquee (0 -> -50%) loops with no
// visible seam.
const MARQUEE_LOGOS = [...PARTNERS, ...PARTNERS];

export default function OurPartners() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-md font-semibold text-red-600">Our Partners</p>
        <h2 className="mt-3 text-6xl font-extrabold tracking-tight text-[#0b1e42]">
          Premium Transport <span className="text-red-600">Services</span>
        </h2>
      </div>

      <div className="group relative mt-10 overflow-hidden">
        {/* Fade the strip out at both edges instead of hard-cutting logos */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent sm:w-32" />

        <div className="flex w-max items-center gap-6 animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused] sm:gap-10">
          {MARQUEE_LOGOS.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex h-28 w-72 shrink-0 items-center justify-center sm:h-32 sm:w-84"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={336}
                height={252}
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
