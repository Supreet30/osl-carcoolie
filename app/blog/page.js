import Footer from "../landing-page/components/Footer";
import BlogHero from "./components/BlogHero";
import BlogNewsletterCta from "./components/BlogNewsletterCta";
import BlogShowcase from "./components/BlogShowcase";

export const metadata = {
  title: "Blog | Car Coolie",
  description:
    "Expert tips, industry insights, and the latest updates from the world of car transport, brought to you by CarCoolie.",
};

export default function BlogPage() {
  return (
    <main className="relative">
      <BlogHero />
      <BlogShowcase />
      <BlogNewsletterCta />
      <Footer />
    </main>
  );
}
