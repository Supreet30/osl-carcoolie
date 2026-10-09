import { NextResponse } from "next/server";
import { getCities } from "../../services/b2c/lib/pricing";
import { supabase } from "../../../lib/supabaseClient";
import { CORS_HEADERS } from "../_cors";

export { OPTIONS } from "../_cors";

const PIN_RE = /^\d{6}$/;

// Normalizes a candidate string from pincode_directory for comparison
// against our own city names. "NA" is this dataset's literal placeholder
// for a missing value — treated as empty so it can never accidentally
// match a city. Handles three other known India Post data quirks,
// confirmed during a full audit of every serviced city:
//   - "Delhi Circle" / "Hyderabad Region" -> "Delhi" / "Hyderabad" — every
//     circle/region name carries that word as a suffix.
//   - "Tirupati (Urban)" / "Bijapur(KAR)" -> "Tirupati" / "Bijapur" — a
//     parenthetical disambiguator for urban/rural splits or same-named
//     places in different states.
//   - "Kanpur Nagar" / "Kanpur Dehat" -> "Kanpur" — Kanpur's district is
//     officially split this way (urban vs rural), neither half ever equals
//     the plain city name otherwise.
function normalize(str) {
  if (!str || str.trim().toUpperCase() === "NA") return "";
  return str
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+(circle|region|division|hq)\s*$/i, "")
    .replace(/\s+(nagar|dehat)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// office_name is the one field with its own separate suffix convention —
// an office-type marker ("Baroda House SO", "Satara H.O", "Khuda Ali Sher
// B.O") that's specific to this field alone, never present on
// district/state/circle.
function stripOfficeSuffix(name) {
  return (name || "").replace(/\s+(s\.?o\.?|b\.?o\.?|h\.?o\.?|g\.?p\.?o\.?|po)\s*$/i, "").trim();
}

// pincode_directory's district/state_name are ALL CAPS throughout (that's
// how the source CSV has them) — title-cased here for display, since every
// caller of this route shows these to the customer (e.g. the "PIN not
// serviced yet" message names the district/state it detected). "NA" is the
// same literal missing-value placeholder normalize() already treats as
// empty — returned as null here rather than the word "Na".
function toTitleCase(str) {
  if (!str || str.trim().toUpperCase() === "NA") return null;
  return str.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

// India's genuine "the state IS the city" cases — the only names State/
// Circle are ever allowed to match against (see matchCity below), not a
// general fallback for every city. Delhi has zero post offices whose
// District or office_name literally say "Delhi" (verified against the
// full directory — every one uses a sub-area like "New Delhi"/"Shahdara"/
// "South West") — only State/Circle ever do, so without this narrow
// exception Delhi would be completely unresolvable by pincode. Chandigarh
// doesn't actually need this (its District is always exactly
// "Chandigarh"), but costs nothing to include. Puducherry isn't a
// serviced city today but is the same kind of case if that ever changes.
const CITY_STATE_NAMES = new Set(["delhi", "chandigarh", "puducherry"]);

// Tries each post office record's office_name/district against our
// serviced cities first — office_name is the smallest, most reliable unit
// when it happens to equal the city itself (the city's own head office);
// district comes next and is the main workhorse, resolving the large
// majority of cities correctly in the full audit.
//
// Region is deliberately NOT checked at all — it's a postal head-office
// jurisdiction that can span real distance well beyond the actual town
// (pincode 415001 is Satara, a town ~110km from Pune, but its Region is
// "Pune" — matching Region would silently resolve a Satara pickup/dropoff
// as if it were Pune, wrong for both distance-based pricing and yard/driver
// assignment). An unserviced town correctly falls through to "not
// serviced" instead of snapping to a same-region hub city.
//
// State/Circle are NOT a general fallback either, for the same reason —
// "Maharashtra"/"Uttar Pradesh" span real distance just like Region did.
// They're only ever consulted for the narrow CITY_STATE_NAMES exception
// above, where the state name and the city are genuinely the same place.
function matchCity(records, cityNames) {
  const byNormalized = new Map(cityNames.map((name) => [normalize(name), name]));

  for (const field of ["office_name", "district"]) {
    for (const r of records) {
      const raw = field === "office_name" ? stripOfficeSuffix(r[field]) : r[field];
      const match = byNormalized.get(normalize(raw));
      if (match) return match;
    }
  }

  for (const field of ["state_name", "circle_name"]) {
    for (const r of records) {
      const n = normalize(r[field]);
      if (!CITY_STATE_NAMES.has(n)) continue;
      const match = byNormalized.get(n);
      if (match) return match;
    }
  }

  return null;
}

// Self-hosted (app/api/resolve-pincode doesn't call any external service
// anymore) — pincode_directory is a one-time import of India Post's full
// office list (~165k rows, see supabase-schema.sql), replacing the free,
// unofficial api.postalpincode.in. That service had no SLA and turned out
// to be internally inconsistent (the same district spelled with and
// without a space across different pincodes) — self-hosting means no rate
// limits, no uptime risk, and any future data-quality fix only has to be
// made once, here, in data we control.
export async function GET(request) {
  const pincode = (new URL(request.url).searchParams.get("pincode") || "").trim();

  if (!PIN_RE.test(pincode)) {
    return NextResponse.json({ error: "Invalid PIN code" }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const [{ data: records, error }, cities] = await Promise.all([
      supabase
        .from("pincode_directory")
        .select("office_name, district, state_name, circle_name")
        .eq("pincode", pincode),
      getCities(),
    ]);
    if (error) throw error;

    if (!records || records.length === 0) {
      return NextResponse.json({ matched: false, message: "PIN code not found." }, { headers: CORS_HEADERS });
    }

    const cityNames = cities.map((c) => c.name);
    const matchedCity = matchCity(records, cityNames);
    const first = records[0];

    return NextResponse.json(
      {
        matched: Boolean(matchedCity),
        city: matchedCity,
        district: toTitleCase(first.district),
        state: toTitleCase(first.state_name),
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Pincode resolution request failed:", err.message);
    return NextResponse.json(
      { error: "Couldn't resolve this PIN code right now." },
      { status: 502, headers: CORS_HEADERS }
    );
  }
}
