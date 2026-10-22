import Footer from "../landing-page/components/Footer";
import FaqHero from "./components/FaqHero";
import FaqSections from "./components/FaqSections";

export const metadata = {
  title: "FAQs | Car Coolie",
  description:
    "Answers to common questions about booking, tracking, insurance, payments and more — for B2C customers and B2B partners.",
};

export default function FaqPage() {
  return (
    <main className="relative bg-slate-50">
      <FaqHero />
      <FaqSections />
      <Footer />
    </main>
  );
}
