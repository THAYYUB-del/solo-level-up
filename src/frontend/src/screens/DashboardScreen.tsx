import { Flame, Medal, Timer, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { RankBadge } from "../components/RankBadge";
import { SystemMessage } from "../components/SystemMessage";
import { XPBar } from "../components/XPBar";
import { useActiveQuests, useProfile, useStats } from "../hooks/useQueries";

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}> = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="quest-card rounded-sm p-3 flex items-center gap-3"
    data-ocid="dashboard.card"
  >
    <div
      className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      <div style={{ color }}>{icon}</div>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="text-lg font-display font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  </motion.div>
);

export const DashboardScreen: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: activeQuests } = useActiveQuests();

  const currentLevel = Number(profile?.currentLevel ?? 1);
  const currentXP = Number(profile?.currentXP ?? 0);
  const rank = profile?.rank ?? "E";
  const activeQuestCount = activeQuests?.length ?? 0;

  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-6"
        data-ocid="dashboard.panel"
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
            LOADING SYSTEM DATA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" data-ocid="dashboard.panel">
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-2"
        >
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-muted-foreground mb-1">
            STATUS WINDOW
          </p>
          <h2
            className="font-display text-2xl font-black uppercase tracking-wide"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 12px rgba(0,212,255,0.5)",
            }}
          >
            HUNTER PROFILE
          </h2>
        </motion.div>

        {/* Rank + XP section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="system-panel rounded-sm p-4 space-y-4"
        >
          <div className="flex items-center gap-4">
            <RankBadge rank={rank} size="xl" animate />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display text-3xl font-black text-foreground">
                  LVL {currentLevel}
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  HUNTER
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-3">
                RANK {rank} CLASS
              </p>
              <XPBar
                currentXP={currentXP}
                currentLevel={currentLevel}
                animated
              />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            icon={<Medal className="w-4 h-4" />}
            label="Active Quests"
            value={activeQuestCount}
            color="#00d4ff"
            delay={0.15}
          />
          <StatCard
            icon={<Zap className="w-4 h-4" />}
            label="Completed Today"
            value={Number(stats?.tasksCompletedToday ?? 0)}
            color="#22c55e"
            delay={0.2}
          />
          <StatCard
            icon={<Timer className="w-4 h-4" />}
            label="Focus Sessions"
            value={Number(stats?.totalFocusSessions ?? 0)}
            color="#8b5cf6"
            delay={0.25}
          />
          <StatCard
            icon={<Flame className="w-4 h-4" />}
            label="Day Streak"
            value={`${Number(stats?.currentStreak ?? 0)}d`}
            color="#f97316"
            delay={0.3}
          />
        </div>

        {/* Total XP banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-sm p-3 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(0,212,255,0.08))",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
          data-ocid="dashboard.card"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#8b5cf6" }} />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              TOTAL XP EARNED
            </span>
          </div>
          <span
            className="font-display font-black text-xl"
            style={{
              color: "#8b5cf6",
              textShadow: "0 0 8px rgba(139,92,246,0.5)",
            }}
          >
            {Number(stats?.totalXP ?? 0).toLocaleString()}
          </span>
        </motion.div>

        {/* System message */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SystemMessage
            activeQuestCount={activeQuestCount}
            level={currentLevel}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardScreen;
