import Image from "next/image";

export default function ChairmanMessage() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-md font-semibold text-red-600">Chairman Message</p>
        <h2 className="mt-3 text-6xl font-extrabold tracking-tight text-[#0b1e42]">
          A Message From <span className="text-red-600">Our Leadership</span>
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-2xl">
            <Image
              src="/chairman.png"
              alt="Nirmal Kumar Goyal, Chairman OSL Group"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="text-4xl font-extrabold leading-snug text-[#0b1e42]">
              Driving Trust. Delivering{" "}
              <span className="text-red-600">Every Journey with Care.</span>
            </h3>

            <p className="mt-6 text-justify text-md leading-relaxed text-slate-500">
              At CarCoolie, we believe that every vehicle carries more than just
              value—it carries memories, aspirations, and trust. Our mission is
              to ensure that every car entrusted to us reaches its destination
              safely, securely, and on time. This commitment has been the
              foundation of our journey since day one.
            </p>
            <p className="mt-4 text-justify text-md leading-relaxed text-slate-500">
              As India&apos;s transportation landscape continues to evolve,
              customers expect more than just vehicle movement. They seek
              reliability, transparency, and peace of mind throughout the
              entire journey.
            </p>

            <div className="mt-6">
              <p className="text-2xl font-bold text-[#0b1e42]">Nirmal Kumar Goyal</p>
              <p className="text-md font-semibold text-red-600">Chairman OSL Group</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
