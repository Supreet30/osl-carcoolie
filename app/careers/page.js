import Footer from "../landing-page/components/Footer";
import CareersHero from "./components/CareersHero";
import CareersWhyUs from "./components/CareersWhyUs";
import JobOpeningsSection from "./components/JobOpeningsSection";

export const metadata = {
  title: "Careers | Car Coolie",
  description:
    "Explore open roles at Car Coolie — join India's growing vehicle transport and logistics network.",
};

export default function CareersPage() {
  return (
    <main className="relative">
      <CareersHero />
      <CareersWhyUs />
      <JobOpeningsSection />
      <Footer />
    </main>
  );
}
