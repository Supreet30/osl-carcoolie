"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function FoundersSection() {
  return (
    <div className="flex flex-col-reverse lg:flex-row items-center w-full bg-[#F4F1E6] px-10 md:px-15 lg:px-30 py-10 md:py-14 gap-10">
      {/* TEXT */}
      <div className="flex flex-col justify-center w-full lg:w-[65%]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight uppercase tracking-tight text-gray-900"
        >
          <span className="text-red-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">O</span>m Prakash Goyal
          <br />
          <span className="text-red-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">S</span>ohan Lal Goyal
          <br />
          <span className="text-red-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">L</span>iladhar Goyal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600 text-sm sm:text-base leading-relaxed mt-6 max-w-full"
        >
          The credit for our success goes to the three brothers, Mr. Om Prakash Goyal, Mr. Sohan Lal Goyal, and
          Mr. Liladhar Goyal. Their combined vision and leadership have guided the company through strategic
          growth, operational excellence, and measurable results. Each brother contributes unique expertise,
          ensuring that every decision creates value for clients, partners, and stakeholders. Their focus on
          clarity, accountability, and purposeful execution shapes every initiative across the company.
          <br />
          <br />
          Under their leadership, the company has built a culture of collaboration, innovation, and trust.
          Teams are inspired to deliver with precision, while long-term relationships with clients and partners
          continue to strengthen. By combining industry insight with well-planned strategies, the company
          consistently achieves meaningful outcomes. Their guidance ensures OSL remains a dependable and
          impactful presence across all its business verticals.
        </motion.p>
      </div>

      {/* IMAGE */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true }}
        className="relative w-full lg:w-[35%] h-[240px] sm:h-[320px] md:h-[420px] lg:h-[500px]"
      >
        <Image
          src="/oslimage.png"
          alt="OSL Founders"
          fill
          className="object-contain lg:object-right"
          sizes="(max-width: 768px) 100vw, 35vw"
          priority
        />
      </motion.div>
    </div>
  );
}
