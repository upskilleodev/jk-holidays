import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  light,
  align = "center",
}: {
  eyebrow: string;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div
        className={cn(
          "px-1 text-[10px] font-bold tracking-[0.16em] uppercase sm:text-xs sm:tracking-[0.3em]",
          light ? "text-gold" : "text-navy",
        )}
      >
        {eyebrow}
      </div>
    </div>
  );
}
