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
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          Car Coolie Logistics in Numbers
        </h2>

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
