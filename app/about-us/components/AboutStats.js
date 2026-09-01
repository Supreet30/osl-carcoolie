const STATS = [
  { value: "10+", label: "Years Of Excellence" },
  { value: "50000+", label: "Cars Delivered" },
  { value: "25+", label: "States Covered" },
  { value: "100+", label: "Team Members" },
];

export default function AboutStats() {
  return (
    <section className="bg-[#0b1e42] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold text-red-500">Car Coolie Logistics in Numbers</p>
        <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          A Decade Of Trusted Vehicle Transport
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Over 10 years of experience, 50,000+ cars delivered, 25+ states covered and a 100+
          member team make Car Coolie one of India&apos;s most established vehicle transport
          companies.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-extrabold text-red-500 sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-xs font-bold tracking-[0.14em] text-slate-400">
                {stat.label.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
