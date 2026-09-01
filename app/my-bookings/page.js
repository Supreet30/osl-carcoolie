import { Suspense } from "react";
import Navbar from "../landing-page/components/Navbar";
import Footer from "../landing-page/components/Footer";
import MyBookingsClient from "./components/MyBookingsClient";

export const metadata = {
  title: "My Bookings | Car Coolie",
  description: "Track the status of your CarCoolie vehicle transport bookings.",
};

export default function MyBookingsPage() {
  return (
    <main className="relative bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <h1 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">My Bookings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Track the status of your vehicle transport bookings.
        </p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <MyBookingsClient />
          </Suspense>
        </div>
      </div>
      <Footer />
    </main>
  );
}
