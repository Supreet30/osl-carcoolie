// Persists uploaded-but-not-yet-submitted document files across navigation
// (e.g. clicking Back to edit the estimate, then returning to the booking
// form) — see BookingForm.js's upload handlers. Plain React state alone
// doesn't survive a full page unmount, and localStorage can't hold `File`
// objects at all (BookingForm.js's own form-field draft explicitly skips
// them for exactly that reason) — IndexedDB is the only browser storage
// that can round-trip a real File/Blob.
//
// No existing IndexedDB usage anywhere in this codebase, and no wrapper
// dependency in package.json — this is a new, minimal, dependency-free
// pattern. Keyed by draftId (see getEstimateDraftId in ../../lib/bookingStore.js)
// so a new booking attempt never inherits a previous one's files.

const DB_NAME = "carcoolie_b2c_book_drafts";
const DB_VERSION = 1;
const STORE = "documents";

function openDb() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("draftId", "draftId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function rowId(draftId, docType) {
  return `${draftId}:${docType}`;
}

export async function saveDocument(draftId, docType, file) {
  if (!draftId) return;
  const db = await openDb();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id: rowId(draftId, docType), draftId, docType, file, fileName: file.name, fileSize: file.size });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function removeDocument(draftId, docType) {
  if (!draftId) return;
  const db = await openDb();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(rowId(draftId, docType));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

// Returns { [docType]: { file, fileName, fileSize } } — shaped to merge
// straight into BookingForm's `uploads` state.
export async function getAllDocuments(draftId) {
  if (!draftId) return {};
  const db = await openDb();
  if (!db) return {};
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).index("draftId").getAll(draftId);
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
  db.close();
  const byType = {};
  for (const row of rows) {
    byType[row.docType] = { file: row.file, fileName: row.fileName, fileSize: row.fileSize };
  }
  return byType;
}

export async function clearDocuments(draftId) {
  if (!draftId) return;
  const db = await openDb();
  if (!db) return;
  const keys = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).index("draftId").getAllKeys(draftId);
    request.onsuccess = () => resolve(request.result ?? []);
    request.onerror = () => reject(request.error);
  });
  if (keys.length === 0) {
    db.close();
    return;
  }
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const key of keys) store.delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
