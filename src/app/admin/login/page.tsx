import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Logo } from "@/components/brand/Logo";

export const metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");
  if (session?.role === "user") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-navy-deep">
      <header className="bg-navy-gradient px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-xs text-white/70 hover:text-gold">
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-md justify-center px-4 py-12">
        <div className="w-full rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-gold text-gold">
              <User className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-navy">
              ADMIN LOGIN
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage plans, orders, and cashback
            </p>
          </div>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
