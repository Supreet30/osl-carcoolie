export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-slate-900"
    >
      {/*
        Placeholder for the background video. Swap this gradient layer for:
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        once the footage is ready.
      */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_30%,#c2410c_70%,#f59e0b_100%)]" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/40 to-black/10" />

      <div className="mx-auto w-full max-w-5xl px-6 text-center">
        <h1 className="text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-[64px]">
          Freight That <span className="text-red-600">Moves At The</span>
          <br />
          <span className="text-red-600">Speed</span> Across Of Now
        </h1>
      </div>
    </section>
  );
}
