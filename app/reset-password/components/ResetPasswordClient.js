"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../../lib/supabaseClient";

function PasswordInput({ value, onChange, placeholder, show, onToggleShow }) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={6}
        className="w-full rounded-xl bg-slate-100 py-3.5 pr-11 pl-11 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ResetPasswordClient() {
  // checking -> ready (valid recovery link, show the form) -> success
  //          -> invalid (no/expired recovery session, or Supabase unconfigured)
  const [stage, setStage] = useState(isSupabaseConfigured ? "checking" : "invalid");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // The reset-link email lands here with a code Supabase exchanges into a
  // real (but recovery-scoped) session automatically on page load — this
  // waits for that to land, either as an already-resolved session or via
  // the PASSWORD_RECOVERY event, and gives up after a few seconds if
  // neither shows up (expired/invalid/reused link).
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let settled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!settled && data.session) {
        settled = true;
        setStage("ready");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!settled && (event === "PASSWORD_RECOVERY" || session)) {
        settled = true;
        setStage("ready");
      }
    });

    const timeout = setTimeout(() => {
      if (!settled) setStage("invalid");
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }
    setStage("success");
  }

  if (stage === "checking") {
    return <p className="text-center text-sm text-slate-400">Checking your reset link&hellip;</p>;
  }

  if (stage === "invalid") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <p className="text-lg font-extrabold text-[#0b1e42]">This link isn&apos;t valid</p>
        <p className="mt-2 text-sm text-slate-500">
          It may have expired or already been used — request a new one from the sign-in popup.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          Back to Car Coolie
        </Link>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" strokeWidth={2} />
        <p className="mt-3 text-lg font-extrabold text-[#0b1e42]">Password updated</p>
        <p className="mt-2 text-sm text-slate-500">You&apos;re signed in with your new password.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          Continue to Car Coolie
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <h1 className="text-2xl font-extrabold text-[#0b1e42]">Set a New Password</h1>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
        />
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm New Password"
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
        />

        {error && <p className="text-center text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-red-600 py-3.5 text-sm font-extrabold tracking-wide text-white uppercase shadow-lg transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {submitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
