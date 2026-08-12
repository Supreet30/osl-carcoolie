import Footer from "../landing-page/components/Footer";
import ExploreResources from "./components/ExploreResources";
import LatestResource from "./components/LatestResource";
import NewsletterCTA from "./components/NewsletterCTA";
import ResourcesHero from "./components/ResourcesHero";

export const metadata = {
  title: "Resources | Car Coolie",
  description:
    "Guides, client stories, and expert tips about car transport, logistics, and keeping your vehicle moving safely.",
};

export default function ResourcesPage() {
  return (
    <main className="relative">
      <ResourcesHero />
      <ExploreResources />
      <LatestResource />
      <NewsletterCTA />
      <Footer />
    </main>
  );
}
