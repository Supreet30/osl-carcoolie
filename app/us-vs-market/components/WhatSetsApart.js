import Image from "next/image";
import { Camera, MapPin } from "lucide-react";

export default function WhatSetsApart() {
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold text-red-600">Built Different</p>
        <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          <span className="text-[#0b1e42]">What Sets </span>
          <span className="text-red-600">CarCoolie Apart?</span>
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-[7fr_3fr]">
          {/* 01 — Nationwide Reach, Local Precision. Card inverts to navy on hover. */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-transparent hover:bg-[#0b1e42]">
            <p className="text-5xl font-extrabold text-red-100 transition-colors duration-300 group-hover:text-red-400">
              01
            </p>
            <h3 className="mt-3 text-3xl font-extrabold text-[#0b1e42] transition-colors duration-300 group-hover:text-white">
              Nationwide Reach, <span className="text-red-600">Local Precision</span>
            </h3>
            <p className="mt-2 max-w-xl text-md leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
              From metro cities to smaller towns, our network is built for both safety and speed,
              covering 100+ cities and 650+ service locations across India.
            </p>
            <div className="relative mt-4 h-48 w-full overflow-hidden rounded-2xl">
              <Image src="/finalimages/us-vs-market/builtdiff1.JPG" alt="" fill className="object-cover" />
            </div>
          </div>

          {/* 02 — Safe & Professional. Card inverts to navy on hover. */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-transparent hover:bg-[#0b1e42]">
            <p className="text-5xl font-extrabold text-red-100 transition-colors duration-300 group-hover:text-red-400">
              02
            </p>
            <h3 className="mt-3 text-3xl font-extrabold text-[#0b1e42] transition-colors duration-300 group-hover:text-white">
              Safe &amp; <span className="text-red-600">Professional</span>
            </h3>
            <p className="mt-2 text-md leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
              Our handlers are trained professionals experienced in transporting everything from
              everyday vehicles to premium and vintage cars.
            </p>
            <div className="relative mt-4 h-40 w-full overflow-hidden rounded-2xl">
              <Image src="/finalimages/us-vs-market/builtdiff2.JPG" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* 03 — Transparent & Connected. Card inverts to navy on hover. */}
        <div className="group relative mt-6 flex flex-col gap-6 overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-transparent hover:bg-[#0b1e42] sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-5xl font-extrabold text-red-100 transition-colors duration-300 group-hover:text-red-400">
              03
            </p>
            <h3 className="mt-3 text-3xl font-extrabold text-[#0b1e42] transition-colors duration-300 group-hover:text-white">
              Transparent <span className="text-red-600">&amp; Connected</span>
            </h3>
            <p className="mt-2 max-w-md text-md leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-300">
              No more guessing. Our GPS tracking dashboard gives you live GPS updates,
              direct support access, and photo documentation at every milestone.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-red-400">
                <MapPin className="h-6 w-6" />
                GPS Tracking
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-red-400">
                <Camera className="h-6 w-6" />
                Live Photo Documentation
              </span>
            </div>
          </div>
          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl sm:h-56 sm:w-md">
            <Image src="/finalimages/us-vs-market/builtdiff3.JPG" alt="" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
