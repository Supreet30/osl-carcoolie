import LegalDocument from "../legal/LegalDocument";

export const metadata = { title: "Privacy Policy | Car Coolie" };

export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  return <LegalDocument slug="privacy" />;
}
