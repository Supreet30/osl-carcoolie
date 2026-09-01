import Footer from "../landing-page/components/Footer";
import Testimonials from "../landing-page/components/Testimonials";
import FAQ from "../landing-page/components/FAQ";
import ContactForm from "./components/ContactForm";
import ContactHero from "./components/ContactHero";
import ContactInfoBand from "./components/ContactInfoBand";

export const metadata = {
  title: "Contact Us | Car Coolie",
  description:
    "Get in touch with OSL Car Coolie for vehicle transport quotes, support, and logistics enquiries.",
};

export default function ContactPage() {
  return (
    <main className="relative">
      <ContactHero />

      <ContactInfoBand />

      <section id="contact-form" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="text-sm font-semibold text-red-600">Contact Us</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#0b1e42] sm:text-4xl">
              Request Your <span className="text-red-600">Car Transport Quote</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
              Fill out the form below with your vehicle transport requirement and we&apos;ll respond as
              soon as possible.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
            <ContactForm />

            <div className="min-h-[420px] overflow-hidden rounded-3xl bg-slate-100 shadow-xl ring-1 ring-slate-100 lg:min-h-full">
              <iframe
                title="Car Coolie location in Delhi"
                src="https://www.google.com/maps?q=Delhi%2C%20India&z=12&output=embed"
                className="h-full min-h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <Testimonials />

      <Footer />
    </main>
  );
}
