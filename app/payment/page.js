import { Suspense } from "react";
import Navbar from "../landing-page/components/Navbar";
import Footer from "../landing-page/components/Footer";
import PaymentClient from "./components/PaymentClient";

export const metadata = {
  title: "Payment | Car Coolie",
  description: "Pay your CarCoolie vehicle transport booking's advance or 50% checkpoint online.",
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
