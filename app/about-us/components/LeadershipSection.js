import { User } from "lucide-react";

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
      </div>
    </section>
  );
}
