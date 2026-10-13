import Navbar from "../landing-page/components/Navbar";
import Footer from "../landing-page/components/Footer";
import AccountClient from "./components/AccountClient";

export const metadata = {
  title: "Account Settings | Car Coolie",
  description: "Manage your Car Coolie account details and saved addresses.",
};

export default function AccountPage() {
  return (
    <main className="relative bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <h1 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">Account Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Manage your details and saved addresses.
        </p>

        <div className="mt-8">
          <AccountClient />
        </div>
      </div>
      <Footer />
    </main>
  );
}
