import Navbar from "../../../landing-page/components/Navbar";
import Footer from "../../../landing-page/components/Footer";
import BookingPageClient from "./components/BookingPageClient";

export const metadata = {
  title: "Complete Your Booking | Car Coolie",
  description:
    "Provide pickup and delivery details for your vehicle transport booking with CarCoolie.",
};

export default function B2cBookPage() {
  return (
    <main className="relative bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <h1 className="text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">Complete Your Booking</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Please provide the pickup and delivery details for your vehicle transport. Our team will
          handle the rest with premium care.
        </p>

        <BookingPageClient />
      </div>

      <Footer />
    </main>
  );
}
