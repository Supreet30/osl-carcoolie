import Footer from "../landing-page/components/Footer";
import GalleryHero from "./components/GalleryHero";
import GalleryShowcase from "./components/GalleryShowcase";

export const metadata = {
  title: "Gallery | Car Coolie",
  description:
    "A look into CarCoolie's journey — explore the moments that drive our commitment to trust, care, and perfection.",
};

export default function GalleryPage() {
  return (
    <main className="relative">
      <GalleryHero />
      <GalleryShowcase />
      <Footer />
    </main>
  );
}
