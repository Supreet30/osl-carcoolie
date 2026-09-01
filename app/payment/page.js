import { Suspense } from "react";
import Navbar from "../landing-page/components/Navbar";
import Footer from "../landing-page/components/Footer";
import PaymentClient from "./components/PaymentClient";

export const metadata = {
  title: "Advance Payment | Car Coolie",
  description: "Pay your 30% advance to confirm your CarCoolie vehicle transport booking.",
};

export default function PaymentPage() {
  return (
    <main className="relative bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-xl px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <Suspense fallback={null}>
          <PaymentClient />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
