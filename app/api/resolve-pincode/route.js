import { NextResponse } from "next/server";
import { getCities } from "../../services/b2c/lib/pricing";
import { CORS_HEADERS } from "../_cors";

export { OPTIONS } from "../_cors";

const PIN_RE = /^\d{6}$/;

// Normalizes a candidate string from the postal API for comparison against
// our own city names — postal HQ region names come back as e.g. "Jaipur HQ"
// or "Lucknow  HQ" (double space), neither of which match "Jaipur"/"Lucknow"
// verbatim.
function normalize(str) {
  return (str || "")
    .replace(/\s+hq\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Tries each post office entry's Block/District/Region/Circle/State against
// our serviced cities, in that priority order. Block is the smallest, most
// reliable unit when present. District comes next, ahead of Region — Region
// is a postal head-office jurisdiction that can span a much wider area than
// the actual town (pincode 122051's Region is "Ambala HQ" despite being a
// Gurgaon pincode; its District, "Gurgaon", is the correct match). Region
// still has its place: it catches cases where District is itself a larger
// unit than the actual city (pincode 208001's District is "Kanpur Dehat",
// but Block and Region both correctly say "Kanpur") — Block already resolves
// that case ahead of Region, so moving Region after District doesn't lose
// it. State is a last resort, only useful for city-states like
// Delhi/Chandigarh.
function matchCity(postOffices, cityNames) {
  const byNormalized = new Map(cityNames.map((name) => [normalize(name), name]));
  const fields = ["Block", "District", "Region", "Circle", "State"];
  for (const field of fields) {
    for (const po of postOffices) {
      const match = byNormalized.get(normalize(po[field]));
      if (match) return match;
    }
  }
  return null;
}

// Proxied (rather than called from the browser) so the pincode->city
// matching logic lives in one place against a live copy of our own cities
// list, instead of duplicating that list/logic into the client bundle.
export async function GET(request) {
  const pincode = (new URL(request.url).searchParams.get("pincode") || "").trim();

  if (!PIN_RE.test(pincode)) {
    return NextResponse.json({ error: "Invalid PIN code" }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const [pinRes, cities] = await Promise.all([
      // A PIN's post-office data essentially never changes, so this is
      // cached for 30 days rather than fetched fresh on every call — it's
      // a free, unauthenticated third-party service with no SLA, shared
      // between this site's own PIN lookups and any partner app calling
      // this endpoint; caching protects both from exhausting the same
      // external quota, and makes repeat lookups of common PINs instant.
      fetch(`https://api.postalpincode.in/pincode/${pincode}`, { next: { revalidate: 2592000 } }),
      getCities(),
    ]);
    const data = await pinRes.json().catch(() => null);
    const result = data?.[0];

    if (!result || result.Status !== "Success" || !result.PostOffice?.length) {
      return NextResponse.json({ matched: false, message: "PIN code not found." }, { headers: CORS_HEADERS });
    }

    const cityNames = cities.map((c) => c.name);
    const matchedCity = matchCity(result.PostOffice, cityNames);
    const first = result.PostOffice[0];

    return NextResponse.json(
      {
        matched: Boolean(matchedCity),
        city: matchedCity,
        district: first.District,
        state: first.State,
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
