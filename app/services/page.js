import Footer from "../landing-page/components/Footer";
import Testimonials from "../landing-page/components/Testimonials";
import FAQ from "../landing-page/components/FAQ";
import ContactSection from "./components/ContactSection";
import ExploreServices from "./components/ExploreServices";
import ServicesHero from "./components/ServicesHero";
import ServicesShowcase from "./components/ServicesShowcase";
import StatsSection from "./components/StatsSection";
import { ServiceSelectionProvider } from "./context/ServiceSelectionContext";

export const metadata = {
  title: "Our Services | Car Coolie",
  description:
    "Explore CarCoolie's secure, truck-based vehicle transportation services with GPS tracking and nationwide coverage.",
};

export default function ServicesPage() {
  return (
    <main className="relative">
        <ServicesHero />
        <ServiceSelectionProvider>
          <ServicesShowcase />
          <StatsSection />
          <ExploreServices />
        </ServiceSelectionProvider>
        <FAQ />
        <Testimonials />
        <ContactSection />
        <Footer />
    </main>
  );
}
