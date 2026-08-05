import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[560px] overflow-hidden bg-navy-deep text-white md:min-h-[640px]">
      <Image
        src="/assets/hero-resort.jpg"
        alt="Luxury resort"
        fill
        priority
        className="object-cover opacity-70"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/70 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="max-w-xl">
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
            Travel More.
            <br />
            Spend Less.
            <br />
            <span className="text-gold">Live Better.</span>
          </h1>
          <p className="mt-5 text-lg text-white/85">
            Exclusive Holiday Membership with Premium Resorts Across India &
            International Destinations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/membership" className="btn-primary">
              Explore Membership
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-ghost">
              <CalendarCheck className="mr-1 h-4 w-4" />
              Book Free Presentation
            </Link>
          </div>
        </div>
        <button
          type="button"
          className="absolute bottom-8 right-8 hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20 md:flex"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-navy">
            <Play className="h-4 w-4 fill-current" />
          </span>
          <span className="text-sm font-semibold">Watch Video</span>
        </button>
      </div>
    </section>
  );
}
