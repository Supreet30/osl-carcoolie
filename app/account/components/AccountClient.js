"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MapPin, Pencil, Phone, Plus, Trash2, User } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";
import AuthModal from "../../components/AuthModal";

function SignInPrompt({ onSignIn }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
      <p className="text-lg font-extrabold text-[#0b1e42]">Sign in to manage your account</p>
      <p className="mt-2 text-sm text-slate-500">Your details and saved addresses are tied to your account.</p>
      <button
        type="button"
        onClick={onSignIn}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        Sign In
      </button>
    </div>
  );
}

// Name/phone live on customers (self-editable — see "customers update own"
// in supabase-schema.sql); email comes from the auth session itself and
// isn't editable here (changing it is a verification flow this page
// doesn't own).
function ProfileSection({ session }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("customers")
      .select("full_name, phone")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setFullName(data?.full_name ?? "");
          setPhone(data?.phone ?? "");
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session.user.id]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const { error: updateError } = await supabase
      .from("customers")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
      .eq("id", session.user.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <h2 className="text-lg font-extrabold text-[#0b1e42]">Your Details</h2>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading&hellip;
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
              <User className="h-3.5 w-3.5" /> Full Name
            </span>
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
              placeholder="Your name"
              className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
              }}
              placeholder="e.g. 9876543210"
              className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
            <input
              disabled
              value={session.user.email ?? ""}
              className="mt-2 w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-400 outline-none"
            />
          </label>

          {error && <p className="text-xs font-semibold text-red-600 sm:col-span-2">{error}</p>}

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </button>
            {saved && <span className="text-xs font-semibold text-green-600">Saved</span>}
          </div>
        </form>
      )}
    </div>
  );
}

const EMPTY_ADDRESS = { label: "Home", fullName: "", phone: "", house: "", street: "", landmark: "", city: "", pin: "" };

function addressFromRow(row) {
  return {
    label: row.label ?? "Home",
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    house: row.house ?? "",
    street: row.street ?? "",
    landmark: row.landmark ?? "",
    city: row.city ?? "",
    pin: row.pin ?? "",
  };
}

function AddressForm({ initial, busy, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div>
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">Label</label>
        <input
          required
          value={form.label}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="e.g. Home, Office"
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">Contact Name</label>
        <input
          value={form.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">PIN Code</label>
        <input
          inputMode="numeric"
          maxLength={6}
          value={form.pin}
          onChange={(e) => handleChange("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">House / Flat No.</label>
        <input
          value={form.house}
          onChange={(e) => handleChange("house", e.target.value)}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">Street</label>
        <input
          value={form.street}
          onChange={(e) => handleChange("street", e.target.value)}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">Landmark</label>
        <input
          value={form.landmark}
          onChange={(e) => handleChange("landmark", e.target.value)}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div>
        <label className="text-[10px] font-extrabold tracking-wide text-slate-400 uppercase">City</label>
        <input
          value={form.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="mt-1 block w-full rounded-lg bg-slate-100 px-3 py-2 text-sm text-[#0b1e42] outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="flex items-center gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function AddressCard({ address, onEdit, onDelete, deleting }) {
  const lines = [address.house, address.street, address.landmark, address.city, address.pin].filter(Boolean);
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-[#0b1e42]">{address.label}</p>
          {(address.fullName || address.phone) && (
            <p className="mt-0.5 text-xs text-slate-500">
              {[address.fullName, address.phone].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="mt-1.5 text-sm text-slate-600">{lines.length > 0 ? lines.join(", ") : "No address details yet"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="text-slate-400 transition-colors hover:text-red-600"
            title="Edit address"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="text-slate-400 transition-colors hover:text-red-600 disabled:cursor-wait"
            title="Delete address"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressesSection({ session }) {
  const [state, setState] = useState({ loading: true, error: "", addresses: [] });
  const [editingId, setEditingId] = useState(null); // null = not editing, "new" = adding, else an address id
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", session.user.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setState({ loading: false, error: error.message, addresses: [] });
        else setState({ loading: false, error: "", addresses: data });
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- session.user.id is stable for this component's lifetime
  useEffect(load, []);

  async function handleSave(form) {
    setBusy(true);
    const payload = {
      customer_id: session.user.id,
      label: form.label.trim() || "Home",
      full_name: form.fullName.trim() || null,
      phone: form.phone.trim() || null,
      house: form.house.trim() || null,
      street: form.street.trim() || null,
      landmark: form.landmark.trim() || null,
      city: form.city.trim() || null,
      pin: form.pin.trim() || null,
    };
    const { error } =
      editingId === "new"
        ? await supabase.from("customer_addresses").insert(payload)
        : await supabase.from("customer_addresses").update(payload).eq("id", editingId);
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    setEditingId(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this address?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("customer_addresses").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      alert(error.message);
      return;
    }
    load();
  }

  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#0b1e42]">
          <MapPin className="h-5 w-5 text-red-600" /> Saved Addresses
        </h2>
        {editingId === null && (
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Add Address
          </button>
        )}
      </div>

      {editingId === "new" && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <AddressForm initial={EMPTY_ADDRESS} busy={busy} onSubmit={handleSave} onCancel={() => setEditingId(null)} />
        </div>
      )}

      {state.loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading&hellip;
        </div>
      ) : state.error ? (
        <p className="mt-6 text-sm font-semibold text-red-600">{state.error}</p>
      ) : state.addresses.length === 0 && editingId !== "new" ? (
        <p className="mt-6 text-sm text-slate-400">No saved addresses yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {state.addresses.map((row) =>
            editingId === row.id ? (
              <div key={row.id} className="rounded-2xl bg-slate-50 p-5">
                <AddressForm
                  initial={addressFromRow(row)}
                  busy={busy}
                  onSubmit={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <AddressCard
                key={row.id}
                address={addressFromRow(row)}
                onEdit={() => setEditingId(row.id)}
                onDelete={() => handleDelete(row.id)}
                deleting={deletingId === row.id}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountClient() {
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthModalOpen(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;

  if (isSupabaseConfigured && !session) {
    return (
      <>
        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <SignInPrompt onSignIn={() => setAuthModalOpen(true)} />
      </>
    );
  }

  if (!session) return null;

  return (
    <>
      <ProfileSection session={session} />
      <AddressesSection session={session} />
    </>
  );
}
