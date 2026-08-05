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
          "text-xs font-bold tracking-[0.3em] uppercase",
          light ? "text-gold" : "text-navy",
        )}
      >
        ━━ {eyebrow} ━━
      </div>
    </div>
  );
}
