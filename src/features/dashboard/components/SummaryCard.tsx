import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: keyof typeof cardColors;
}

const cardColors: Record<
  "purple" | "mint" | "pink" | "blue",
  { accent: string; tint: string }
> = {
  purple: { accent: "#8246FF", tint: "#EEE5FF" },
  mint: { accent: "#00BF94", tint: "#DDFBF2" },
  pink: { accent: "#FF4D88", tint: "#FFE4EF" },
  blue: { accent: "#287DFF", tint: "#E3F0FF" },
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: SummaryCardProps) {
  const colors = cardColors[tone];
  const style = {
    "--card-accent": colors.accent,
    "--card-tint": colors.tint,
  } as CSSProperties;

  return (
    <div
      style={style}
      className="summary-card group relative overflow-hidden rounded-[24px] border border-[var(--roomie-card-border)] bg-white/90 p-5 shadow-[0_8px_30px_rgba(110,93,180,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(110,93,180,0.09)]"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--card-tint)] text-[var(--card-accent)]">
            <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <p className="text-[12px] font-medium text-[#494573]">{title}</p>
        </div>
        <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.045em] text-[#121223]">
          {value}
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-[var(--card-accent)]"
          />
          <p className="text-[11px] font-medium text-[#69608D]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
