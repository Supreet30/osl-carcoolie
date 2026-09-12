import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/app/components/Whatsapp"

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

export const metadata = {
  title: "OSL Car Coolie | Website Coming Soon",
  description: "OSL Car Coolie - Car Carrying Solutions. Our website is coming soon, stay tuned!",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
