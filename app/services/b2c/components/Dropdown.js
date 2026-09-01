"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// A custom listbox that replaces a bare native <select> inside "Get an
// Estimate" — the browser's own dropdown list (once opened) can't be
// restyled, which is what made it look inconsistent with the rest of the
// modal. Styled after the same floating-panel language as CityDropdown.js
// (the hero's city picker) and the Navbar's own dropdowns, just with a
// rounded-xl trigger to match this modal's other fields (Make/Model
// inputs, etc.) instead of the hero's pill shape.
export default function Dropdown({ icon: Icon, iconClassName, placeholder, value, onChange, options, disabled }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span className="relative mt-2 block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-xl bg-slate-50 py-3 pr-10 pl-4 text-left text-sm outline-none transition-colors focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? "ring-2 ring-red-500" : ""
        } ${Icon ? "pl-11" : "pl-4"}`}
      >
        {Icon && <Icon className={`pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 ${iconClassName}`} />}
        <span className={`flex-1 truncate ${value ? "font-normal text-[#0b1e42]" : "text-slate-400"}`}>{value || placeholder}</span>
      </button>
      <ChevronDown
        className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      />

      <div
        role="listbox"
        className={`absolute top-full left-0 z-20 w-full pt-2 transition-all duration-200 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="max-h-64 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/5">
          {options.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-slate-400">No options available.</p>
          ) : (
            options.map((option) => {
              const selected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    selected ? "bg-red-50 font-semibold text-red-600" : "text-[#0b1e42] hover:bg-slate-50"
                  }`}
                >
                  {option}
                  {selected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </span>
  );
}
