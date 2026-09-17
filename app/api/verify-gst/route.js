import { NextResponse } from "next/server";

const GSTIN_RE = /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/;
// Hardcoded for now — move to an env var (e.g. GSTIN_CHECK_API_KEY) before
// this goes further than local testing.
const GSTIN_CHECK_API_KEY = "1b8ba3760cdb68ef3678cd6ec63f1ebe";

// Proxies gstincheck.co.in instead of calling it from the browser: that API
// is plain http:// (the browser would block it as mixed content from our
// https:// page) and takes the API key in the URL path itself, which would
// otherwise sit exposed in client-side network requests for anyone to copy
// and spend against our quota.
export async function GET(request) {
  const gstin = (new URL(request.url).searchParams.get("gstin") || "").trim().toUpperCase();

  if (!GSTIN_RE.test(gstin)) {
    return NextResponse.json({ error: "Invalid GSTIN format" }, { status: 400 });
  }

  try {
    const res = await fetch(`http://sheet.gstincheck.co.in/check/${GSTIN_CHECK_API_KEY}/${gstin}`, { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!data || data.flag !== true) {
      return NextResponse.json({ flag: false, message: data?.message || "GSTIN not found." });
    }

    return NextResponse.json({ flag: true, tradeName: data.data?.tradeNam || null });
  } catch (err) {
    console.error("GSTIN verification request failed:", err.message);
    return NextResponse.json({ error: "Couldn't verify GSTIN right now." }, { status: 502 });
  }
}
