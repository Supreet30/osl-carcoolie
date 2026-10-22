import { Users } from "lucide-react";

export default function ServiceWhoItsFor({ service }) {
  return (
    <div className="mt-20">
      <p className="text-sm font-semibold text-red-600">Built For</p>
      <h2 className="mt-2 max-w-xl text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
        Who {service.title} <span className="text-red-600">Is For</span>
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {service.whoItsFor.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Users className="h-4 w-4" />
            </span>
            <p className="text-sm leading-relaxed font-semibold text-[#0b1e42]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
