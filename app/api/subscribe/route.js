import { NextResponse } from "next/server";
import { mkdir, appendFile, readFile, access as fsAccess } from "fs/promises";
import path from "path";
import { put, get, BlobPreconditionFailedError } from "@vercel/blob";

const EMAIL_RE = /^[^\s@,"]+@[^\s@,"]+\.[^\s@,"]+$/;
const CSV_HEADER = "email,submitted_at\n";
const BLOB_PATHNAME = "subscribers.csv";
const MAX_WRITE_ATTEMPTS = 3;

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "subscribers.csv");

function escapeCsvField(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toRow(email) {
  return [escapeCsvField(email), escapeCsvField(new Date().toISOString())].join(",") + "\n";
}

function streamToText(stream) {
  return new Response(stream).text();
}

// Production (Vercel): the filesystem is read-only/ephemeral per request, so
// persist the CSV as a private Vercel Blob instead of a local file. Reads
// bypass the CDN cache (useCache: false) and writes use ifMatch on the
// blob's ETag so two simultaneous submissions can't silently clobber one
// another — a conflicting write retries with the freshly-read content.
async function appendToBlob(row) {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const existing = await get(BLOB_PATHNAME, { access: "private", useCache: false });
    const currentText = existing ? await streamToText(existing.stream) : CSV_HEADER;
    const etag = existing?.blob.etag;

    const updated = currentText.endsWith("\n") ? currentText + row : `${currentText}\n${row}`;

    try {
      await put(BLOB_PATHNAME, updated, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "text/csv",
        ...(etag ? { ifMatch: etag } : {}),
      });
      return;
    } catch (err) {
      const isLastAttempt = attempt === MAX_WRITE_ATTEMPTS - 1;
      if (err instanceof BlobPreconditionFailedError && !isLastAttempt) {
        continue; // someone else wrote in between; retry with fresh content
      }
      throw err;
    }
  }
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
  const existing = await get(BLOB_PATHNAME, { access: "private", useCache: false });
  return existing ? await streamToText(existing.stream) : CSV_HEADER;
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

  // On Vercel the filesystem is read-only, so a local-file write would only
  // fail there if no Blob store is connected yet. Catch that case explicitly
  // instead of letting it crash into a generic 500.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is missing: connect a Blob store to this project in the Vercel dashboard (Storage -> Create Database -> Blob).");
    return NextResponse.json(
      { error: "Email storage isn't configured yet. Please try again later." },
      { status: 503 }
    );
  }

  const row = toRow(email);

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await appendToBlob(row);
    } else {
      await appendToLocalFile(row);
    }
  } catch (err) {
    console.error("Failed to save subscriber email:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
