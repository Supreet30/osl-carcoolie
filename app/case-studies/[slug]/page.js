import { notFound } from "next/navigation";
import Footer from "../../landing-page/components/Footer";
import CaseStudiesCta from "../components/CaseStudiesCta";
import { ALL_CASE_STUDIES, getCaseStudyBySlug } from "../case-studies";
import CaseStudyHero from "./components/CaseStudyHero";
import CaseStudyContent from "./components/CaseStudyContent";

export async function generateStaticParams() {
  return ALL_CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    return { title: "Case Study Not Found | Car Coolie" };
  }

  return {
    title: `${study.heroTitle} | Car Coolie Case Studies`,
    description: study.heroSubtitle,
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  // Same-industry studies first, then fill the carousel with others so
  // there's always enough to page through (up to 2 pages of 3). Pick only
  // the plain-data fields RelatedCaseStudies (a Client Component) needs —
  // full entries carry lucide icon component references (both at the
  // top level and inside `stats`) that can't cross the server/client
  // boundary as props.
  const others = ALL_CASE_STUDIES.filter((candidate) => candidate.slug !== study.slug);
  const sameIndustry = others.filter((candidate) => candidate.industry === study.industry);
  const rest = others.filter((candidate) => candidate.industry !== study.industry);
  const relatedStudies = [...sameIndustry, ...rest]
    .slice(0, 6)
    .map(({ slug, industry, category, title, description, image }) => ({
      slug,
      industry,
      category,
      title,
      description,
      image,
    }));

  return (
    <main className="relative">
      <CaseStudyHero study={study} />
      <CaseStudyContent study={study} relatedStudies={relatedStudies} />
      <CaseStudiesCta />
      <Footer />
    </main>
  );
}
