import Footer from "../landing-page/components/Footer";
import Testimonials from "../landing-page/components/Testimonials";
import FAQ from "../landing-page/components/FAQ";
import ContactFormSection from "./components/ContactFormSection";
import ContactHero from "./components/ContactHero";
import ContactInfoBand from "./components/ContactInfoBand";

export const metadata = {
  title: "Contact Us | Car Coolie",
  description:
    "Get in touch with OSL Car Coolie for vehicle transport quotes, support, and logistics enquiries.",
};

export default function ContactPage() {
  return (
    <main className="relative">
      <ContactHero />

      <ContactInfoBand />

      <ContactFormSection />

      <FAQ />

      <Testimonials />

      <Footer />
    </main>
  );
}
