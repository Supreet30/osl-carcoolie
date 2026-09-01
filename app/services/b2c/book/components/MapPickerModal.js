"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Search, X } from "lucide-react";
import {
  forwardGeocode,
  forwardGeocodeGoogle,
  reverseGeocode,
  reverseGeocodeGoogle,
  searchSuggestions,
  searchSuggestionsGoogle,
} from "../lib/geocode";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Debounce delay for live suggestions, and the minimum query length before
// bothering to fetch any — short prefixes ("de", "mu") return too many
// irrelevant matches to be useful and just burn requests against
// Nominatim's ~1 req/sec usage policy.
const SUGGEST_DEBOUNCE_MS = 350;
const MIN_SUGGEST_LENGTH = 3;

const mapLoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center bg-slate-100">
    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
  </div>
);

// Both map components touch `window` on import, so they can only ever run
// client-side — dynamic-import with ssr disabled rather than guarding every
// render. Google Maps needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (see
// .env.local.example); without it, this falls back to the free, keyless
// Leaflet/OpenStreetMap map — same picker UI either way.
const PickerMap = GOOGLE_MAPS_KEY
  ? dynamic(() => import("./GoogleMap"), { ssr: false, loading: mapLoadingFallback })
  : dynamic(() => import("./LeafletMap"), { ssr: false, loading: mapLoadingFallback });

const INDIA_CENTER = [22.9734, 78.6569];

export default function MapPickerModal({ open, onClose, onConfirm }) {
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const searchBoxRef = useRef(null);
  const debounceRef = useRef(null);
  const latestQueryRef = useRef("");

  // Closes the suggestions dropdown on an outside click or Escape — same
  // idea as CityDropdown.js's own listbox on the hero page.
  useEffect(() => {
    if (!suggestionsOpen) return undefined;
    function handlePointerDown(event) {
      if (!searchBoxRef.current?.contains(event.target)) setSuggestionsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setSuggestionsOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [suggestionsOpen]);

  if (!open) return null;

  async function handlePick(lat, lng) {
    setSuggestionsOpen(false);
    setMarker([lat, lng]);
    setLoading(true);
    try {
      const label = GOOGLE_MAPS_KEY ? await reverseGeocodeGoogle(lat, lng) : await reverseGeocode(lat, lng);
      setAddress(label);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  }

  // Fires (debounced) on every keystroke — shows candidates as the
  // customer types, the way Google Maps' own search bar does. Guarded by
  // latestQueryRef so a slow, stale response can't clobber what a faster,
  // more recent keystroke's request already returned.
  async function fetchSuggestions(query) {
    latestQueryRef.current = query;
    setSuggestLoading(true);
    try {
      const results = GOOGLE_MAPS_KEY ? await searchSuggestionsGoogle(query) : await searchSuggestions(query);
      if (latestQueryRef.current !== query) return;
      setSuggestions(results);
      setSuggestionsOpen(true);
    } catch {
      if (latestQueryRef.current !== query) return;
      setSuggestions([]);
    } finally {
      if (latestQueryRef.current === query) setSuggestLoading(false);
    }
  }

  function handleQueryChange(event) {
    const value = event.target.value;
    setSearchQuery(value);
    setSearchError("");
    clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < MIN_SUGGEST_LENGTH) {
      latestQueryRef.current = "";
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(trimmed), SUGGEST_DEBOUNCE_MS);
  }

  function handleSelectSuggestion(result) {
    clearTimeout(debounceRef.current);
    setMarker([result.lat, result.lng]);
    setAddress(result.address);
    setSearchQuery(result.address);
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSearchError("");
  }

  // Typing a place/address and hitting Enter (or clicking Search) without
  // picking a suggestion first — same idea as Google Maps' own search bar
  // — jumps the map there and drops the pin, reusing the same `marker`
  // state a manual click would set (both PickerMap backends already react
  // to it and pan there on their own).
  //
  // This is a plain function, not a <form onSubmit>, because
  // MapPickerModal renders inside BookingForm.js's own outer <form> —
  // nesting a second <form> inside it is invalid HTML (React would warn
  // about it, and a real browser auto-closes the outer one when it hits
  // this tag, which broke Enter-to-search entirely by submitting the
  // booking form instead).
  async function handleSearch() {
    const query = searchQuery.trim();
    if (!query) return;
    setSuggestionsOpen(false);
    setSearching(true);
    setSearchError("");
    try {
      const result = GOOGLE_MAPS_KEY ? await forwardGeocodeGoogle(query) : await forwardGeocode(query);
      setMarker([result.lat, result.lng]);
      setAddress(result.address);
    } catch (err) {
      setSearchError(err.message || "Couldn't find that location.");
    } finally {
      setSearching(false);
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    // Enter picks the top suggestion already showing rather than
    // re-querying for the same thing a second time.
    if (suggestionsOpen && suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else {
      handleSearch();
    }
  }

  function handleConfirm() {
    if (!marker) return;
    onConfirm({ address, lat: marker[0], lng: marker[1] });
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 py-8" onClick={onClose}>
      <div
        className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-lg font-extrabold text-[#0b1e42]">Select on Map</p>
            <p className="text-xs text-slate-500">Click anywhere on the map to drop a pin.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex-1">
          <div ref={searchBoxRef} className="absolute top-3 right-3 left-3 z-10">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg ring-1 ring-slate-900/5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleQueryChange}
                onFocus={() => {
                  if (suggestions.length > 0) setSuggestionsOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for a location…"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#0b1e42] outline-none placeholder:text-slate-400"
              />
              {searching ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
              ) : (
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  className="shrink-0 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Search
                </button>
              )}
            </div>

            {suggestionsOpen && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/5">
                {suggestLoading && suggestions.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching&hellip;
                  </div>
                ) : suggestions.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-400">No matches yet — keep typing or press Enter.</p>
                ) : (
                  suggestions.map((s, i) => (
                    <button
                      key={`${s.lat},${s.lng},${i}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                      <span className="text-sm text-[#0b1e42]">{s.address}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {!suggestionsOpen && searchError && (
              <p className="mt-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-lg ring-1 ring-slate-900/5">
                {searchError}
              </p>
            )}
          </div>
          <PickerMap center={marker ?? INDIA_CENTER} marker={marker} onPick={handlePick} />
        </div>

        <div className="shrink-0 border-t border-slate-100 px-6 py-5">
          <div className="flex items-start gap-2 text-sm text-[#0b1e42]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" strokeWidth={2} />
            {loading ? (
              <span className="text-slate-400">Looking up address&hellip;</span>
            ) : marker ? (
              <span>{address}</span>
            ) : (
              <span className="text-slate-400">No location selected yet.</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!marker || loading}
            className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
