import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import OurServices from "./components/OurServices";
import OurPartners from "./components/OurPartners";
import BookingSteps from "./components/BookingSteps";
import CaseStudies from "./components/CaseStudies";
import WhyCarcoolie from "./components/WhyCarcoolie";
import ChairmanMessage from "./components/ChairmanMessage";
import Testimonials from "./components/Testimonials";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

export const metadata = {
  title: "Car Coolie | Freight That Moves At The Speed Of Now",
  description:
    "OSL Car Coolie - car carrying and freight logistics solutions that move at the speed of now.",
};

export default function LandingPage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <AboutUs />
      <OurServices />
      <ChairmanMessage />
      <OurPartners />
      <BookingSteps />
      <CaseStudies />
      <Testimonials />
      <WhyCarcoolie />
      <CallToAction />
      <Footer />
    </main>
  );
}
