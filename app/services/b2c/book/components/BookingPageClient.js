"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import AuthModal from "../../../../components/AuthModal";
import { isSupabaseConfigured, supabase } from "../../../../../lib/supabaseClient";
import { getEstimate, getEstimateDraftId, getLocalFormDraft, markReturnToEstimate } from "../../lib/bookingStore";

// Single source of truth for the estimate — loaded once here and handed to
// both the form and the summary sidebar, instead of each independently
// reading localStorage. `details` is the live-updating subset of the form
// (pickup/drop-off method, date, time slot) the summary card also shows.
export default function BookingPageClient() {
  const router = useRouter();
  // undefined = not checked yet — avoids flashing the wrong gate before the
  // session has actually been read.
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [estimateState, setEstimateState] = useState({ loaded: false, data: null, draftId: null, formValues: null });
  const [details, setDetails] = useState({ pickupMethod: "driver", dropoffMethod: "driver", date: "", timeSlot: "" });
  const [authModalOpen, setAuthModalOpen] = useState(true);

  useEffect(() => {
    // getEstimate() is a plain, non-destructive read (see bookingStore.js —
    // it's gated by a time-boxed envelope, not a one-time token), so this
    // page only ever makes sense within that window: right after "Book Now"
    // (EstimateModal.js), returning via the page-level Back button below, or
    // a direct revisit/refresh within the same window. A stale/bookmarked
    // visit well after the fact still correctly finds nothing and falls
    // through to the "no estimate" gate below. In an effect (not a lazy
    // useState initializer) because this still has to run client-only —
    // localStorage doesn't exist during this client component's SSR pass.
    function loadEstimate() {
      const data = getEstimate();
      const draftId = getEstimateDraftId();
      setEstimateState({ loaded: true, data, draftId, formValues: draftId ? getLocalFormDraft(draftId) : null });
    }
    loadEstimate();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSummaryChange = useCallback((next) => setDetails(next), []);

  // Nothing to render yet — avoids a flash of the wrong gate before both
  // checks above have resolved.
  if (session === undefined || !estimateState.loaded) return null;

  // Booking requires an account (a booking is stamped with the signed-in
  // customer's id — see createBooking in bookingStore.js), same as
  // generating the estimate itself already requires (B2cHero.js) — this is
  // the backstop for landing here directly while signed out.
  if (isSupabaseConfigured && !session) {
    return (
      <>
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-extrabold text-[#0b1e42]">Sign in required</p>
          <p className="max-w-sm text-sm text-slate-500">You need to be signed in to continue your booking.</p>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Sign In
          </button>
        </div>
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          reason="Sign in to continue your booking."
        />
      </>
    );
  }

  // This page only ever makes sense right after generating an estimate and
  // clicking "Book Now" (see EstimateModal.js) — a direct visit, refresh, or
  // bookmark has nothing legitimate to book against, even if an old
  // estimate happens to still be saved from earlier in the session.
  if (!estimateState.data) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
        <p className="text-lg font-extrabold text-[#0b1e42]">No estimate found</p>
        <p className="max-w-sm text-sm text-slate-500">
          Booking starts with a quote — enter your pickup and destination PIN codes to get one.
        </p>
        <Link
          href="/services/b2c"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          Get an Estimate
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  function handleBack() {
    markReturnToEstimate();
    router.push("/services/b2c");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        className="mt-8 mb-6 flex items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-red-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Back
      </button>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <BookingForm
          estimate={estimateState.data}
          estimateLoaded={estimateState.loaded}
          draftId={estimateState.draftId}
          initialFormValues={estimateState.formValues}
          onSummaryChange={handleSummaryChange}
        />
        <BookingSummary estimate={estimateState.data} details={details} />
      </div>
    </>
  );
}
