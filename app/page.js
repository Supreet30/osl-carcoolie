import Image from "next/image";
import NewsletterBar from "./components/NewsletterBar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Image
        src="/landing-page.png"
        alt="OSL Car Coolie - Website Coming Soon"
        width={2620}
        height={1024}
        priority
        className="w-full h-auto shrink-0 grow-0"
      />
      <NewsletterBar />
    </div>
  );
}
