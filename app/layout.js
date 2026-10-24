import { Exo_2, Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import FloatingActions from "@/app/components/FloatingActions"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Only used on the OSL Group "managed by" heading (app/about-us/components/
// OslGroupTimeline.js) via the `font-outfit` utility below — everything
// else on the site stays on Geist, the default.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// The "Car Coolie" wordmark style (see app/components/BrandMark.js) used
// for prominent headings/hero taglines/footer brand line across the site —
// bold italic, matching the actual logo. Only that one weight+style is ever
// used for it, so no need to load the rest of Exo 2's range.
const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: "700",
  style: "italic",
});

export const metadata = {
  title: "Car Coolie | Website Coming Soon",
  description: "Car Coolie - Car Carrying Solutions. Our website is coming soon, stay tuned!",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${exo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <FloatingActions />
      </body>
    </html>
  );
}
