"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";

// A custom listbox styled after the site's own dropdown language (see
// ServicesDropdown/ResourcesDropdown in landing-page/components/Navbar.js:
// a floating rounded-[28px] white card, shadow-2xl, ring-1 ring-slate-900/5,
// rows on rounded-2xl with a colored icon chip) rather than a bare native
// <select> — this is the hero's primary call-to-action card, so it gets the
// same polish as the nav.
//
// `cities` is grouped-by-state — [{ label, options: string[] }], from
// groupCitiesByState() in lib/pricing.js — each group renders under a small
// state header rather than one long flat list. With 100+ cities across
// states, the search box below lets someone jump straight to a city
// instead of scrolling through every group to find it.
function CityOption({ city, value, onChange, setOpen }) {
  const selected = city === value;
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => {
        onChange(city);
        setOpen(false);
      }}
      className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors ${
        selected ? "bg-red-50" : "hover:bg-slate-50"
      }`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-red-100" : "bg-slate-100"}`}>
        <MapPin className={`h-4 w-4 ${selected ? "text-red-600" : "text-slate-400"}`} />
      </span>
      <span className={`flex-1 text-sm font-semibold ${selected ? "text-red-600" : "text-[#0b1e42]"}`}>{city}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-red-600" strokeWidth={2.5} />}
    </button>
  );
}

export default function CityDropdown({ label, placeholder, iconClassName, value, onChange, cities }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

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
  // wherever the last search left off.
  useEffect(() => {
    if (!open) return;
    setSearch("");
    searchInputRef.current?.focus();
  }, [open]);

  const query = search.trim().toLowerCase();
  const filteredGroups = query
    ? cities
        .map((group) => ({ ...group, options: group.options.filter((city) => city.toLowerCase().includes(query)) }))
        .filter((group) => group.options.length > 0)
    : cities;

  return (
    <label className="block" ref={containerRef}>
      <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</span>
      <span className="relative mt-2 block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full items-center gap-3 rounded-full bg-slate-50 py-3.5 pr-4 pl-4 text-left text-sm outline-none transition-colors focus:ring-2 focus:ring-red-500 ${
            open ? "ring-2 ring-red-500" : ""
          }`}
        >
          <MapPin className={`h-4 w-4 shrink-0 ${iconClassName}`} />
          <span className={`flex-1 truncate ${value ? "font-semibold text-[#0b1e42]" : "text-slate-400"}`}>
            {value || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <div
          role="listbox"
          className={`absolute top-full left-0 z-20 w-full pt-2 transition-all duration-200 ${
            open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <div className="rounded-[24px] bg-white p-2 shadow-2xl ring-1 ring-slate-900/5">
            {cities.length > 0 && (
              <div className="relative px-1 pt-1 pb-2">
                <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cities…"
                  className="w-full rounded-full bg-slate-50 py-2.5 pr-3 pl-10 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
            <div className="max-h-56 overflow-y-auto">
              {cities.length === 0 && <p className="px-3 py-2.5 text-sm text-slate-400">No cities available yet.</p>}
              {cities.length > 0 && filteredGroups.length === 0 && (
                <p className="px-3 py-2.5 text-sm text-slate-400">No cities match &ldquo;{search}&rdquo;.</p>
              )}
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wide text-slate-400 uppercase">{group.label}</p>
                  {group.options.map((city) => (
                    <CityOption key={city} city={city} value={value} onChange={onChange} setOpen={setOpen} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </span>
    </label>
  );
}
