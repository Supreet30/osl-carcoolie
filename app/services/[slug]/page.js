import { notFound } from "next/navigation";
import Footer from "../../landing-page/components/Footer";
import { ALL_SERVICE_DETAILS, getServiceDetailBySlug } from "../data/serviceDetails";
import ServiceDetailHero from "./components/ServiceDetailHero";
import ServiceDetailContent from "./components/ServiceDetailContent";

export async function generateStaticParams() {
  return ALL_SERVICE_DETAILS.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getServiceDetailBySlug(slug);

  if (!service) {
    return { title: "Service Not Found | Car Coolie" };
  }

  return {
    title: `${service.title} | Car Coolie`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getServiceDetailBySlug(slug);

  if (!service) {
    notFound();
  }

  const relatedServices = ALL_SERVICE_DETAILS.filter(
    (candidate) => candidate.slug !== service.slug && candidate.tabId === service.tabId
  ).map(({ slug, title, description, image }) => ({ slug, title, description, image }));

  return (
    <main className="relative">
      <ServiceDetailHero service={service} />
      <ServiceDetailContent service={service} relatedServices={relatedServices} />
      <Footer />
    </main>
  );
}
