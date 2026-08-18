import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  Gift,
  Headphones,
  Layout,
  Tag,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LoginPanel } from "@/components/auth/LoginPanel";

export const metadata = {
  title: "Membership Login",
};

const benefits = [
  {
    icon: Briefcase,
    title: "Manage Your Bookings",
    text: "View and manage your holiday bookings easily.",
  },
  {
    icon: Tag,
    title: "Exclusive Member Offers",
    text: "Access special discounts and member-only offers.",
  },
  {
    icon: Layout,
    title: "Personalized Dashboard",
    text: "Track your membership, referrals and rewards.",
  },
  {
    icon: Headphones,
    title: "24/7 Member Support",
    text: "We are here to help you anytime, anywhere.",
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy-deep">
      <header className="bg-navy-gradient px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/">
            <Logo size="md" priority />
          </Link>
        </div>
      </header>
      <div className="relative min-h-[calc(100vh-72px)]">
        <Image
          src="/assets/hero-resort.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-navy-deep/70" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
          <div className="text-white">
            <h1 className="font-display text-4xl font-bold md:text-5xl">
              Welcome Back,
              <br />
              <span className="text-gold">Valued Member!</span>
            </h1>
            <p className="mt-3 max-w-md text-white/80">
              Login to your account and explore a world of exclusive holiday
              benefits.
            </p>
            <div className="mt-8 space-y-4 max-w-md">
              {benefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/60 bg-navy text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{title}</div>
                    <div className="text-sm text-white/70">{text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex max-w-md items-center gap-3 rounded-xl border border-gold/40 bg-white/5 p-4">
              <Gift className="h-8 w-8 text-gold" />
              <div className="flex-1">
                <div className="font-semibold">Not a Member Yet?</div>
                <div className="text-xs text-white/70">
                  Join JK Holidays and unlock amazing travel experiences.
                </div>
              </div>
              <Link href="/signup" className="btn-primary !h-9 !px-3 !text-xs">
                Explore
              </Link>
            </div>
          </div>

          <div className="flex items-start justify-center lg:pt-6">
            <LoginPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
