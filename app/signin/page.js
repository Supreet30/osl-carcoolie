import AuthCard from "./components/AuthCard";

export const metadata = {
  title: "Sign In | Car Coolie",
  description: "Sign in to your CarCoolie account or create a new one to manage your vehicle transport bookings.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <AuthCard />
    </main>
  );
}
