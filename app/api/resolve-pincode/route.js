import { NextResponse } from "next/server";
import { getCities } from "../../services/b2c/lib/pricing";

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

// Tries each post office entry's Block/Region/District/Circle/State against
// our serviced cities, in that priority order (Block and Region are the
// most reliable match for the town/city itself; District is often a larger
// administrative unit that doesn't line up 1:1, e.g. pincode 208001's
// District is "Kanpur Dehat" but its Region is "Kanpur"; State is a last
// resort, only useful for city-states like Delhi/Chandigarh).
function matchCity(postOffices, cityNames) {
  const byNormalized = new Map(cityNames.map((name) => [normalize(name), name]));
  const fields = ["Block", "Region", "District", "Circle", "State"];
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
    return NextResponse.json({ error: "Invalid PIN code" }, { status: 400 });
  }

  try {
    const [pinRes, cities] = await Promise.all([
      fetch(`https://api.postalpincode.in/pincode/${pincode}`, { cache: "no-store" }),
      getCities(),
    ]);
    const data = await pinRes.json().catch(() => null);
    const result = data?.[0];

    if (!result || result.Status !== "Success" || !result.PostOffice?.length) {
      return NextResponse.json({ matched: false, message: "PIN code not found." });
    }

    const cityNames = cities.map((c) => c.name);
    const matchedCity = matchCity(result.PostOffice, cityNames);
    const first = result.PostOffice[0];

    return NextResponse.json({
      matched: Boolean(matchedCity),
      city: matchedCity,
      district: first.District,
      state: first.State,
    });
  } catch (err) {
    console.error("Pincode resolution request failed:", err.message);
    return NextResponse.json({ error: "Couldn't resolve this PIN code right now." }, { status: 502 });
  }
}
