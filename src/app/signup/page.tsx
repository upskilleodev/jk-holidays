import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-navy-deep text-white">
      <header className="bg-navy-gradient px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/">
            <Logo size="md" priority />
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
        <div className="rounded-2xl bg-white p-8 text-navy shadow-2xl">
          <h2 className="text-center font-display text-2xl font-bold">
            Create Your Account
          </h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Join JK Holidays today
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm">Loading...</div>}>
              <AuthForm mode="signup" />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
