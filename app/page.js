import Image from "next/image";
import NewsletterBar from "./components/NewsletterBar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Image
        src="/landing-page.png"
        alt="OSL Car Coolie - Website Coming Soon"
        width={720}
        height={412}
        priority
        className="h-auto w-full"
      />
      <NewsletterBar />
    </div>
  );
}
