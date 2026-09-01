"use client";

import { useCallback, useEffect, useState } from "react";
import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import { getEstimate } from "../../lib/bookingStore";

// Single source of truth for the estimate — loaded once here and handed to
// both the form and the summary sidebar, instead of each independently
// reading localStorage. `details` is the live-updating subset of the form
// (pickup/drop-off method, date, time slot) the summary card also shows.
export default function BookingPageClient() {
  const [estimateState, setEstimateState] = useState({ loaded: false, data: null });
  const [details, setDetails] = useState({ pickupMethod: "driver", dropoffMethod: "driver", date: "", timeSlot: "" });

  useEffect(() => {
    // localStorage doesn't exist during SSR, so the saved estimate can only
    // be read after mount — this is a one-time sync with an external
    // browser API, not a fetch that could use Suspense instead.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstimateState({ loaded: true, data: getEstimate() });
  }, []);

  const handleSummaryChange = useCallback((next) => setDetails(next), []);

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
