import Navbar from "../landing-page/components/Navbar";
import Footer from "../landing-page/components/Footer";
import ResetPasswordClient from "./components/ResetPasswordClient";

export const metadata = {
  title: "Reset Password | Car Coolie",
  description: "Set a new password for your CarCoolie account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="relative bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <ResetPasswordClient />
      </div>
      <Footer />
    </main>
  );
}
