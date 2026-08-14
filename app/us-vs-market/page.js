import Footer from "../landing-page/components/Footer";
import MarketComparison from "./components/MarketComparison";
import UsVsMarketCta from "./components/UsVsMarketCta";
import UsVsMarketHero from "./components/UsVsMarketHero";
import WhatSetsApart from "./components/WhatSetsApart";

export const metadata = {
  title: "Us vs Market | Car Coolie",
  description:
    "See how CarCoolie compares to the typical car transport experience — pricing, carriers, and tracking.",
};

export default function UsVsMarketPage() {
  return (
    <main className="relative">
      <UsVsMarketHero />
      <MarketComparison />
      <WhatSetsApart />
      <UsVsMarketCta />
      <Footer />
    </main>
  );
}
