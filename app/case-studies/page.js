import Footer from "../landing-page/components/Footer";
import CaseStudiesCta from "./components/CaseStudiesCta";
import CaseStudiesHero from "./components/CaseStudiesHero";
import CaseStudiesShowcase from "./components/CaseStudiesShowcase";

export const metadata = {
  title: "Case Studies | Car Coolie",
  description:
    "See how CarCoolie's nationwide vehicle transportation network delivers speed, safety, and reliability for manufacturers, dealerships, and individual owners.",
};

export default function CaseStudiesPage() {
  return (
    <main className="relative">
      <CaseStudiesHero />
      <CaseStudiesShowcase />
      <CaseStudiesCta />
      <Footer />
    </main>
  );
}
