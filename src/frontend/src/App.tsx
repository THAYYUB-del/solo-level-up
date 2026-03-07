import { Toaster } from "@/components/ui/sonner";
import { LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import type { Screen } from "./components/Navigation";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AchievementsScreen } from "./screens/AchievementsScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { FocusScreen } from "./screens/FocusScreen";
import { MissionsScreen } from "./screens/MissionsScreen";
import { MoodScreen } from "./screens/MoodScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { StatsScreen } from "./screens/StatsScreen";

export default function App() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const [showApp, setShowApp] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");

  // If identity is restored from storage, skip splash
  useEffect(() => {
    if (identity && !isInitializing) {
      setShowApp(true);
    }
  }, [identity, isInitializing]);

  const handleEnter = () => {
    setShowApp(true);
  };

  const handleLogout = () => {
    clear();
    setShowApp(false);
    setActiveScreen("dashboard");
  };

  // Show initializing state briefly
  if (isInitializing) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: "#00d4ff", borderTopColor: "transparent" }}
          />
          <p
            className="text-xs font-mono tracking-[0.3em] uppercase"
            style={{ color: "#00d4ff" }}
          >
            SYSTEM LOADING...
          </p>
        </div>
      </div>
    );
  }

  if (!showApp) {
    return (
      <>
        <SplashScreen onEnter={handleEnter} />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "oklch(0.12 0.02 265)",
              border: "1px solid #00d4ff",
              color: "#00d4ff",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              letterSpacing: "0.05em",
              boxShadow: "0 0 20px rgba(0,212,255,0.2)",
            },
          }}
        />
      </>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen />;
      case "missions":
        return <MissionsScreen />;
      case "focus":
        return <FocusScreen />;
      case "achievements":
        return <AchievementsScreen />;
      case "stats":
        return <StatsScreen />;
      case "mood":
        return <MoodScreen />;
    }
  };

  return (
    <div
      className="flex flex-col h-dvh max-w-lg mx-auto relative overflow-hidden"
      style={{
        background: "oklch(0.08 0.012 265)",
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Top header bar */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b relative z-10"
        style={{
          background: "oklch(0.09 0.015 265 / 0.95)",
          borderColor: "oklch(0.20 0.035 265)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: "#00d4ff",
              boxShadow: "0 0 6px #00d4ff",
            }}
          />
          <span
            className="font-display font-black text-sm uppercase tracking-[0.2em]"
            style={{ color: "#00d4ff" }}
          >
            SOLO LEVEL UP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground hidden sm:block">
            {identity?.getPrincipal().toString().slice(0, 8)}...
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-all duration-150"
            title="Logout"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {renderScreen()}
      </main>

      {/* Bottom navigation */}
      <Navigation activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Footer */}
      <div
        className="flex-shrink-0 py-1.5 text-center border-t"
        style={{
          background: "oklch(0.08 0.012 265)",
          borderColor: "oklch(0.16 0.025 265)",
        }}
      >
        <p
          className="text-xs font-mono"
          style={{
            color: "oklch(0.32 0.03 265)",
            fontSize: "9px",
            letterSpacing: "0.05em",
          }}
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "oklch(0.40 0.04 240)" }}
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.02 265)",
            border: "1px solid #00d4ff",
            color: "#00d4ff",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            letterSpacing: "0.05em",
            boxShadow: "0 0 20px rgba(0,212,255,0.2)",
          },
        }}
      />
    </div>
  );
}
