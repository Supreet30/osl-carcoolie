"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

// lucide-react dropped brand/social glyphs over trademark concerns, so the
// Google "G" is drawn as an inline SVG instead — same convention Navbar.js
// already uses for its own custom icons.
function GoogleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A11.997 11.997 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A11.997 11.997 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function FieldInput({ icon: Icon, trailing, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        {...props}
        className="w-full rounded-xl bg-slate-100 py-3.5 pr-11 pl-11 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
      />
      {trailing}
    </div>
  );
}

// AuthCard — identical to the old /signin page's component, down to the
// class names and copy. The only things added here are what a page didn't
// need: the backdrop/portal to make it a popup, and a close button.
function AuthCard() {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const isSignup = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setStatus({ state: "error", message: "Sign in isn't configured yet." });
      return;
    }

    const email = event.target.elements.email.value;
    setStatus({ state: "sending", message: "" });

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    });

    if (error) {
      setStatus({ state: "error", message: error.message });
    } else {
      setStatus({ state: "sent", message: `Check ${email} for a login link.` });
    }
  }

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured) {
      setStatus({ state: "error", message: "Sign in isn't configured yet." });
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }

  const promoPanel = (
    <div
      key={mode}
      className={`flex w-full flex-col items-center justify-center gap-6 bg-linear-to-br from-red-700 via-red-600 to-red-500 px-10 py-16 text-center sm:w-1/2 ${
        isSignup ? "order-1" : "order-2"
      }`}
      style={{ animation: "fadeIn 0.4s ease-out" }}
    >
      <span className="rounded-xl bg-white px-3 py-2 shadow">
        <Image src="/carcoolie_logo.png" alt="Car Coolie" width={150} height={46} className="h-9 w-auto" />
      </span>
      <div>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          {isSignup ? "Welcome to CarCoolie!" : "Welcome Back !"}
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-red-50">
          {isSignup
            ? "Create your account and get started with seamless car transportation."
            : "Sign in to manage your car transportation bookings with ease. Experience logistics precision engineered for you."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setMode(isSignup ? "signin" : "signup")}
        className="rounded-full border-2 border-white px-10 py-3 text-sm font-extrabold tracking-wide text-white uppercase transition-colors hover:bg-white hover:text-red-600"
      >
        {isSignup ? "Sign In" : "Sign Up"}
      </button>
    </div>
  );

  const formPanel = (
    <div
      key={mode + "-form"}
      className={`flex w-full flex-col justify-center gap-5 px-8 py-16 sm:w-1/2 sm:px-12 ${isSignup ? "order-2" : "order-1"}`}
      style={{ animation: "fadeIn 0.4s ease-out" }}
    >
      <h2 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
        {isSignup ? "Create Account" : "Sign In Your Account"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
        {isSignup && <FieldInput icon={User} type="text" name="name" placeholder="Full Name" required />}

        <FieldInput icon={Mail} type="email" name="email" placeholder="Email Address" required />

        <FieldInput
          icon={Lock}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          trailing={
            !isSignup && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )
          }
        />

        {!isSignup && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
              Remember me
            </label>
            <Link href="#" className="font-semibold text-red-600 transition-colors hover:text-red-700">
              Forgot Password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={status.state === "sending"}
          className="mt-2 rounded-xl bg-red-600 py-3.5 text-sm font-extrabold tracking-wide text-white uppercase shadow-lg transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {status.state === "sending" ? "Sending..." : isSignup ? "Sign Up" : "Sign In"}
        </button>

        {status.message && (
          <p className={`text-center text-xs ${status.state === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {status.message}
          </p>
        )}
      </form>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or use your email for registration
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue With Google
      </button>
    </div>
  );

  return (
    <div className="flex min-h-160 w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl sm:flex-row">
      {promoPanel}
      {formPanel}
    </div>
  );
}

// Portaled straight to <body>: Navbar.js's <header> always has an active
// CSS transform (the scroll-hide translate-y), and per spec that turns it
// into the containing block for any position:fixed descendant — this modal
// would end up positioned (and clipped) relative to the header's own small
// box instead of the viewport. Portaling sidesteps that regardless of where
// AuthModal gets mounted from.
export default function AuthModal({ open, onClose }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 px-4 py-8" onClick={onClose}>
      <div className="relative max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
        <AuthCard />
      </div>
    </div>,
    document.body
  );
}
