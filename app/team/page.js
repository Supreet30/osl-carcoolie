import Footer from "../landing-page/components/Footer";
import MeetTheTeam from "./components/MeetTheTeam";
import TeamCta from "./components/TeamCta";
import TeamHero from "./components/TeamHero";
import TeamSpirit from "./components/TeamSpirit";
import TeamStats from "./components/TeamStats";

export const metadata = {
  title: "Our Team | Car Coolie",
  description:
    "Meet the drivers, coordinators, and support staff behind every CarCoolie delivery.",
};

export default function TeamPage() {
  return (
    <main className="relative">
      <TeamHero />
      <TeamStats />
      <TeamSpirit />
      <MeetTheTeam />
      <TeamCta />
      <Footer />
    </main>
  );
}
