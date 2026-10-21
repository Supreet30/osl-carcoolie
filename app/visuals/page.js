import fs from "fs";
import path from "path";
import Footer from "../landing-page/components/Footer";
import GallerySection from "./components/GallerySection";
// SocialCarousel ("Explore More on Instagram & YouTube") is commented out,
// not deleted — turn it back on by uncommenting this import and its render
// below once there's a real social feed to show.
// import SocialCarousel from "./components/SocialCarousel";
import VisualsCta from "./components/VisualsCta";
import VisualsHero from "./components/VisualsHero";

export const metadata = {
  title: "Visuals | Car Coolie",
  description:
    "A look into CarCoolie's journey — moments from pickups to safe deliveries across India.",
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

// Reads public/visuals directly rather than hardcoding a filename list or a
// count — runs at build time (this page has no other dynamic data, so
// Next.js statically generates it), so the gallery always matches whatever
// files actually sit in that folder, no code change needed to add or remove
// one. Sorted by filename (001.jpg, 002.jpg, ...) for a stable order.
function getVisualsGalleryImages() {
  const dir = path.join(process.cwd(), "public", "visuals");
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => `/visuals/${name}`);
}

// Same reasoning/pattern as getVisualsGalleryImages above, for the Featured
// Video cards — `title` is derived straight from the filename (no separate
// metadata file to keep in sync), so a video just needs a reasonably
// readable filename to show up with a sensible title.
function getFeaturedVideos() {
  const dir = path.join(process.cwd(), "public", "visuals-videos");
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .filter((name) => VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => ({
      src: `/visuals-videos/${name}`,
      title: path.basename(name, path.extname(name)).replace(/[-_]+/g, " "),
    }));
}

export default function VisualsPage() {
  const galleryImages = getVisualsGalleryImages();
  const featuredVideos = getFeaturedVideos();

  return (
    <main className="relative">
      <VisualsHero />
      <GallerySection images={galleryImages} videos={featuredVideos} />
      {/* <SocialCarousel /> */}
      <VisualsCta />
      <Footer />
    </main>
  );
}
