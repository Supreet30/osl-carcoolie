import Footer from "../../landing-page/components/Footer";
import FAQ from "../../landing-page/components/FAQ";
import Testimonials from "../../landing-page/components/Testimonials";
import B2cHero from "./components/B2cHero";
import AssuranceSection from "./components/AssuranceSection";
import ProcessSection from "./components/ProcessSection";
import CouponsSection from "./components/CouponsSection";
import B2cCta from "./components/B2cCta";

export const metadata = {
  title: "Car Transport For Individuals | Car Coolie",
  description:
    "CarCoolie's business-to-customer vehicle transport services — safe, tracked, door-to-door car shipping for individual owners across India.",
};

export default function B2cPage() {
  return (
    <main className="relative bg-white">
      <B2cHero />
      <ProcessSection />
      <AssuranceSection />
      <CouponsSection />
      <Testimonials />
      <FAQ />
      <B2cCta />
      <Footer />
    </main>
  );
}
