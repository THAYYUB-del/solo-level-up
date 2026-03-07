import {
  BarChart2,
  Heart,
  LayoutDashboard,
  Swords,
  Timer,
  Trophy,
} from "lucide-react";
import type React from "react";

type Screen =
  | "dashboard"
  | "missions"
  | "focus"
  | "achievements"
  | "stats"
  | "mood";

interface NavItem {
  id: Screen;
  icon: React.ReactNode;
  label: string;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "HOME",
    ocid: "nav.dashboard.tab",
  },
  {
    id: "missions",
    icon: <Swords className="w-5 h-5" />,
    label: "QUESTS",
    ocid: "nav.missions.tab",
  },
  {
    id: "focus",
    icon: <Timer className="w-5 h-5" />,
    label: "FOCUS",
    ocid: "nav.focus.tab",
  },
  {
    id: "achievements",
    icon: <Trophy className="w-5 h-5" />,
    label: "TROPHIES",
    ocid: "nav.achievements.tab",
  },
  {
    id: "stats",
    icon: <BarChart2 className="w-5 h-5" />,
    label: "STATS",
    ocid: "nav.stats.tab",
  },
  {
    id: "mood",
    icon: <Heart className="w-5 h-5" />,
    label: "MOOD",
    ocid: "nav.mood.tab",
  },
];

interface NavigationProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onNavigate,
}) => {
  return (
    <nav
      className="flex-shrink-0 border-t"
      style={{
        background: "oklch(0.09 0.015 265)",
        borderColor: "oklch(0.20 0.035 265)",
      }}
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              data-ocid={item.ocid}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 relative overflow-hidden"
              style={{
                color: isActive ? "#00d4ff" : "oklch(0.45 0.04 240)",
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
                    boxShadow: "0 0 8px rgba(0,212,255,0.8)",
                  }}
                />
              )}

              {/* Icon with glow */}
              <div
                style={{
                  filter: isActive ? "drop-shadow(0 0 4px #00d4ff)" : "none",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
              >
                {item.icon}
              </div>

              {/* Label */}
              <span
                className="font-mono uppercase leading-none"
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.1em",
                  color: isActive ? "#00d4ff" : "oklch(0.40 0.04 240)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
export type { Screen };
