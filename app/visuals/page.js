import Footer from "../landing-page/components/Footer";
import GallerySection from "./components/GallerySection";
import SocialCarousel from "./components/SocialCarousel";
import VisualsCta from "./components/VisualsCta";
import VisualsHero from "./components/VisualsHero";

export const metadata = {
  title: "Visuals | Car Coolie",
  description:
    "A look into CarCoolie's journey — moments from pickups to safe deliveries across India.",
};

export default function VisualsPage() {
  return (
    <main className="relative">
      <VisualsHero />
      <GallerySection />
      <SocialCarousel />
      <VisualsCta />
      <Footer />
    </main>
  );
}
