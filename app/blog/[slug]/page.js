import { notFound } from "next/navigation";
import Footer from "../../landing-page/components/Footer";
import BlogNewsletterCta from "../components/BlogNewsletterCta";
import { BLOG_POSTS, getPostBySlug } from "../posts";
import BlogPostHero from "./components/BlogPostHero";
import BlogPostContent from "./components/BlogPostContent";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found | Car Coolie" };
  }

  return {
    title: `${post.title} | Car Coolie Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Same-tag posts first, then fill the rest of the carousel with other
  // posts so there's always enough to page through (up to 2 pages of 3).
  const others = BLOG_POSTS.filter((candidate) => candidate.slug !== post.slug);
  const sameTag = others.filter((candidate) => candidate.tag === post.tag);
  const rest = others.filter((candidate) => candidate.tag !== post.tag);
  const relatedPosts = [...sameTag, ...rest].slice(0, 6);

  return (
    <main className="relative">
      <BlogPostHero post={post} />
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
      <BlogNewsletterCta />
      <Footer />
    </main>
  );
}
