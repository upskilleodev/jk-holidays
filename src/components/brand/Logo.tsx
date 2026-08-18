import Image from "next/image";

type Props = {
  /** Kept for callers; image works on light and dark surfaces. */
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

const sizes = {
  sm: { width: 160, height: 129, className: "h-12 w-auto sm:h-14" },
  md: { width: 200, height: 162, className: "h-16 w-auto sm:h-[4.5rem]" },
  lg: { width: 280, height: 226, className: "h-24 w-auto sm:h-28" },
};

export function Logo({ size = "md", priority = false }: Props) {
  const s = sizes[size];
  return (
    <Image
      src="/assets/jk-holidays-logo.png"
      alt="JK Holidays — Journey Beyond Expectations"
      width={s.width}
      height={s.height}
      className={`${s.className} object-contain`}
      priority={priority}
    />
  );
}
