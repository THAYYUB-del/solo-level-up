import type React from "react";

const RANK_COLORS: Record<
  string,
  { color: string; glow: string; label: string }
> = {
  E: { color: "#6b7280", glow: "rgba(107,114,128,0.4)", label: "E" },
  D: { color: "#22c55e", glow: "rgba(34,197,94,0.4)", label: "D" },
  C: { color: "#3b82f6", glow: "rgba(59,130,246,0.4)", label: "C" },
  B: { color: "#8b5cf6", glow: "rgba(139,92,246,0.4)", label: "B" },
  A: { color: "#f97316", glow: "rgba(249,115,22,0.4)", label: "A" },
  S: { color: "#eab308", glow: "rgba(234,179,8,0.5)", label: "S" },
  SS: { color: "#f59e0b", glow: "rgba(245,158,11,0.6)", label: "SS" },
  SSS: { color: "#ef4444", glow: "rgba(239,68,68,0.6)", label: "SSS" },
};

interface RankBadgeProps {
  rank: string;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = "md",
  animate = false,
}) => {
  const rankData = RANK_COLORS[rank] || RANK_COLORS.E;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        font-display font-black
        rounded-sm
        border-2
        ${animate ? "animate-rank-reveal" : ""}
      `}
      style={{
        color: rankData.color,
        borderColor: rankData.color,
        boxShadow: `0 0 10px ${rankData.glow}, 0 0 20px ${rankData.glow}, inset 0 0 10px ${rankData.glow}`,
        background: `radial-gradient(ellipse at center, ${rankData.glow} 0%, transparent 70%)`,
        textShadow: `0 0 8px ${rankData.color}`,
      }}
    >
      {rankData.label}
    </div>
  );
};

export const getRankColor = (rank: string): string => {
  return RANK_COLORS[rank]?.color || "#6b7280";
};

export default RankBadge;
