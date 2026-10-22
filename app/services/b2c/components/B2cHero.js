"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, PhoneCall, Truck, X } from "lucide-react";
import Navbar from "../../../landing-page/components/Navbar";
import EstimateModal from "./EstimateModal";
import AuthModal from "../../../components/AuthModal";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabaseClient";
import { getRoute, formatINR } from "../lib/pricing";
import {
  consumeReturnToEstimate,
  estimateToQuoteDraft,
  getDraft,
  getEstimate,
  getEstimateDraftId,
  saveEstimate,
  saveLocalFormDraft,
} from "../lib/bookingStore";

const PIN_REGEX = /^\d{6}$/;

// Small status note under a PIN field. PIN code is the only way to set a
// city here now — no dropdown fallback — so "not_matched"/"error" can't
// point at one; they just ask for a different/rechecked PIN instead.
// "not_matched" covers two different cases, styled differently: a PIN that
// exists in pincode_directory (we have its district/state) just isn't
// serviced yet — green, same as a real match, since ServiceGapModal is
// where the actual "not serviced" explanation happens once the customer
// submits; a PIN that doesn't exist in the directory at all is a genuinely
// invalid PIN code, flagged as such rather than treated like a valid one —
// see handleSubmit below, which only offers the sign-in-and-notify flow for
// the first case.
function PincodeStatus({ status }) {
  if (status.status === "checking") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Detecting city…
      </span>
    );
  }
  if (status.status === "matched") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-green-600">
        <CheckCircle2 className="h-3 w-3" /> Detected: {status.city}
      </span>
    );
  }
  if (status.status === "not_matched" && status.district) {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-green-600">
        <CheckCircle2 className="h-3 w-3" /> Detected: {status.district}
        {status.state ? `, ${status.state}` : ""}
      </span>
    );
  }
  if (status.status === "not_matched") {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <AlertCircle className="h-3 w-3" /> Invalid PIN code
      </span>
    );
  }
  if (status.status === "error") {
    return <span className="mt-1.5 block text-xs text-slate-400">Couldn&apos;t check this PIN right now — please try again.</span>;
  }
  return null;
}

// Shown after Get Estimated Quote on a route that can't be quoted — either
// PIN didn't resolve to a serviced city, or both did but no route exists
// between them yet. Framed as a positive next step (not an error) — onClose
// just dismisses, onRequestCallback is what actually logs the
// service_area_leads row tied to the signed-in account; nothing is saved
// just from the PIN check above, or from dismissing without requesting one.
function ServiceGapModal({ onClose, onRequestCallback }) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <PhoneCall className="h-6 w-6" strokeWidth={2} />
        </span>
        <h3 className="mt-4 text-lg font-extrabold text-[#0b1e42]">Our Team Will Get Back to You</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          We don&apos;t service this exact route yet. Request a callback and our team will reach out to help.
        </p>
        <button
          type="button"
          onClick={onRequestCallback}
          className="mt-6 w-full rounded-full bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          Request Callback from our Team
        </button>
      </div>
    </div>
  );
}

// One photo per stage of the journey — cycled automatically below so the
// hero shows pickup -> in transit -> destination on a loop, in step with
// the route marker above it moving the same way.
const ROUTE_STOPS = [
  { label: "PickUp", image: "/finalimages/homepage/ourservices1.png" },
  { label: "In Transit", image: "/finalimages/services/b2c3.jpeg" },
  { label: "Destination", image: "/finalimages/homepage/steps4.png" },
];
const STOP_DURATION_MS = 2000;

// `state` is relative to the currently active stop — "done" (already
// passed, hollow red), "active" (current stop, solid red) or "upcoming"
// (not reached yet, hollow navy) — matching the original fixed markers'
// look for whichever stop happens to be active.
function RouteMarker({ state }) {
  if (state === "active") {
    return <span className="relative z-10 h-3 w-3 rounded-full bg-red-600" />;
  }
  const ring = state === "done" ? "border-red-500" : "border-[#0b1e42]";
  return <span className={`relative z-10 h-3 w-3 rounded-full border-2 bg-white ${ring}`} />;
}

export default function B2cHero() {
  const router = useRouter();
  // fromCity/toCity are never picked directly anymore — PIN code is the
  // only input, resolved to a city via /api/resolve-pincode below. Still
  // needed as state: EstimateModal wants a city (not a PIN) to pre-fill,
  // and the route preview looks itself up by city.
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [pickupPin, setPickupPin] = useState("");
  const [destinationPin, setDestinationPin] = useState("");
  const [pickupPinStatus, setPickupPinStatus] = useState({ status: "idle" });
  const [destinationPinStatus, setDestinationPinStatus] = useState({ status: "idle" });
  const [showEstimate, setShowEstimate] = useState(false);
  const [cityError, setCityError] = useState("");

  // Both generating a quote and logging a service-gap lead require an
  // account (a lead needs one to attach to; a quote needs one for the
  // 3-combos limit) — see the session tracking and handleSubmit's gate
  // below. "quote" | "service-gap" | null, survives the sign-in redirect/
  // popup round trip so whichever one the customer was asking for actually
  // happens the moment they're signed in, instead of making them resubmit
  // the PIN form a second time. Kept in both a ref (pendingActionRef — read
  // inside the onAuthStateChange listener below, which subscribes once on
  // mount and would otherwise see a stale closed-over value) and state
  // (pendingAction — read by AuthModal's `reason` text during render,
  // which refs can't be); setPendingAction (below) keeps the two in sync.
  const [session, setSession] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Controls ServiceGapModal (see above) — opened once the route is
  // confirmed un-quotable (see flagServiceGap in handleSubmit) and the
  // customer is signed in (or just finished signing in, via the listener
  // below). Its own Okay button is what actually logs the lead. Declared
  // here (not nearer its own use) because the listener below also sets it.
  const [showServiceGapModal, setShowServiceGapModal] = useState(false);
  const [pendingAction, setPendingActionState] = useState(null);
  const pendingActionRef = useRef(null);
  function setPendingAction(action) {
    pendingActionRef.current = action;
    setPendingActionState(action);
  }
  // Read alongside pendingActionRef for the same reason — set at the moment
  // the auth gate actually triggers, not rendered so a ref alone is enough.
  const pendingPinsRef = useRef({ pickupPin: "", destinationPin: "" });

  // Rechecking the same pickup/destination PIN combination is unlimited;
  // only 3 *different* combinations are allowed per rolling 24h per
  // account. Backed by the quote_requests table (see supabase-schema.sql),
  // not localStorage, so clearing browser storage can't reset it. Checked
  // right before actually showing the estimate, from both handleSubmit
  // (already signed in) and the onAuthStateChange listener below (just
  // finished signing in).
  async function generateQuote(userId, pickupPinValue, destinationPinValue) {
    const sinceISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("quote_requests")
      .select("pickup_pin, destination_pin")
      .eq("customer_id", userId)
      .gte("created_at", sinceISO);

    if (error) {
      // A transient check failure shouldn't block a legitimate customer —
      // this is a usage limit, not a security boundary.
      console.error("Quote rate-limit check failed:", error.message);
      setShowEstimate(true);
      return;
    }

    const seenCombos = new Set((data ?? []).map((row) => `${row.pickup_pin}_${row.destination_pin}`));
    const isRepeatCombo = seenCombos.has(`${pickupPinValue}_${destinationPinValue}`);

    if (!isRepeatCombo && seenCombos.size >= 3) {
      setCityError(
        "You've checked 3 different pickup/destination combinations in the last 24 hours. Try again later, or recheck one you've already used."
      );
      return;
    }

    const { error: insertError } = await supabase
      .from("quote_requests")
      .insert({ customer_id: userId, pickup_pin: pickupPinValue, destination_pin: destinationPinValue });
    if (insertError) console.error("Failed to log quote request:", insertError.message);
    setShowEstimate(true);
  }

  // Logs a service_area_leads row so carcoolie-admin's Service Leads page
  // (and the Callback Requests section on Abandoned Carts) can follow up —
  // no form, no name/phone typed here, since those pages look the account's
  // own saved contact info up live via customer_id (see
  // /api/service-leads). Called the moment the gap is actually surfaced to
  // the customer (both paths that open ServiceGapModal below), not gated
  // behind them clicking "Request Callback from our Team" — the point is
  // for admin to see every customer who hit an unserviced route, whether or
  // not they explicitly asked to be called back.
  async function logServiceGapLead(userId, pickupPinValue, destinationPinValue) {
    const { error } = await supabase
      .from("service_area_leads")
      .insert({ customer_id: userId, pickup_pin: pickupPinValue, destination_pin: destinationPinValue });
    if (error) console.error("Failed to log service-area lead:", error.message);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession && pendingActionRef.current) {
        const action = pendingActionRef.current;
        const { pickupPin: pendingPickupPin, destinationPin: pendingDestinationPin } = pendingPinsRef.current;
        setPendingAction(null);
        setAuthModalOpen(false);
        if (action === "quote") {
          generateQuote(nextSession.user.id, pendingPickupPin, pendingDestinationPin);
        } else {
          // Logged the moment the modal is shown, same as the
          // already-signed-in path in handleSubmit below — see
          // logServiceGapLead's comment above.
          logServiceGapLead(nextSession.user.id, pendingPickupPin, pendingDestinationPin);
          setShowServiceGapModal(true);
        }
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // "Continue where you left off" — offered once per sign-in if the
  // account has a saved draft from the last 7 days (see getDraft/
  // saveQuoteDraft/saveFormDraft in bookingStore.js). Separate from the
  // 3-per-24h quote limit above: resuming an old one isn't generating a
  // new one.
  const [savedDraft, setSavedDraft] = useState(null);
  const [savedDraftDismissed, setSavedDraftDismissed] = useState(false);
  // "quote" stage drafts reopen EstimateModal pre-filled instead of
  // navigating anywhere — this is what seeds its initial* props below.
  const [continueQuoteDraft, setContinueQuoteDraft] = useState(null);

  // Resets dismissal on an actual account change (sign out, sign in as
  // someone else, same tab) — without this, dismissing account A's toast
  // would also permanently hide account B's, since the flag never otherwise
  // clears. A dismiss within the same account's session correctly stays
  // dismissed (this only resets when the id itself changes). Adjusting
  // state during render, not an effect — same pattern as AuthModal.js's
  // lastOpen — since a direct setState in an effect body triggers
  // react-hooks/set-state-in-effect.
  const [lastDraftUserId, setLastDraftUserId] = useState(session?.user.id);
  if (session?.user.id !== lastDraftUserId) {
    setLastDraftUserId(session?.user.id);
    setSavedDraftDismissed(false);
  }

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    let cancelled = false;
    getDraft(session.user.id).then((draft) => {
      if (!cancelled) setSavedDraft(draft);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  // What the "continue" toast summarizes — the live selections for a
  // "quote" stage draft, or the full estimate (with its price) for a
  // "form" stage one.
  const draftSummary = savedDraft?.stage === "quote" ? savedDraft.quote : savedDraft?.estimate;

  function handleContinueDraft() {
    if (!savedDraft) return;
    setSavedDraftDismissed(true);
    if (savedDraft.stage === "quote") {
      // Reopens the modal in place, pre-filled from the saved selections —
      // same as reaching the estimate step normally, just without
      // navigating anywhere. See EstimateModal's initial* props.
      setContinueQuoteDraft(savedDraft.quote);
      setShowEstimate(true);
      return;
    }
    // "form" stage (or a legacy draft getDraft() normalized to this same
    // shape) — restore the estimate and resume straight on /book, same as
    // before this feature existed, plus whatever in-progress form values
    // were captured. saveEstimate's localStorage write happens synchronously
    // (before its own fire-and-forget Supabase upsert), so the envelope —
    // and therefore its draftId — is already in place by the time
    // getEstimateDraftId() reads it back on the very next line.
    saveEstimate(savedDraft.estimate);
    saveLocalFormDraft(getEstimateDraftId(), savedDraft.formValues);
    router.push("/services/b2c/book");
  }

  // If the customer just clicked Back on the booking form, reopen this
  // estimate pre-filled instead of landing on a blank hero — see
  // markReturnToEstimate/consumeReturnToEstimate in bookingStore.js.
  useEffect(() => {
    function restoreFromBack() {
      if (!consumeReturnToEstimate()) return;
      const quoteDraft = estimateToQuoteDraft(getEstimate());
      if (!quoteDraft) return;
      setContinueQuoteDraft(quoteDraft);
      setShowEstimate(true);
    }
    restoreFromBack();
  }, []);

  // While the route-exists check (getRoute) is in flight, after the PIN
  // checks above already passed — brief, but worth a disabled/labeled
  // button so a slow connection doesn't look like a dead click.
  const [checkingRoute, setCheckingRoute] = useState(false);
  const [activeStop, setActiveStop] = useState(0);
  const cityErrorRef = useRef(null);

  // Scrolls the error into view the moment one appears, regardless of which
  // check set it (PIN format, same city, no route) — the form sits well
  // down the page, so a silently-appearing message above/below the fold is
  // easy to miss otherwise.
  useEffect(() => {
    if (cityError) cityErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cityError]);

  // Keeps each field numeric-as-you-type and caps it at 6 digits, matching
  // a real Indian PIN code.
  function handlePinInput(setter) {
    return (event) => setter(event.target.value.replace(/\D/g, "").slice(0, 6));
  }

  // Resolves a 6-digit PIN to one of our serviced cities via
  // /api/resolve-pincode (see that route — it's proxied server-side).
  // Debounced. Always sets fromCity on a match, even when it equals the
  // other leg's city — handleSubmit's fromCity===toCity check is what
  // reports that case accurately; silently skipping the set here would
  // leave toCity/fromCity empty while the status still claims "Detected",
  // producing a misleading "enter a valid PIN" error instead.
  useEffect(() => {
    if (!PIN_REGEX.test(pickupPin)) {
      setPickupPinStatus({ status: "idle" });
      return undefined;
    }
    let cancelled = false;
    setPickupPinStatus({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resolve-pincode?pincode=${pickupPin}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.matched) setFromCity(data.city);
        setPickupPinStatus(
          data.matched
            ? { status: "matched", city: data.city, pin: pickupPin }
            : { status: "not_matched", district: data.district, state: data.state }
        );
      } catch {
        if (!cancelled) setPickupPinStatus({ status: "error" });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickupPin]);

  useEffect(() => {
    if (!PIN_REGEX.test(destinationPin)) {
      setDestinationPinStatus({ status: "idle" });
      return undefined;
    }
    let cancelled = false;
    setDestinationPinStatus({ status: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resolve-pincode?pincode=${destinationPin}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.matched) setToCity(data.city);
        setDestinationPinStatus(
          data.matched
            ? { status: "matched", city: data.city, pin: destinationPin }
            : { status: "not_matched", district: data.district, state: data.state }
        );
      } catch {
        if (!cancelled) setDestinationPinStatus({ status: "error" });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [destinationPin]);

  // Cycles pickup -> in transit -> destination on a loop, same 2s-per-stop
  // pacing ServiceStepsWheel uses for its own auto-advancing steps.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActiveStop((stop) => (stop + 1) % ROUTE_STOPS.length);
    }, STOP_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    // Surfaces the route as a service gap — ServiceGapModal if already
    // signed in (logged the instant the modal is shown, not gated behind
    // its button — see logServiceGapLead's comment above), or the same
    // sign-in gate generateQuote uses below otherwise, so there's always an
    // account for carcoolie-admin to pull contact info from instead of
    // asking the customer to type it in again.
    function flagServiceGap() {
      setCityError("");
      pendingPinsRef.current = { pickupPin, destinationPin };
      if (isSupabaseConfigured && !session) {
        setPendingAction("service-gap");
        setAuthModalOpen(true);
        return;
      }
      if (session) logServiceGapLead(session.user.id, pickupPin, destinationPin);
      setShowServiceGapModal(true);
    }

    // "Resolved" = this PIN actually means something, whether serviced
    // (matched) or not (not_matched with a district/state) — as opposed to
    // empty/still-checking (idle/checking) or not a real PIN at all
    // (not_matched with no district). Both legs have to be resolved before
    // a service gap is worth flagging — one blank/invalid PIN alongside one
    // valid-but-unserviced PIN isn't "this route needs a lead", it's just
    // an incomplete form, so it falls through to the plain errors below
    // instead of opening the sign-in gate / popup over a field the
    // customer hasn't actually filled in correctly yet.
    function isResolved(status) {
      return status.status === "matched" || (status.status === "not_matched" && status.district);
    }

    if (!isResolved(pickupPinStatus) || !isResolved(destinationPinStatus)) {
      const invalid = [pickupPinStatus, destinationPinStatus].find(
        (status) => status.status === "not_matched" && !status.district
      );
      setCityError(
        invalid ? "That PIN code doesn't exist — please double-check it." : "Enter a valid pickup and destination PIN code."
      );
      return;
    }

    // Both PINs are resolved — if either leg is a known-but-unserviced
    // place (not_matched with a district), that's a genuine service gap.
    if (!fromCity || !toCity) {
      flagServiceGap();
      return;
    }
    if (fromCity === toCity) {
      setCityError("Pickup and destination PIN codes resolve to the same city.");
      return;
    }

    setCityError("");
    setCheckingRoute(true);
    const route = await getRoute(fromCity, toCity);
    setCheckingRoute(false);
    if (!route) {
      // Both PINs are individually serviced, just no route between them yet
      // — same real service gap as the unmatched-PIN case above.
      flagServiceGap();
      return;
    }

    if (isSupabaseConfigured && !session) {
      setPendingAction("quote");
      pendingPinsRef.current = { pickupPin, destinationPin };
      setAuthModalOpen(true);
      return;
    }

    if (isSupabaseConfigured && session) {
      await generateQuote(session.user.id, pickupPin, destinationPin);
      return;
    }

    setShowEstimate(true);
  }

  return (
    <>
      <section className="relative isolate bg-white px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
      {/* Clips just this decorative blob (it's offset past the section's own
          edges) instead of the whole section — overflow-hidden on the
          section itself used to also clip the city dropdowns' floating
          panels the moment they grew taller than the hero, cutting them off
          against whatever section happened to sit below instead of letting
          them float on top of it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fecaca_0%,#fee2e2_45%,transparent_70%)]" />
      </div>
      <Navbar />

      <div className="relative mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm font-bold text-red-600">India-wide car transportation</p>
          <h1 className="mt-3 text-4xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl">
            <span className="block text-[#0b1e42]">Your Car Our</span>
            <span className="block text-red-600">Responsibility</span>
          </h1>

          <div className="mt-12 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
            <div className="grid grid-cols-3 text-center text-base font-extrabold text-[#0b1e42] sm:text-lg">
              {ROUTE_STOPS.map((stop) => (
                <span key={stop.label}>{stop.label}</span>
              ))}
            </div>
            <div className="relative mt-2.5 grid grid-cols-3 place-items-center">
              <span
                aria-hidden
                className="absolute top-1/2 left-[16.667%] right-[16.667%] -translate-y-1/2 border-t border-dashed border-red-300"
              />
              {ROUTE_STOPS.map((stop, i) => (
                <RouteMarker
                  key={stop.label}
                  state={i < activeStop ? "done" : i === activeStop ? "active" : "upcoming"}
                />
              ))}
            </div>

            <div className="relative mt-6 aspect-4/3 overflow-hidden rounded-2xl bg-slate-50">
              <Image
                key={ROUTE_STOPS[activeStop].image}
                src={ROUTE_STOPS[activeStop].image}
                alt={`CarCoolie carrier truck — ${ROUTE_STOPS[activeStop].label} stage of a vehicle's journey`}
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              />
            </div>
          </div>
        </div>

        <div>
          {/* Invisible twin of the left column's label + heading, so the
              card below lines up with the left card's top edge instead of
              floating higher (its own content is much shorter). */}
          <div aria-hidden className="invisible hidden select-none lg:block">
            <p className="text-sm font-bold">India-wide car transportation</p>
            <h1 className="mt-3 text-4xl leading-[1.15] font-extrabold tracking-tight sm:text-5xl">
              <span className="block">Your Car Our</span>
              <span className="block">Responsibility</span>
            </h1>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 sm:p-10 lg:mt-12">
            <h2 className="text-2xl font-extrabold text-[#0b1e42] sm:text-3xl">Get Your Estimated Quote</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Enter your pickup and destination PIN code — we&apos;ll detect the city for you — to get a quick
              transportation estimate.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="grid gap-5">
                <label className="block">
                  <span className="block text-xs font-bold tracking-wide text-slate-500 uppercase">Pickup PIN Code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pickupPin}
                    onChange={handlePinInput(setPickupPin)}
                    placeholder="e.g. 110001"
                    className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                  />
                  <PincodeStatus status={pickupPinStatus} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold tracking-wide text-slate-500 uppercase">Destination PIN Code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={destinationPin}
                    onChange={handlePinInput(setDestinationPin)}
                    placeholder="e.g. 400001"
                    className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-[#0b1e42] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-red-500"
                  />
                  <PincodeStatus status={destinationPinStatus} />
                </label>
              </div>

              {cityError && (
                <p ref={cityErrorRef} className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {cityError}
                </p>
              )}

              <button
                type="submit"
                disabled={checkingRoute}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-80"
              >
                {checkingRoute ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking Route…
                  </>
                ) : (
                  <>
                    Get Estimated Quote
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Fast estimate&nbsp;&middot;&nbsp;Secure booking&nbsp;&middot;&nbsp;No hidden charges
            </p>
          </div>
        </div>
      </div>
      </section>

      <EstimateModal
        open={showEstimate}
        onClose={() => {
          setShowEstimate(false);
          setContinueQuoteDraft(null);
        }}
        initialFromCity={continueQuoteDraft?.fromCity ?? fromCity}
        initialToCity={continueQuoteDraft?.toCity ?? toCity}
        initialPickupPin={continueQuoteDraft?.pickupPin ?? pickupPin}
        initialDestinationPin={continueQuoteDraft?.destinationPin ?? destinationPin}
        initialPickupPinStatus={continueQuoteDraft?.pickupPinStatus ?? pickupPinStatus}
        initialDestinationPinStatus={continueQuoteDraft?.destinationPinStatus ?? destinationPinStatus}
        initialVehicleType={continueQuoteDraft?.vehicleType}
        initialMake={continueQuoteDraft?.make}
        initialModel={continueQuoteDraft?.model}
        initialPickupMethod={continueQuoteDraft?.pickupMethod}
        initialDropoffMethod={continueQuoteDraft?.dropoffMethod}
        initialSelectedAddOns={continueQuoteDraft?.selectedAddOns}
        initialCoupon={continueQuoteDraft?.coupon}
      />

      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setPendingAction(null);
          setAuthModalOpen(false);
        }}
        reason={
          pendingAction === "service-gap"
            ? "Sign in or create an account so our team can contact you about this route."
            : "Sign in or create an account to generate your quote."
        }
      />

      {/* The lead is already logged the instant this modal opens (see
          logServiceGapLead's comment above) — both of its buttons just
          close it, "Request Callback" is purely reassurance copy. */}
      {showServiceGapModal && (
        <ServiceGapModal
          onClose={() => setShowServiceGapModal(false)}
          onRequestCallback={() => setShowServiceGapModal(false)}
        />
      )}

      {savedDraft && !savedDraftDismissed && (
        <div
          style={{ animation: "slideInRight 0.4s ease-out" }}
          className="fixed top-4 right-4 z-300 flex max-w-sm items-start gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-2xl ring-1 ring-slate-900/5"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Truck className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-bold text-[#0b1e42]">Continue where you left off?</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {draftSummary?.fromCity} &rarr; {draftSummary?.toCity}
              {draftSummary?.vehicleType ? ` · ${draftSummary.vehicleType}` : ""}
              {typeof draftSummary?.total === "number" ? ` · ${formatINR(draftSummary.total)}` : ""}
            </p>
            <button
              type="button"
              onClick={handleContinueDraft}
              className="mt-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              {savedDraft.stage === "quote" ? "Continue Quote" : "Continue Booking"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSavedDraftDismissed(true)}
            aria-label="Dismiss"
            className="mt-0.5 shrink-0 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
