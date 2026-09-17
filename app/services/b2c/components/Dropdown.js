"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

// A custom listbox that replaces a bare native <select> inside "Get an
// Estimate" — the browser's own dropdown list (once opened) can't be
// restyled, which is what made it look inconsistent with the rest of the
// modal. Styled after the same floating-panel language as CityDropdown.js
// (the hero's city picker) and the Navbar's own dropdowns, just with a
// rounded-xl trigger to match this modal's other fields (Make/Model
// inputs, etc.) instead of the hero's pill shape.
// `options` is normally a flat string[] (Make/Model/Year). Pass a grouped
// shape instead — [{ label, options: string[] }], e.g. from
// groupCitiesByState() — to render section headers (used for the city
// pickers), which also turns on the search box below (Make/Model/Year stay
// short flat lists that don't need one).
function OptionButton({ option, value, onChange, setOpen }) {
  const selected = option === value;
  return (
    <button
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
}

export default function Dropdown({ icon: Icon, iconClassName, placeholder, value, onChange, options, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const isGrouped = options.length > 0 && typeof options[0] === "object";

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

  // Starts each opening with an empty, focused search box rather than
  // wherever the last search left off. Only relevant for grouped (city)
  // dropdowns — the ref simply isn't attached to anything otherwise.
  useEffect(() => {
    if (!open) return;
    setSearch("");
    if (isGrouped) searchInputRef.current?.focus();
  }, [open, isGrouped]);

  const query = search.trim().toLowerCase();
  const filteredGroups =
    isGrouped && query
      ? options
          .map((group) => ({ ...group, options: group.options.filter((option) => option.toLowerCase().includes(query)) }))
          .filter((group) => group.options.length > 0)
      : options;

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
        <div className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/5">
          {isGrouped && options.length > 0 && (
            <div className="relative px-1 pt-1 pb-2">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities…"
                className="w-full rounded-xl bg-slate-50 py-2.5 pr-3 pl-10 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-slate-400">No options available.</p>
            ) : isGrouped ? (
              <>
                {filteredGroups.length === 0 && (
                  <p className="px-3 py-2.5 text-sm text-slate-400">No cities match &ldquo;{search}&rdquo;.</p>
                )}
                {filteredGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">{group.label}</p>
                    {group.options.map((option) => (
                      <OptionButton key={option} option={option} value={value} onChange={onChange} setOpen={setOpen} />
                    ))}
                  </div>
                ))}
              </>
            ) : (
              options.map((option) => (
                <OptionButton key={option} option={option} value={value} onChange={onChange} setOpen={setOpen} />
              ))
            )}
          </div>
        </div>
      </div>
    </span>
  );
}
