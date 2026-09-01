import { Crown, User } from "lucide-react";

// Dummy placeholder org chart — swap in real names, roles and photos once
// they're finalized. Avatars are initials-in-a-circle rather than photos:
// there's no real leadership photography to attach to these placeholder
// names yet, and reusing an existing photo (e.g. the chairman's) here would
// misrepresent a real person as someone else.
const LEADERSHIP = [
  {
    name: "Rajesh Sharma",
    role: "CO-FOUNDER & OWNER",
    reports: [
      { name: "Aarav Sharma", role: "VICE PRESIDENT" },
      { name: "Ananya Sharma", role: "DIRECTOR" },
      { name: "Rohan Sharma", role: "ASSOCIATE" },
    ],
  },
  {
    name: "Vikram Mehta",
    role: "CO-FOUNDER & OWNER",
    reports: [
      { name: "Krish Mehta", role: "VICE PRESIDENT" },
      { name: "Mira Mehta", role: "DIRECTOR" },
      { name: "Neel Mehta", role: "ASSOCIATE" },
    ],
  },
  {
    name: "Sandeep Verma",
    role: "CO-FOUNDER & OWNER",
    reports: [
      { name: "Arjun Verma", role: "VICE PRESIDENT" },
      { name: "Ishita Verma", role: "DIRECTOR" },
    ],
  },
];

const AVATAR_COLORS = ["bg-slate-500", "bg-[#0b1e42]", "bg-slate-700"];

function initialsOf(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function BranchConnector({ count, className }) {
  const inset = `${100 / (2 * count)}%`;
  return (
    <span
      aria-hidden
      className={`absolute top-0 h-0.5 ${className}`}
      style={{ left: inset, right: inset }}
    />
  );
}

export default function LeadershipSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-size-[40px_40px]"
      />

      <div className="relative mx-auto max-w-6xl text-center">
        <div className="flex justify-center -space-x-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white ring-2 ring-white">
            <User className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 ring-2 ring-white">
            <User className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-2 ring-white">
            <User className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>

        <p className="mt-4 text-xs font-bold tracking-[0.2em] text-slate-400">OUR LEADERSHIP</p>
        <h2 className="mt-2 text-6xl font-extrabold">
          <span className="text-red-600">Strong Leadership.</span>{" "}
          <span className="text-[#0b1e42]">Shared Vision.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
          Built on trust and driven by shared values, our leadership team sets the standard for how
          Car Coolie approaches vehicle logistics, from operations to customer experience.
        </p>

        <div className="mt-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center pb-4">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-white px-6 py-2.5 shadow-sm">
              <Crown className="h-6 w-6 text-red-600" strokeWidth={2.2} />
              <span className="text-md font-extrabold tracking-wide text-[#0b1e42]">
                OWNERSHIP &amp; LEADERSHIP
              </span>
              <Crown className="h-6 w-6 text-red-600" strokeWidth={2.2} />
            </div>

            <div className="h-12 w-0.5 bg-red-300" />

            <div className="relative flex w-full justify-between">
              <BranchConnector count={LEADERSHIP.length} className="bg-red-300" />

              {LEADERSHIP.map((leader) => (
                <div key={leader.name} className="flex flex-1 flex-col items-center px-6">
                  <div className="h-12 w-0.5 bg-red-300" />

                  <div className="relative">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0b1e42] text-lg font-bold text-white ring-4 ring-white">
                      {initialsOf(leader.name)}
                    </span>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white ring-2 ring-white">
                      <Crown className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                  </div>
                  <p className="mt-5 text-lg font-extrabold text-[#0b1e42]">{leader.name}</p>
                  <p className="text-[12px] font-bold tracking-wide text-red-600">{leader.role}</p>

                  <div className="mt-9 h-8 w-0.5 bg-slate-300" />

                  <div className="relative flex w-full justify-between">
                    <BranchConnector count={leader.reports.length} className="bg-slate-300" />

                    {leader.reports.map((report, i) => (
                      <div key={report.name} className="flex flex-1 flex-col items-center px-4">
                        <div className="h-6 w-0.5 bg-slate-300" />
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ring-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {initialsOf(report.name)}
                        </span>
                        <p className="mt-4 max-w-28 text-md font-bold text-[#0b1e42]">{report.name}</p>
                        <p className="text-[12px] font-bold tracking-wide text-red-600">{report.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
