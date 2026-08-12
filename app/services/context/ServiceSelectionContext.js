"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { TABS } from "../data/serviceTabs";

const ServiceSelectionContext = createContext(null);

// Wraps every section on the services page that needs to know which
// service card is currently focused (ServicesShowcase sets it, ExploreServices
// reads it) — they can sit anywhere in the tree as long as they're both
// inside this provider, no prop drilling required.
export function ServiceSelectionProvider({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const value = useMemo(
    () => ({
      activeTab,
      activeIndex,
      selectTab: (tabIndex) => {
        setActiveTab(tabIndex);
        setActiveIndex(0);
      },
      selectService: setActiveIndex,
      tab: TABS[activeTab],
      service: TABS[activeTab].services[activeIndex],
    }),
    [activeTab, activeIndex]
  );

  return (
    <ServiceSelectionContext.Provider value={value}>{children}</ServiceSelectionContext.Provider>
  );
}

export function useServiceSelection() {
  const ctx = useContext(ServiceSelectionContext);
  if (!ctx) {
    throw new Error("useServiceSelection must be used within a ServiceSelectionProvider");
  }
  return ctx;
}
