import type React from "react";
import { useEffect, useState } from "react";

interface XPBarProps {
  currentXP: number;
  currentLevel: number;
  animated?: boolean;
}

function getXPForNextLevel(level: number): number {
  return level * 500 + 500;
}

function getXPForCurrentLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 500 + 500;
  }
  return total;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  currentLevel,
  animated = true,
}) => {
  const xpForCurrentLevel = getXPForCurrentLevel(currentLevel);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const percentFill = Math.min(
    100,
    Math.max(0, (xpInCurrentLevel / xpForNextLevel) * 100),
  );

  const [displayWidth, setDisplayWidth] = useState(animated ? 0 : percentFill);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayWidth(percentFill), 200);
      return () => clearTimeout(timer);
    }
    setDisplayWidth(percentFill);
  }, [percentFill, animated]);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          EXPERIENCE
        </span>
        <span className="text-xs font-mono" style={{ color: "#00d4ff" }}>
          {xpInCurrentLevel.toLocaleString()} /{" "}
          {xpForNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{
          background: "oklch(0.14 0.02 265)",
          border: "1px solid oklch(0.22 0.04 265)",
        }}
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 8px, oklch(0.18 0.02 265) 8px, oklch(0.18 0.02 265) 9px)",
          }}
        />
        {/* XP Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${displayWidth}%`,
            background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
            boxShadow: "0 0 8px #00d4ff, 0 0 16px rgba(0, 212, 255, 0.4)",
            transition: animated
              ? "width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "none",
          }}
        />
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />
      </div>
      <div className="text-center text-xs font-mono text-muted-foreground">
        LVL {currentLevel} → LVL {currentLevel + 1}
      </div>
    </div>
  );
};

export default XPBar;
