import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

// Downloadable payment-milestone invoices (10% advance / 50% midway / final
// balance) — generated on demand from the real `payments` rows rather than
// stored anywhere, so there's nothing to regenerate or go stale if a charge
// is added later. Same server-side ownership pattern as
// select-booking-benefit/route.js: no session cookie reaches this route, so
// the client sends its own access token and we verify it here with the anon
// key, then do the real work with service_role (payments/bookings have no
// public RLS read policy).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const COMPANY = {
  name: "Car Coolie Logistics Pvt Ltd",
  address: "Marble Arch, 236B AJC Bose Road, Kolkata 700020, India",
  phone: "+91 84479 90088",
  email: "carcooliesupport@oslgroup.co.in",
};

// Keyed by the `payments.type` the milestone is paid against — "balance"
// also pulls in any "charges" rows from the same final checkout (see
// updateBookingSupabase in bookingStore.js and the admin's mark-final-paid
// route, both of which split the final payment into these two row types).
const MILESTONE_META = {
  advance: { code: "ADV", title: "Advance Payment", types: ["advance"] },
  midway: { code: "MID", title: "Midway Payment", types: ["midway"] },
  balance: { code: "BAL", title: "Final Balance Payment", types: ["balance", "charges"] },
};

async function resolveRequesterId(accessToken) {
  if (!accessToken) return null;
  const supabaseAnon = createClient(url, anonKey);
  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  if (error) return null;
  return data.user?.id ?? null;
}

function formatINR(amount) {
  return `Rs. ${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Renders the PDF into a Buffer — pdfkit streams, so this just collects the
// chunks instead of piping to a file/response stream directly (Route
// Handlers want a single body, not a long-lived stream handle).
function renderInvoicePdf({ booking, milestone, meta, lineItems, totalAmount, gstPercent, billing, customerEmail, invoiceNo, invoiceDate }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(18).fillColor("#0b1e42").text(COMPANY.name);
    doc.font("Helvetica").fontSize(9).fillColor("#475569");
    doc.text(COMPANY.address);
    doc.text(`${COMPANY.phone}  |  ${COMPANY.email}`);

    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#0b1e42").text("PAYMENT INVOICE", { align: "right" });
    doc.font("Helvetica").fontSize(9).fillColor("#475569");
    doc.text(`Invoice No: ${invoiceNo}`, { align: "right" });
    doc.text(`Invoice Date: ${invoiceDate}`, { align: "right" });
    doc.text(`Booking ID: ${booking.booking_code}`, { align: "right" });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.8);

    const colTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0b1e42").text("Bill To", 50, colTop);
    doc.font("Helvetica").fontSize(9).fillColor("#475569");
    doc.text(billing?.fullName || "Customer", 50, doc.y);
    if (customerEmail) doc.text(customerEmail);
    if (billing?.phone) doc.text(billing.phone);
    const addressLine = [billing?.house, billing?.street, billing?.landmark, billing?.city, billing?.pin]
      .filter(Boolean)
      .join(", ");
    if (addressLine) doc.text(addressLine, { width: 240 });
    if (billing?.gstin) doc.text(`GSTIN: ${billing.gstin}`);

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0b1e42").text("Shipment", 320, colTop);
    doc.font("Helvetica").fontSize(9).fillColor("#475569");
    doc.text(`${booking.from_city?.name ?? "-"} -> ${booking.to_city?.name ?? "-"}`, 320, doc.y, { width: 225 });
    const vehicleLine = [booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(" ") || booking.vehicle_type?.name || "-";
    doc.text(vehicleLine, 320, doc.y, { width: 225 });
    if (booking.vehicle_registration_number) doc.text(booking.vehicle_registration_number, 320, doc.y, { width: 225 });

    doc.y = Math.max(doc.y, colTop + 90);
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.8);

    // Table header
    const tableTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b");
    doc.text("DESCRIPTION", 50, tableTop, { width: 300 });
    doc.text("TAXABLE VALUE", 350, tableTop, { width: 85, align: "right" });
    doc.text("AMOUNT", 460, tableTop, { width: 85, align: "right" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(9).fillColor("#0b1e42");
    let runningTaxable = 0;
    let runningGst = 0;
    for (const item of lineItems) {
      const taxableValue = item.amount / (1 + gstPercent / 100);
      const gstAmount = item.amount - taxableValue;
      runningTaxable += taxableValue;
      runningGst += gstAmount;
      const rowY = doc.y;
      doc.text(item.label, 50, rowY, { width: 300 });
      doc.text(formatINR(taxableValue), 350, rowY, { width: 85, align: "right" });
      doc.text(formatINR(item.amount), 460, rowY, { width: 85, align: "right" });
      doc.moveDown(0.6);
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(9).fillColor("#475569");
    const gstRowY = doc.y;
    doc.text(`GST (${gstPercent}%) — included above`, 300, gstRowY, { width: 145, align: "right" });
    doc.text(formatINR(runningGst), 460, gstRowY, { width: 85, align: "right" });
    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0b1e42");
    const totalRowY = doc.y;
    doc.text(`Total ${meta.title}`, 300, totalRowY, { width: 145, align: "right" });
    doc.text(formatINR(totalAmount), 460, totalRowY, { width: 85, align: "right" });

    doc.moveDown(2);
    doc.font("Helvetica").fontSize(8).fillColor("#94a3b8");
    doc.text(
      `Total Booking Value: ${formatINR(booking.final_quote)}  |  Status: ${milestone === "balance" ? "Fully Paid" : "Partially Paid"}`,
      50
    );
    doc.moveDown(1.5);
    doc.text("This is a system-generated invoice for the payment received against this booking and does not require a signature.", 50, doc.y, {
      width: 495,
    });

    doc.end();
  });
}

export async function POST(request) {
  if (!url || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: "Invoices aren't available yet — try again shortly." }, { status: 503 });
  }

  const { bookingCode, milestone, accessToken } = await request.json();
  const meta = MILESTONE_META[milestone];
  if (!bookingCode || !meta) {
    return NextResponse.json({ error: "Invalid invoice request." }, { status: 400 });
  }

  const supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, booking_code, customer_id, final_quote, created_at, vehicle_make, vehicle_model, vehicle_registration_number, from_city:from_city_id(name), to_city:to_city_id(name), vehicle_type:vehicle_type_id(name)"
    )
    .eq("booking_code", bookingCode)
    .single();
  if (bookingError || !booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const requesterId = await resolveRequesterId(accessToken);
  if (booking.customer_id !== null && booking.customer_id !== requesterId) {
    return NextResponse.json({ error: "This booking isn't linked to your account." }, { status: 403 });
  }

  const { data: paymentRows, error: paymentsError } = await supabaseAdmin
    .from("payments")
    .select("type, amount, paid_at")
    .eq("booking_id", booking.id)
    .eq("status", "success")
    .in("type", meta.types)
    .order("paid_at", { ascending: true });
  if (paymentsError) return NextResponse.json({ error: paymentsError.message }, { status: 500 });
  if (!paymentRows || paymentRows.length === 0) {
    return NextResponse.json({ error: "No payment found for this milestone yet." }, { status: 404 });
  }

  const { data: billingRow } = await supabaseAdmin
    .from("booking_addresses")
    .select("full_name, phone, house, street, landmark, city, pin, gstin")
    .eq("booking_id", booking.id)
    .eq("type", "billing")
    .maybeSingle();

  let customerEmail = null;
  if (booking.customer_id) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(booking.customer_id);
    customerEmail = userData?.user?.email ?? null;
  }

  const { data: taxRow } = await supabaseAdmin.from("tax_settings").select("gst_percent").eq("id", true).maybeSingle();
  const gstPercent = Number(taxRow?.gst_percent ?? 18);

  const TYPE_LABEL = {
    advance: "Advance Payment",
    midway: "Midway Payment",
    balance: "Final Balance Payment",
    charges: "Additional Charges (pickup/dropoff/tolls)",
  };
  const lineItems = paymentRows.map((p) => ({ label: TYPE_LABEL[p.type] ?? p.type, amount: Number(p.amount) }));
  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const latestPaidAt = paymentRows[paymentRows.length - 1].paid_at;
  const invoiceNo = `${booking.booking_code}-${meta.code}`;

  const pdfBuffer = await renderInvoicePdf({
    booking,
    milestone,
    meta,
    lineItems,
    totalAmount,
    gstPercent,
    billing: billingRow,
    customerEmail,
    invoiceNo,
    invoiceDate: formatDate(latestPaidAt),
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoiceNo}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
