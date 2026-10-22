import LegalDocument from "../legal/LegalDocument";

export const metadata = { title: "Terms and Conditions | Car Coolie" };

// Content is edited from the admin panel, so it must never be prerendered.
export const dynamic = "force-dynamic";

export default function TermsOfServicePage() {
  return <LegalDocument slug="terms" />;
}
