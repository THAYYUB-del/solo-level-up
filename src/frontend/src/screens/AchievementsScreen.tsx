import { Flame, Lock, Star, Target, Timer, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import type { Achievement } from "../backend.d";
import {
  useAchievements,
  useUnlockedAchievementsCount,
} from "../hooks/useQueries";

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  quest_complete: <Target className="w-5 h-5" />,
  focus_session: <Timer className="w-5 h-5" />,
  xp_earned: <Zap className="w-5 h-5" />,
  streak: <Flame className="w-5 h-5" />,
  level_up: <Star className="w-5 h-5" />,
  default: <Trophy className="w-5 h-5" />,
};

const getAchievementIcon = (conditionType: string): React.ReactNode => {
  for (const key of Object.keys(ACHIEVEMENT_ICONS)) {
    if (conditionType.toLowerCase().includes(key)) {
      return ACHIEVEMENT_ICONS[key];
    }
  }
  return ACHIEVEMENT_ICONS.default;
};

const AchievementCard: React.FC<{
  achievement: Achievement;
  index: number;
}> = ({ achievement, index }) => {
  const isUnlocked = achievement.isUnlocked;
  const icon = getAchievementIcon(achievement.conditionType);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-sm p-3 flex flex-col gap-2.5 relative overflow-hidden"
      data-ocid={`achievements.item.${index}`}
      style={{
        background: isUnlocked
          ? "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(139,92,246,0.06))"
          : "oklch(0.11 0.018 265)",
        border: `1px solid ${isUnlocked ? "rgba(234,179,8,0.3)" : "oklch(0.18 0.03 265)"}`,
        boxShadow: isUnlocked ? "0 0 12px rgba(234,179,8,0.1)" : "none",
        opacity: isUnlocked ? 1 : 0.6,
      }}
    >
      {/* Glow effect for unlocked */}
      {isUnlocked && (
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #eab308, transparent 70%)",
          }}
        />
      )}

      {/* Icon */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{
            background: isUnlocked
              ? "rgba(234,179,8,0.12)"
              : "rgba(107,114,128,0.1)",
            border: `1px solid ${isUnlocked ? "rgba(234,179,8,0.3)" : "rgba(107,114,128,0.2)"}`,
            color: isUnlocked ? "#eab308" : "#6b7280",
          }}
        >
          {isUnlocked ? icon : <Lock className="w-4 h-4" />}
        </div>
        <div
          className="text-xs font-mono px-1.5 py-0.5 rounded-sm"
          style={{
            background: isUnlocked
              ? "rgba(234,179,8,0.12)"
              : "rgba(107,114,128,0.1)",
            color: isUnlocked ? "#eab308" : "#6b7280",
            border: `1px solid ${isUnlocked ? "rgba(234,179,8,0.25)" : "rgba(107,114,128,0.2)"}`,
          }}
        >
          +{Number(achievement.xpReward)} XP
        </div>
      </div>

      {/* Info */}
      <div>
        <p
          className="text-sm font-display font-bold uppercase leading-tight mb-0.5"
          style={{ color: isUnlocked ? "#eab308" : "oklch(0.55 0.04 240)" }}
        >
          {achievement.title}
        </p>
        <p className="text-xs font-mono text-muted-foreground leading-relaxed">
          {achievement.description}
        </p>
      </div>

      {/* Unlocked indicator */}
      {isUnlocked && (
        <div
          className="text-xs font-mono flex items-center gap-1"
          style={{ color: "#22c55e" }}
        >
          <span>✓</span>
          <span>ACHIEVEMENT UNLOCKED</span>
        </div>
      )}
    </motion.div>
  );
};

// Default achievements to show if none are loaded
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: BigInt(1),
    title: "FIRST STEP",
    description: "Complete your first quest.",
    xpReward: BigInt(100),
    conditionType: "quest_complete_1",
    isUnlocked: false,
  },
  {
    id: BigInt(2),
    title: "FOCUSED MIND",
    description: "Complete 5 focus sessions.",
    xpReward: BigInt(200),
    conditionType: "focus_session_5",
    isUnlocked: false,
  },
  {
    id: BigInt(3),
    title: "RISING HUNTER",
    description: "Reach Level 5.",
    xpReward: BigInt(500),
    conditionType: "level_up_5",
    isUnlocked: false,
  },
  {
    id: BigInt(4),
    title: "STREAK WARRIOR",
    description: "Maintain a 7-day streak.",
    xpReward: BigInt(750),
    conditionType: "streak_7",
    isUnlocked: false,
  },
  {
    id: BigInt(5),
    title: "XP HUNTER",
    description: "Earn 1,000 total XP.",
    xpReward: BigInt(300),
    conditionType: "xp_earned_1000",
    isUnlocked: false,
  },
  {
    id: BigInt(6),
    title: "APEX PREDATOR",
    description: "Complete 10 S-rank quests.",
    xpReward: BigInt(2000),
    conditionType: "quest_complete_s_10",
    isUnlocked: false,
  },
];

export const AchievementsScreen: React.FC = () => {
  const { data: achievements = [], isLoading } = useAchievements();
  const { data: unlockedCount = BigInt(0) } = useUnlockedAchievementsCount();

  const displayAchievements =
    achievements.length > 0 ? achievements : DEFAULT_ACHIEVEMENTS;
  const totalUnlocked = Number(unlockedCount);

  return (
    <div className="flex-1 overflow-y-auto" data-ocid="achievements.panel">
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-2">
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-muted-foreground">
            ◆ HALL OF GLORY ◆
          </p>
          <h2
            className="font-display text-2xl font-black uppercase tracking-wide"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 12px rgba(0,212,255,0.5)",
            }}
          >
            ACHIEVEMENTS
          </h2>
        </div>

        {/* Unlocked count banner */}
        <div
          className="rounded-sm p-3 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(234,179,8,0.08), rgba(139,92,246,0.06))",
            border: "1px solid rgba(234,179,8,0.25)",
          }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: "#eab308" }} />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              UNLOCKED
            </span>
          </div>
          <span
            className="font-display font-black text-xl"
            style={{
              color: "#eab308",
              textShadow: "0 0 8px rgba(234,179,8,0.4)",
            }}
          >
            {totalUnlocked} / {displayAchievements.length}
          </span>
        </div>

        {/* Achievement grid */}
        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#00d4ff", borderTopColor: "transparent" }}
            />
          </div>
        ) : displayAchievements.length === 0 ? (
          <div
            className="py-12 flex flex-col items-center gap-3 text-center"
            data-ocid="achievements.empty_state"
          >
            <Trophy className="w-10 h-10 opacity-20" />
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              [SYSTEM] No achievements registered.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {displayAchievements.map((achievement, idx) => (
              <AchievementCard
                key={String(achievement.id)}
                achievement={achievement}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsScreen;
