import Footer from "../landing-page/components/Footer";
import CompanyNumbersCta from "./components/CompanyNumbersCta";
import CompanyNumbersHero from "./components/CompanyNumbersHero";
import GrowthChart from "./components/GrowthChart";
import NationwideNetwork from "./components/NationwideNetwork";
import NumbersThatDefineUs from "./components/NumbersThatDefineUs";

export const metadata = {
  title: "Company Numbers | Car Coolie",
  description:
    "From a single journey to thousands of successful deliveries — the numbers behind every CarCoolie movement.",
};

export default function CompanyNumbersPage() {
  return (
    <main className="relative">
      <CompanyNumbersHero />
      <NumbersThatDefineUs />
      <GrowthChart />
      <NationwideNetwork />
      <CompanyNumbersCta />
      <Footer />
    </main>
  );
}
