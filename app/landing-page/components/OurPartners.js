import Image from "next/image";

const PARTNERS = [
  { name: "Tata", src: "/logos/tata.png" },
  { name: "Mahindra", src: "/logos/mahindra.png" },
  { name: "Maruti Suzuki", src: "/logos/ms.png" },
  { name: "Hyundai", src: "/logos/hyundai.png" },
  { name: "Toyota", src: "/logos/toyota.png" },
  { name: "Honda", src: "/logos/honda.png" },
  { name: "Kia", src: "/logos/kia.png" },
  { name: "MG", src: "/logos/mg.png" },
  { name: "Volkswagen", src: "/logos/vw.png" },
  { name: "Citroën", src: "/logos/citroen.png" },
  { name: "Isuzu", src: "/logos/isuzu.png" },
  { name: "Ashok Leyland", src: "/logos/ashok.png" },
  { name: "VinFast", src: "/logos/vinfast.png" },
  { name: "Tivolt", src: "/logos/tivolt.png" },
  { name: "TAFE", src: "/logos/tafe.png" },
  { name: "BP", src: "/logos/bp.png" },
  { name: "Indian Oil", src: "/logos/ioil.png" },
];

// Rendered twice back to back so the CSS marquee (0 -> -50%) loops with no
// visible seam.
const MARQUEE_LOGOS = [...PARTNERS, ...PARTNERS];

export default function OurPartners() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-md font-semibold text-red-600">Our Esteemed Clientele</p>
        <h2 className="mt-3 text-6xl font-extrabold tracking-tight text-[#0b1e42]">
          Trusted By <span className="text-red-600">Leading Businesses</span> Across India
        </h2>
      </div>

      <div className="group relative mt-10 overflow-hidden">
        {/* Fade the strip out at both edges instead of hard-cutting logos */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent sm:w-32" />

        <div className="flex w-max items-center gap-3 animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused] sm:gap-5">
          {MARQUEE_LOGOS.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex h-20 w-36 shrink-0 items-center justify-center sm:h-24 sm:w-44"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={176}
                height={132}
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
