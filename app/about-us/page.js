import Footer from "../landing-page/components/Footer";
import Testimonials from "../landing-page/components/Testimonials";
import AboutHero from "./components/AboutHero";
import AboutStats from "./components/AboutStats";
import CoreValues from "./components/CoreValues";
import JoinUsSection from "./components/JoinUsSection";
import LeadershipSection from "./components/LeadershipSection";
import WhatWeProvide from "./components/WhatWeProvide";

export const metadata = {
  title: "About Us | Car Coolie",
  description:
    "Learn about CarCoolie, India's growing vehicle logistics company, and get in touch with our team.",
};

export default function AboutUsPage() {
  return (
    <main className="relative">
      <AboutHero />
      <WhatWeProvide />
      <CoreValues />
      <AboutStats />
      <LeadershipSection />
      <Testimonials />
      <JoinUsSection />
      <Footer />
    </main>
  );
}
