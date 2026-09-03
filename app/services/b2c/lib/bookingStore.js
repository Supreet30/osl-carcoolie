// Backend for the /services/b2c demo flow. Booking reads/writes go to
// Supabase when it's configured (see lib/supabaseClient.js) and
// supabase-schema.sql has been applied — see supabase-schema.sql's RLS
// notes on why bookings are written with customer_id = null for now (no
// customer auth wired up yet). If Supabase isn't configured, or a call to
// it fails (e.g. schema not applied yet), everything here falls back to
// localStorage so the flow still works standalone.
//
// saveEstimate/getEstimate stay localStorage-only either way — they're a
// transient handoff of "the estimate just calculated in the modal" to the
// booking page, before a booking (and therefore a database row) exists yet.

import { isSupabaseConfigured, supabase } from "../../../../lib/supabaseClient";

const ESTIMATE_KEY = "carcoolie_b2c_estimate";
const BOOKINGS_KEY = "carcoolie_b2c_bookings";

export const BOOKING_STATUS = {
  DOCS_REVIEW: "docs_review",
  QUOTE_SENT: "quote_sent",
  ADVANCE_PAID: "advance_paid",
  CONFIRMED: "confirmed",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
};

// "docs_sent" is display-only — it's never an actual bookings.status value,
// since submitting the booking form (with its document uploads) is what
// creates the row in the first place, so by the time a booking exists at
// all it's already true. It exists purely so the stepper below shows it as
// the first, already-completed step rather than starting the customer's
// view mid-pipeline at "Documents Under Review".
export const STATUS_STEPS = [
  { key: "docs_sent", label: "Documents Sent for Review" },
  { key: BOOKING_STATUS.DOCS_REVIEW, label: "Documents Under Review" },
  { key: BOOKING_STATUS.QUOTE_SENT, label: "Final Quote Generated" },
  { key: BOOKING_STATUS.ADVANCE_PAID, label: "Advance Paid (30%)" },
  { key: BOOKING_STATUS.CONFIRMED, label: "Booking Confirmed" },
  { key: BOOKING_STATUS.IN_TRANSIT, label: "In Transit" },
  { key: BOOKING_STATUS.DELIVERED, label: "Delivered" },
];

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveEstimate(estimate) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ESTIMATE_KEY, JSON.stringify(estimate));
}

export function getEstimate() {
  if (!isBrowser()) return null;
  return safeParse(window.localStorage.getItem(ESTIMATE_KEY), null);
}

// ---- localStorage fallback (original implementation) ----

function getBookingsLocal() {
  if (!isBrowser()) return [];
  return safeParse(window.localStorage.getItem(BOOKINGS_KEY), []);
}

function saveBookingsLocal(bookings) {
  if (isBrowser()) window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function createBookingLocal(bookingData) {
  const booking = {
    id: `CC-${Date.now().toString(36).toUpperCase()}`,
    status: BOOKING_STATUS.DOCS_REVIEW,
    createdAt: new Date().toISOString(),
    finalQuote: null,
    ...bookingData,
  };
  const bookings = getBookingsLocal();
  bookings.unshift(booking);
  saveBookingsLocal(bookings);
  return booking;
}

function updateBookingLocal(id, updates) {
  const bookings = getBookingsLocal().map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveBookingsLocal(bookings);
  return bookings.find((b) => b.id === id) ?? null;
}

// ---- Supabase-backed implementation ----

const DOCUMENTS_BUCKET = "booking-documents";

// Uploads one document file to Storage and returns its object path (what
// booking_documents.file_url stores) — or null if the upload fails, so a
// storage hiccup never blocks the booking itself from being created.
async function uploadDocumentFile(bookingId, docType, file) {
  const path = `${bookingId}/${docType}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, { upsert: true });
  if (error) {
    console.error(`Document upload failed for ${docType}:`, error.message);
    return null;
  }
  return path;
}

function addressToRow(bookingId, type, address) {
  if (!address) return null;
  return {
    booking_id: bookingId,
    type,
    full_name: address.fullName || null,
    phone: address.phone || null,
    house: address.house || null,
    street: address.street || null,
    landmark: address.landmark || null,
    city: address.city || null,
    pin: address.pin || null,
    method: address.method || "driver",
    captured_address: address.capturedLocation?.address ?? null,
    captured_lat: address.capturedLocation?.lat ?? null,
    captured_lng: address.capturedLocation?.lng ?? null,
    slot_date: address.date || null,
    time_slot: address.timeSlot || null,
  };
}

function addressRowToJs(row) {
  if (!row) return null;
  return {
    fullName: row.full_name,
    phone: row.phone,
    house: row.house,
    street: row.street,
    landmark: row.landmark,
    city: row.city,
    pin: row.pin,
    method: row.method,
    capturedLocation: row.captured_address
      ? { address: row.captured_address, lat: row.captured_lat, lng: row.captured_lng }
      : null,
    date: row.slot_date,
    timeSlot: row.time_slot,
  };
}

function documentRowsToJs(rows) {
  const documents = {};
  for (const row of rows ?? []) {
    documents[row.doc_type] = {
      uploaded: row.status !== "pending",
      fileName: row.file_name ?? undefined,
      fileSize: row.file_size_mb ? `${row.file_size_mb} MB` : undefined,
      status: row.status,
      fileUrl: row.file_url ?? null,
      rejectionReason: row.rejection_reason ?? null,
    };
  }
  return documents;
}

function rowToBooking(row, { addresses = [], documents = [], addons = [] } = {}) {
  return {
    id: row.booking_code,
    status: row.status,
    createdAt: row.created_at,
    finalQuote: row.final_quote,
    advancePaid: row.advance_paid,
    registrationNumber: row.vehicle_registration_number ?? null,
    estimate: {
      fromCity: row.from_city?.name ?? null,
      toCity: row.to_city?.name ?? null,
      distanceKm: row.distance_km,
      vehicleType: row.vehicle_type_label ?? row.vehicle_type?.name ?? null,
      make: row.vehicle_make ?? null,
      model: row.vehicle_model ?? null,
      routePrice: row.route_price,
      vehicleSurcharge: row.vehicle_surcharge ?? 0,
      serviceCharge: row.service_charge,
      addOnsTotal: row.addons_total,
      selectedAddOns: addons.map((a) => a.add_on_service?.key).filter(Boolean),
      addOnBreakdown: addons.map((a) => ({
        key: a.add_on_service?.key,
        label: a.add_on_service?.label,
        price: a.price_at_booking,
      })),
      gst: row.gst_amount,
      subtotal: row.subtotal,
      coupon: row.coupon_code ? { code: row.coupon_code } : null,
      discount: row.discount_amount,
      total: row.estimated_total,
      pickupPin: row.pickup_pin,
      destinationPin: row.destination_pin,
    },
    pickup: addressRowToJs(addresses.find((a) => a.type === "pickup")),
    dropoff: addressRowToJs(addresses.find((a) => a.type === "dropoff")),
    billing: addressRowToJs(addresses.find((a) => a.type === "billing")),
    documents: documentRowsToJs(documents),
  };
}

const BOOKING_SELECT =
  "*, from_city:from_city_id(name), to_city:to_city_id(name), vehicle_type:vehicle_type_id(name)";

async function fetchBookingChildren(bookingId) {
  const [{ data: addresses }, { data: documents }, { data: addons }] = await Promise.all([
    supabase.from("booking_addresses").select("*").eq("booking_id", bookingId),
    supabase.from("booking_documents").select("*").eq("booking_id", bookingId),
    supabase.from("booking_addons").select("price_at_booking, add_on_service:add_on_service_id(key, label)").eq("booking_id", bookingId),
  ]);
  return { addresses: addresses ?? [], documents: documents ?? [], addons: addons ?? [] };
}

async function createBookingSupabase(bookingData) {
  const { estimate, registrationNumber, pickup, dropoff, billing, documents } = bookingData;

  const [{ data: cities }, { data: vehicleTypes }, { data: addOns }] = await Promise.all([
    supabase.from("cities").select("id, name"),
    supabase.from("vehicle_types").select("id, name"),
    supabase.from("add_on_services").select("id, key"),
  ]);
  const cityIdByName = new Map((cities ?? []).map((c) => [c.name, c.id]));
  const vehicleTypeIdByName = new Map((vehicleTypes ?? []).map((v) => [v.name.toLowerCase(), v.id]));
  const addOnIdByKey = new Map((addOns ?? []).map((a) => [a.key, a.id]));

  const { data: row, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      from_city_id: cityIdByName.get(estimate?.fromCity) ?? null,
      to_city_id: cityIdByName.get(estimate?.toCity) ?? null,
      vehicle_type_id: vehicleTypeIdByName.get((estimate?.vehicleType || "").toLowerCase()) ?? null,
      vehicle_type_label: estimate?.vehicleType ?? null,
      vehicle_make: estimate?.make ?? null,
      vehicle_model: estimate?.model ?? null,
      vehicle_registration_number: registrationNumber ?? null,
      distance_km: estimate?.distanceKm ?? null,
      route_price: estimate?.routePrice ?? null,
      vehicle_surcharge: estimate?.vehicleSurcharge ?? 0,
      service_charge: estimate?.serviceCharge ?? null,
      addons_total: estimate?.addOnsTotal ?? 0,
      gst_amount: estimate?.gst ?? null,
      subtotal: estimate?.subtotal ?? null,
      coupon_code: estimate?.coupon?.code ?? null,
      discount_amount: estimate?.discount ?? 0,
      estimated_total: estimate?.total ?? null,
      pickup_pin: estimate?.pickupPin ?? null,
      destination_pin: estimate?.destinationPin ?? null,
    })
    .select(BOOKING_SELECT)
    .single();
  if (bookingError) throw bookingError;

  const addOnRows = (estimate?.addOnBreakdown ?? [])
    .filter((a) => addOnIdByKey.has(a.key))
    .map((a) => ({ booking_id: row.id, add_on_service_id: addOnIdByKey.get(a.key), price_at_booking: a.price }));

  const addressRows = [
    addressToRow(row.id, "pickup", pickup),
    addressToRow(row.id, "dropoff", dropoff),
    addressToRow(row.id, "billing", billing),
  ].filter(Boolean);

  // Upload the actual file to Storage (if the browser still has it — e.g.
  // not on a page reload) before writing the booking_documents row, so
  // file_url is populated for the admin panel's document preview. A failed
  // upload doesn't fail the whole booking — it just leaves file_url null,
  // same as if no file had been attached.
  const documentRows = [];
  for (const [docType, doc] of Object.entries(documents ?? {})) {
    if (!doc?.uploaded) continue;
    let fileUrl = null;
    if (doc.file) {
      fileUrl = await uploadDocumentFile(row.id, docType, doc.file);
    }
    documentRows.push({
      booking_id: row.id,
      doc_type: docType,
      file_name: doc.fileName ?? null,
      file_size_mb: doc.fileSize ? parseFloat(doc.fileSize) : null,
      file_url: fileUrl,
      status: "uploaded",
    });
  }

  const childInserts = [];
  if (addOnRows.length) childInserts.push(supabase.from("booking_addons").insert(addOnRows));
  if (addressRows.length) childInserts.push(supabase.from("booking_addresses").insert(addressRows));
  if (documentRows.length) childInserts.push(supabase.from("booking_documents").insert(documentRows));
  for (const result of await Promise.all(childInserts)) {
    if (result.error) throw result.error;
  }

  return rowToBooking(row, {
    addresses: addressRows.map((r) => ({ ...r })), // avoid a round-trip; already in the right shape
    documents: documentRows,
    addons: addOnRows.map((r) => ({
      price_at_booking: r.price_at_booking,
      add_on_service: estimate.addOnBreakdown.find((a) => addOnIdByKey.get(a.key) === r.add_on_service_id),
    })),
  });
}

async function getBookingSupabase(id) {
  const { data: row, error } = await supabase.from("bookings").select(BOOKING_SELECT).eq("booking_code", id).maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const children = await fetchBookingChildren(row.id);
  return rowToBooking(row, children);
}

async function getBookingsSupabase() {
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const bookings = await Promise.all(
    (rows ?? []).map(async (row) => rowToBooking(row, await fetchBookingChildren(row.id)))
  );
  return bookings;
}

async function updateBookingSupabase(id, updates) {
  const patch = {};
  if ("status" in updates) patch.status = updates.status;
  if ("finalQuote" in updates) patch.final_quote = updates.finalQuote;
  if ("advancePaid" in updates) patch.advance_paid = updates.advancePaid;

  const { data: row, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("booking_code", id)
    .select(BOOKING_SELECT)
    .single();
  if (error) throw error;

  // Log the 30% advance as its own payments row (the audit trail the admin
  // panel's booking detail page reads), not just the running total on the
  // booking itself.
  if ("advancePaid" in updates) {
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: row.id,
      type: "advance",
      amount: updates.advancePaid,
      status: "success",
      paid_at: new Date().toISOString(),
    });
    if (paymentError) throw paymentError;
  }

  const children = await fetchBookingChildren(row.id);
  return rowToBooking(row, children);
}

// Re-uploading a rejected document — looked up by booking_code since that's
// all the client ever has (rowToBooking's `id` field is the human code, not
// the real uuid). `.upsert` is safe here (unlike the admin app's documented
// upsert caveat) because every NOT NULL column always has a real value in
// this payload, never a partial one — there's also no existing row yet if
// this doc was never uploaded at booking time in the first place, so a
// plain update by id wouldn't even find one. Resets status back to
// "uploaded" and clears any previous rejection, exactly like a first-time
// upload, so it re-enters the admin's review queue.
async function updateBookingDocumentSupabase(bookingCode, docType, file) {
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id")
    .eq("booking_code", bookingCode)
    .single();
  if (bookingError) throw bookingError;

  const fileUrl = await uploadDocumentFile(booking.id, docType, file);
  if (!fileUrl) throw new Error("The file couldn't be uploaded — please try again.");

  const { error } = await supabase.from("booking_documents").upsert(
    {
      booking_id: booking.id,
      doc_type: docType,
      file_name: file.name,
      file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      file_url: fileUrl,
      status: "uploaded",
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
    },
    { onConflict: "booking_id,doc_type" }
  );
  if (error) throw error;
}

// ---- Public API — tries Supabase first, falls back to localStorage ----

export async function createBooking(bookingData) {
  if (isSupabaseConfigured) {
    try {
      return await createBookingSupabase(bookingData);
    } catch (err) {
      console.error("Supabase createBooking failed, falling back to local storage:", err.message);
    }
  }
  return createBookingLocal(bookingData);
}

export async function getBooking(id) {
  if (isSupabaseConfigured) {
    try {
      const booking = await getBookingSupabase(id);
      if (booking) return booking;
    } catch (err) {
      console.error("Supabase getBooking failed, falling back to local storage:", err.message);
    }
  }
  return getBookingsLocal().find((b) => b.id === id) ?? null;
}

export async function getBookings() {
  if (isSupabaseConfigured) {
    try {
      return await getBookingsSupabase();
    } catch (err) {
      console.error("Supabase getBookings failed, falling back to local storage:", err.message);
    }
  }
  return getBookingsLocal();
}

export async function updateBooking(id, updates) {
  if (isSupabaseConfigured) {
    try {
      return await updateBookingSupabase(id, updates);
    } catch (err) {
      console.error("Supabase updateBooking failed, falling back to local storage:", err.message);
    }
  }
  return updateBookingLocal(id, updates);
}

// Lets a customer re-upload a document the admin rejected. Deliberately no
// silent fallback to local storage on a Supabase failure (unlike every
// function above) — a "rejected" status only ever comes from a real
// admin-panel review of a real Supabase booking, so a copy of it was never
// going to be sitting in local storage; masking a real upload failure that
// way would be worse than just surfacing it.
export async function updateBookingDocument(bookingCode, docType, file) {
  if (isSupabaseConfigured) {
    await updateBookingDocumentSupabase(bookingCode, docType, file);
    return;
  }
  const bookings = getBookingsLocal();
  const idx = bookings.findIndex((b) => b.id === bookingCode);
  if (idx === -1) throw new Error("Booking not found.");
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  bookings[idx] = {
    ...bookings[idx],
    documents: {
      ...bookings[idx].documents,
      [docType]: { uploaded: true, fileName: file.name, fileSize: `${sizeMB} MB`, status: "uploaded", file, rejectionReason: null },
    },
  };
  saveBookingsLocal(bookings);
}
