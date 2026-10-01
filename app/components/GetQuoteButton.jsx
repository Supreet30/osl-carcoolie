"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Tag } from "lucide-react";

// Site-wide floating CTA next to WhatsAppButton (see FloatingActions.jsx) —
// same destination as the landing page Hero's "Get Free Quote" button
// (/services/b2c hosts the actual Get an Estimate form/modal).
export default function GetQuoteButton() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Link
        href="/services/b2c"
        className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700"
      >
        <Tag className="h-4 w-4 shrink-0" strokeWidth={2} />
        Get a Quote
      </Link>
    </motion.div>
  );
}
