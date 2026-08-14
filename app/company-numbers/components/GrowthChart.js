import Image from "next/image";

const NODES = [
  {
    year: "2022",
    title: "First Steps",
    desc: "Started operations in key cities with a focus on safe & reliable delivery.",
    card: { left: "15%", top: "64%" },
    circle: { left: "15%", top: "70%" },
    dot: { left: "15%", top: "85%" },
  },
  {
    year: "2023",
    title: "Network Expansion",
    desc: "Expanded to more cities and strengthened our logistics network.",
    card: { left: "39%", top: "60%" },
    circle: { left: "39%", top: "66%" },
    dot: { left: "39%", top: "81%" },
  },
  {
    year: "2024",
    title: "Customer Growth",
    desc: "Thousands of customers chose CarCoolie for stress-free and secure vehicle transport.",
    card: { left: "63%", top: "54%" },
    circle: { left: "63%", top: "60%" },
    dot: { left: "63%", top: "75%" },
  },
  {
    year: "2025",
    title: "Nationwide Reach",
    desc: "Reaching 28+ states with 650+ service locations across India.",
    card: { left: "88%", top: "46%" },
    circle: { left: "88%", top: "51%" },
    dot: { left: "88%", top: "66%" },
  },
];

export default function GrowthChart() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold text-red-600">Growth Chart</p>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          <span className="text-[#0b1e42]">Growth That Keeps </span>
          <span className="text-red-600">Moving Forward</span>
        </h2>

        {/* Staircase timeline — desktop only, positions are % coordinates
            within this relative box so the curve/dots/cards stay in sync
            at any width. */}
        <div className="relative mt-16 hidden h-[420px] sm:block">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <marker
                id="growth-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="4"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
              </marker>
            </defs>
            <path
              d="M15,85 C 24,78 30,73 39,81 C 48,89 56,72 63,75 C 71,78 80,69 86,67"
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              markerEnd="url(#growth-arrow)"
            />
          </svg>

          {NODES.map((node) => (
            <div key={node.year} className="contents">
              {/* dot */}
              <span
                className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 ring-4 ring-white"
                style={{ left: node.dot.left, top: node.dot.top }}
              />
              {/* connector from dot up to the photo circle */}
              <span
                className="absolute w-0.5 -translate-x-1/2 bg-red-300"
                style={{
                  left: node.dot.left,
                  top: node.circle.top,
                  height: `calc(${node.dot.top} - ${node.circle.top})`,
                }}
              />
              {/* photo circle */}
              <div
                className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white shadow-lg"
                style={{ left: node.circle.left, top: node.circle.top }}
              >
                <Image src="/circleimg.jpg" alt="" fill className="object-cover" />
              </div>
              {/* card — inverts to navy on hover, same treatment as the
                  "What Sets CarCoolie Apart" cards. */}
              <div
                className="group absolute w-48 -translate-x-1/2 -translate-y-full rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-900/5 transition-colors duration-300 hover:bg-[#0b1e42] hover:ring-transparent"
                style={{ left: node.card.left, top: node.card.top }}
              >
                <p className="text-sm font-extrabold text-red-600 transition-colors duration-300 group-hover:text-red-400">
                  {node.year}
                </p>
                <p className="mt-1 text-sm font-bold text-[#0b1e42] transition-colors duration-300 group-hover:text-white">
                  {node.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
                  {node.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile fallback — plain vertical timeline */}
        <ol className="mt-10 flex flex-col gap-6 sm:hidden">
          {NODES.map((node) => (
            <li key={node.year} className="flex gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg ring-1 ring-slate-900/5">
                <Image src="/circleimg.jpg" alt="" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-red-600">{node.year}</p>
                <p className="mt-1 text-sm font-bold text-[#0b1e42]">{node.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{node.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
