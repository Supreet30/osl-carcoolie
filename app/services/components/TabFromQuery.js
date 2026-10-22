"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { tabIndexById, useServiceSelection } from "../context/ServiceSelectionContext";

// Lets an external link (e.g. landing page's "Partner with us") land on
// /services with a specific tab already open, via ?tab=b2b, without
// changing the page's own default (B2C) for a direct/organic visit.
// Needs its own Suspense boundary (see page.js) since useSearchParams
// opts this component out of static rendering.
export default function TabFromQuery() {
  const searchParams = useSearchParams();
  const { selectTab } = useServiceSelection();
  const requestedTab = searchParams.get("tab");

  useEffect(() => {
    if (requestedTab) {
      selectTab(tabIndexById(requestedTab));
    }
    // Intentionally only reacting to the URL's tab param, not `selectTab`
    // itself (stable from useMemo, but not worth retriggering this on).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab]);

  return null;
}
