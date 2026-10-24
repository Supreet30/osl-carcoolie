import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import AboutUs from "./components/AboutUs";
import OurServices from "./components/OurServices";
import OurPartners from "./components/OurPartners";
// import BookingSteps from "./components/BookingSteps"; // hidden for now
import CaseStudies from "./components/CaseStudies";
import WhyCarcoolie from "./components/WhyCarcoolie";
import Testimonials from "./components/Testimonials";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

export const metadata = {
  title: "Car Coolie | Freight That Moves At The Speed Of Now",
  description:
    "Car Coolie - car carrying and freight logistics solutions that move at the speed of now.",
};

export default function LandingPage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <TrustBar />
      <AboutUs />
      <OurServices />
      <OurPartners />
      {/* <BookingSteps /> hidden for now */}
      <CaseStudies />
      <Testimonials />
      <WhyCarcoolie />
      <CallToAction />
      <Footer />
    </main>
  );
}
