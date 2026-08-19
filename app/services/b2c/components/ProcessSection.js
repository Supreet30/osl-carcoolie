import { CheckCircle2, FileEdit, FileSearch, PackageCheck } from "lucide-react";

const STEPS = [
  { icon: FileEdit, label: "Step 01", title: "Enter Your Details" },
  { icon: FileSearch, label: "Step 02", title: "Get Your Quote" },
  { icon: CheckCircle2, label: "Step 03", title: "Confirm Your Booking" },
  { icon: PackageCheck, label: "Step 04", title: "Track & Receive" },
];

function StepCard({ icon: Icon, label, title }) {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-l-2xl bg-linear-to-r from-white to-red-50 py-4 pr-16 pl-20 shadow-md sm:pl-24">
        <p className="text-[11px] font-extrabold tracking-wide text-red-500 uppercase">{label}</p>
        <p className="mt-0.5 text-xl font-extrabold text-[#0b1e42] sm:text-2xl">{title}</p>

        <span
          aria-hidden
          className="absolute inset-y-0 right-0 w-16 bg-red-600"
          style={{ clipPath: "polygon(0 0, 50% 0, 100% 50%, 50% 100%, 0 100%, 50% 50%)" }}
        />
      </div>

      <span className="absolute top-1/2 -left-12 z-10 flex h-24 w-24 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-red-300 text-red-600">
          <Icon className="h-7 w-7" strokeWidth={2} />
        </span>
      </span>
    </div>
  );
}

export default function ProcessSection() {
  return (
    <section className="bg-slate-50 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-100 sm:p-12">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-xs font-extrabold tracking-wide text-red-600 uppercase">
            The Process
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#0b1e42] sm:text-5xl">
            How CarCoolie <span className="text-red-600">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
            From quote to doorstep delivery, we keep your car transportation simple, transparent and
            stress-free.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative mx-auto flex aspect-square w-full max-w-80 items-center justify-center rounded-full border border-red-200">
            <div className="flex aspect-square w-[82%] items-center justify-center rounded-full bg-linear-to-br from-red-200 via-red-100 to-red-50">
              <div className="flex aspect-square w-[72%] flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                <p className="text-[11px] font-bold tracking-[0.2em] text-red-500 uppercase">Simple</p>
                <p className="mt-1 text-2xl font-extrabold text-[#0b1e42]">4 Easy Steps</p>
                <span aria-hidden className="mt-3 h-0.5 w-10 rounded-full bg-red-200" />
                <p className="mt-3 max-w-40 text-xs leading-relaxed text-slate-500">
                  From booking to delivery, nothing complicated.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {STEPS.map((step) => (
              <StepCard key={step.label} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
