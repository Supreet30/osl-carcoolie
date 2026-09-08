"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  return Boolean(
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

// A small themed calendar popover — replaces the browser's native
// <input type="date"> (which can't be restyled and looks inconsistent
// across OS/browsers) with something that matches the rest of the site.
export default function DatePicker({ name, value, onChange, min, placeholder = "Select date", disabled = false }) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const minDate = parseISO(min);
  const [viewMonth, setViewMonth] = useState(selected ?? minDate ?? new Date());
  const containerRef = useRef(null);

  // If this picker gets disabled (e.g. the drop-off date while no pickup
  // date is set yet) while its popover happens to be open, close it —
  // there's nothing left that should still be clickable in it.
  if (disabled && open) {
    setOpen(false);
  }

  // `min` can change after mount (the drop-off picker's bound moves
  // forward once a pickup date — and its route's minimum transit days —
  // is chosen), and viewMonth is otherwise "stuck" wherever it was
  // initialized. Left alone, that lets the calendar pop open on a month
  // that's now entirely before the new min — every day disabled, nothing
  // clickable until the customer manually clicks to the next month.
  // Adjusting state during render (not an effect, same pattern used
  // elsewhere in this app) jumps the view forward only when the current
  // month has actually become entirely unusable, not on every min change.
  const [lastMin, setLastMin] = useState(min);
  if (min !== lastMin) {
    setLastMin(min);
    if (minDate) {
      const viewIsBeforeMin =
        viewMonth.getFullYear() < minDate.getFullYear() ||
        (viewMonth.getFullYear() === minDate.getFullYear() && viewMonth.getMonth() < minDate.getMonth());
      if (viewIsBeforeMin) {
        setViewMonth(minDate);
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const minDay = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;
  const isPrevDisabled = minDay ? new Date(year, month, 1) <= new Date(minDay.getFullYear(), minDay.getMonth(), 1) : false;

  function isDisabled(day) {
    return minDay ? new Date(year, month, day) < minDay : false;
  }

  function handlePick(day) {
    onChange(toISO(new Date(year, month, day)));
    setOpen(false);
  }

  const displayText = selected
    ? selected.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : placeholder;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value ?? ""} />
      <Calendar className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`w-full rounded-xl bg-slate-50 py-3 pr-4 pl-11 text-left text-sm outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60 ${
          selected ? "font-medium text-[#0b1e42]" : "text-slate-400"
        }`}
      >
        {displayText}
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              disabled={isPrevDisabled}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <p className="text-sm font-extrabold text-[#0b1e42]">
              {viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[10px] font-bold tracking-wide text-slate-400 uppercase">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <span key={`empty-${i}`} />;
              const date = new Date(year, month, day);
              const disabled = isDisabled(day);
              const isSelected = sameDay(date, selected);
              const isToday = sameDay(date, new Date());
              return (
                <div key={day} className="flex items-center justify-center">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePick(day)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-red-600 text-white shadow-sm"
                        : disabled
                          ? "cursor-not-allowed text-slate-300"
                          : isToday
                            ? "text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                            : "text-[#0b1e42] hover:bg-slate-100"
                    }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
