import { FileCheck, Receipt, Satellite, ShieldCheck, UserCheck, Radio } from "lucide-react";

// Shared across every /services/[slug] detail page — the compliance and
// regulatory standards CarCoolie's fleet and documentation already follow
// for any vehicle transport shipment in India, regardless of which service
// is being viewed.
const STANDARDS = [
  {
    icon: Satellite,
    title: "AIS-140 Certified GPS Tracking",
    description:
      "Every carrier runs on AIS-140 compliant GPS tracking, the vehicle location standard mandated by the Ministry of Road Transport and Highways for commercial fleets, so your shipment stays traceable door to door.",
  },
  {
    icon: FileCheck,
    title: "Valid National Permit Fleet",
    description:
      "Our carriers operate under valid National Permits issued under the Motor Vehicles Act, 1988, allowing lawful, unrestricted interstate movement across every state.",
  },
  {
    icon: ShieldCheck,
    title: "IRDAI-Regulated Transit Insurance",
    description:
      "Every vehicle is covered under goods-in-transit insurance for the full journey, arranged in line with IRDAI norms, at no extra cost to you.",
  },
  {
    icon: Receipt,
    title: "GST-Compliant Invoicing & E-Way Bills",
    description:
      "Every booking is backed by a GST-compliant invoice, with e-way bills generated as required under CGST rules for shipments above the applicable threshold.",
  },
  {
    icon: UserCheck,
    title: "Verified, Licensed Drivers",
    description:
      "All drivers hold valid commercial driving licences and are vetted and trained in secure vehicle loading, tie-down and handling procedures.",
  },
  {
    icon: Radio,
    title: "FASTag Enabled Fleet",
    description:
      "Our entire carrier fleet is FASTag enabled for seamless, compliant toll payments on national highways throughout the journey.",
  },
];

export default function ComplianceStandards() {
  return (
    <div className="mt-20">
      <p className="text-sm font-semibold text-red-600">Built On Indian Logistics Standards</p>
      <h2 className="mt-2 max-w-xl text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
        Compliance & Safety <span className="text-red-600">You Can Rely On</span>
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STANDARDS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-[#0b1e42]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
