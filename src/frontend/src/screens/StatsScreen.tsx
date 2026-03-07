import {
  CheckSquare,
  Clock,
  Flame,
  Shield,
  Smile,
  Star,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { RankBadge } from "../components/RankBadge";
import { XPBar } from "../components/XPBar";
import { useProfile, useStats } from "../hooks/useQueries";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="rounded-sm p-3 flex flex-col gap-2"
    data-ocid="stats.card"
    style={{
      background: "oklch(0.11 0.018 265)",
      border: "1px solid oklch(0.20 0.035 265)",
    }}
  >
    <div
      className="w-8 h-8 rounded-sm flex items-center justify-center"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}35`,
        color,
      }}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider leading-tight mb-0.5">
        {label}
      </p>
      <p
        className="font-display font-black text-2xl leading-none"
        style={{ color, textShadow: `0 0 8px ${color}50` }}
      >
        {value}
      </p>
    </div>
  </motion.div>
);

const MOOD_LABELS: Record<number, string> = {
  1: "EXHAUSTED",
  2: "TIRED",
  3: "NEUTRAL",
  4: "FOCUSED",
  5: "PEAK",
};

export const StatsScreen: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isLoading = statsLoading || profileLoading;
  const currentLevel = Number(profile?.currentLevel ?? 1);
  const currentXP = Number(profile?.currentXP ?? 0);
  const rank = profile?.rank ?? "E";
  const moodAvg = Number(stats?.moodAverageLast7Days ?? 0);

  if (isLoading) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-6"
        data-ocid="stats.panel"
      >
        <div className="text-center space-y-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: "#00d4ff", borderTopColor: "transparent" }}
          />
          <p
            className="text-xs font-mono tracking-widest"
            style={{ color: "#00d4ff" }}
          >
            COMPILING REPORT...
          </p>
        </div>
      </div>
    );
  }

  const statCards: StatCardProps[] = [
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Total XP",
      value: Number(stats?.totalXP ?? 0).toLocaleString(),
      color: "#00d4ff",
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: "Level",
      value: currentLevel,
      color: "#8b5cf6",
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: "Rank",
      value: rank,
      color: "#eab308",
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Tasks Today",
      value: Number(stats?.tasksCompletedToday ?? 0),
      color: "#22c55e",
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      label: "This Week",
      value: Number(stats?.tasksCompletedThisWeek ?? 0),
      color: "#22c55e",
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Total Tasks",
      value: Number(stats?.totalTasks ?? 0),
      color: "#3b82f6",
    },
    {
      icon: <Timer className="w-4 h-4" />,
      label: "Focus Sessions",
      value: Number(stats?.totalFocusSessions ?? 0),
      color: "#8b5cf6",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Focus Minutes",
      value: Number(stats?.totalFocusMinutes ?? 0),
      color: "#8b5cf6",
    },
    {
      icon: <Flame className="w-4 h-4" />,
      label: "Streak",
      value: `${Number(stats?.currentStreak ?? 0)}d`,
      color: "#f97316",
    },
    {
      icon: <Smile className="w-4 h-4" />,
      label: "Mood Avg (7d)",
      value: moodAvg > 0 ? MOOD_LABELS[moodAvg] || `${moodAvg}/5` : "—",
      color: "#f97316",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto" data-ocid="stats.panel">
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-2">
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-muted-foreground">
            ◆ SYSTEM ANALYSIS ◆
          </p>
          <h2
            className="font-display text-2xl font-black uppercase tracking-wide"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 12px rgba(0,212,255,0.5)",
            }}
          >
            STATUS REPORT
          </h2>
        </div>

        {/* Rank + XP Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="system-panel rounded-sm p-4 flex items-center gap-4"
        >
          <RankBadge rank={rank} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-display text-2xl font-black text-foreground">
                LVL {currentLevel}
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase">
                RANK {rank}
              </span>
            </div>
            <XPBar currentXP={currentXP} currentLevel={currentLevel} animated />
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((card, idx) => (
            <StatCard key={card.label} {...card} delay={idx * 0.04} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-2"
        >
          <p className="text-xs font-mono text-muted-foreground tracking-widest">
            [SYSTEM] PERFORMANCE METRICS UPDATED IN REAL-TIME
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsScreen;
