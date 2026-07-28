import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@,"]+@[^\s@,"]+\.[^\s@,"]+$/;
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzyBglPo_To1ocv8AbkxoPpOeQZZ6QhSMW2WO8jlN9wFlaymzCSRMLAHbiXH866C-Bk/exec";

export async function POST(request) {
  const { email } = await request.json();

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new Error(data.error || `Google Sheets request failed (${res.status})`);
    }
  } catch (err) {
    console.error("Failed to save subscriber email:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
