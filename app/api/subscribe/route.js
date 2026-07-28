import { NextResponse } from "next/server";
import { mkdir, appendFile, readFile, access as fsAccess } from "fs/promises";
import path from "path";
import { put, head } from "@vercel/blob";

const EMAIL_RE = /^[^\s@,"]+@[^\s@,"]+\.[^\s@,"]+$/;
const CSV_HEADER = "email,submitted_at\n";
const BLOB_PATHNAME = "subscribers.csv";

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "subscribers.csv");

function escapeCsvField(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toRow(email) {
  return [escapeCsvField(email), escapeCsvField(new Date().toISOString())].join(",") + "\n";
}

// Production (Vercel): the filesystem is read-only/ephemeral per request,
// so persist the CSV as a Vercel Blob instead of a local file.
async function appendToBlob(row) {
  let existing = CSV_HEADER;
  try {
    const blob = await head(BLOB_PATHNAME);
    existing = await (await fetch(blob.url)).text();
  } catch {
    // no blob yet, start fresh with just the header
  }

  const updated = existing.endsWith("\n") ? existing + row : `${existing}\n${row}`;

  await put(BLOB_PATHNAME, updated, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/csv",
  });
}

// Local dev: no Blob token available, so fall back to a file on disk.
async function appendToLocalFile(row) {
  await mkdir(DATA_DIR, { recursive: true });

  let fileExists = true;
  try {
    await fsAccess(CSV_PATH);
  } catch {
    fileExists = false;
  }

  await appendFile(CSV_PATH, fileExists ? row : CSV_HEADER + row, "utf8");
}

async function readFromBlob() {
  try {
    const blob = await head(BLOB_PATHNAME);
    return await (await fetch(blob.url)).text();
  } catch {
    return CSV_HEADER;
  }
}

async function readFromLocalFile() {
  try {
    return await readFile(CSV_PATH, "utf8");
  } catch {
    return CSV_HEADER;
  }
}

export async function GET(request) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.SUBSCRIBERS_SECRET || secret !== process.env.SUBSCRIBERS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv = process.env.BLOB_READ_WRITE_TOKEN
    ? await readFromBlob()
    : await readFromLocalFile();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}

export async function POST(request) {
  const { email } = await request.json();

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const row = toRow(email);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await appendToBlob(row);
  } else {
    await appendToLocalFile(row);
  }

  return NextResponse.json({ success: true });
}
