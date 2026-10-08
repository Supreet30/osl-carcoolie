"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import AuthModal from "../../../../components/AuthModal";
import { isSupabaseConfigured, supabase } from "../../../../../lib/supabaseClient";
import { consumeBookingIntent, getEstimate } from "../../lib/bookingStore";

// Single source of truth for the estimate — loaded once here and handed to
// both the form and the summary sidebar, instead of each independently
// reading localStorage. `details` is the live-updating subset of the form
// (pickup/drop-off method, date, time slot) the summary card also shows.
export default function BookingPageClient() {
  // undefined = not checked yet — avoids flashing the wrong gate before
  // both the session and the one-time booking-intent token (see below)
  // have actually been read.
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null);
  const [estimateState, setEstimateState] = useState({ loaded: false, data: null });
  const [details, setDetails] = useState({ pickupMethod: "driver", dropoffMethod: "driver", date: "", timeSlot: "" });
  const [authModalOpen, setAuthModalOpen] = useState(true);

  useEffect(() => {
    // The intent token set by EstimateModal's "Book Now" is consumed
    // (removed) the instant this mounts — a direct visit, a refresh, or
    // revisiting this URL later in the same tab session must all land on
    // the "no estimate" gate below, even though the estimate itself is
    // still sitting in localStorage. See markBookingIntent/
    // consumeBookingIntent in bookingStore.js.
    const hasIntent = consumeBookingIntent();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstimateState({ loaded: true, data: hasIntent ? getEstimate() : null });
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

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <BookingForm
        estimate={estimateState.data}
        estimateLoaded={estimateState.loaded}
        onSummaryChange={handleSummaryChange}
      />
      <BookingSummary estimate={estimateState.data} details={details} />
    </div>
  );
}
