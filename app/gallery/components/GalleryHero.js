import Image from "next/image";
import Navbar from "../../landing-page/components/Navbar";

export default function GalleryHero() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-white px-6 pt-32 pb-16 sm:pt-34 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -left-28 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]"
      />
      <Navbar />

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-lg">
          <h1 className="text-6xl font-extrabold leading-[1.2] tracking-tight">
            <span className="block text-[#0b1e42]">A Look Into Our</span>
            <span className="block text-red-600">Journey.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            From car pickups to safe deliveries across India, explore the moments that drive our
            commitment to trust, care, and perfection.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-10">
            {[
              { position: "30% 40%", zoom: 1.3 },
              { position: "60% 35%", zoom: 1.4 },
            ].map(({ position, zoom }, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-2xl shadow-lg"
              >
                <Image
                  src="/servicehero.png"
                  alt="CarCoolie carrier truck transporting vehicles"
                  fill
                  sizes="180px"
                  className="object-cover"
                  style={{ objectPosition: position, transform: `scale(${zoom})` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-6/5 w-full overflow-hidden rounded-[28px] shadow-xl">
          <Image
            src="/servicehero.png"
            alt="CarCoolie carrier truck transporting vehicles on the highway"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 52vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
