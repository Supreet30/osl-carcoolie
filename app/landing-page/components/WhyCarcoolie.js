import Link from "next/link";
import { Zap, Globe, Clock, Shield, BarChart3, Check, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Quotes",
    description: "AI-powered pricing in under 90 seconds, 24/7.",
  },
  {
    icon: Globe,
    title: "150+ Countries",
    description: "One platform. Every major lane. Worldwide.",
  },
  {
    icon: Clock,
    title: "99.2% On-Time",
    description: "Industry-leading reliability, verified monthly.",
  },
  {
    icon: Shield,
    title: "Full Coverage",
    description: "Every shipment insured from pickup to drop-off.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Dashboards, spend reports, and delay alerts.",
  },
  {
    icon: Check,
    title: "Customs Clearance",
    description: "Docs handled. Duties calculated. No surprises.",
  },
];

export default function WhyCarcoolie() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Why Carcoolie</p>
          <h2 className="mt-4 text-7xl font-extrabold leading-[1.05] tracking-tight text-[#0b1e42]">
            Built for teams
            <br />
            that move <span className="text-red-600">fast</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            In a market full of promises, we ship proof. Every metric, every
            milestone, every delivery.
          </p>
          <Link
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Partner with us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 hover:border-red-600"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors duration-200 group-hover:bg-red-100 group-hover:text-red-600">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-bold text-[#0b1e42] transition-colors duration-200 group-hover:text-red-600">
                {title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
