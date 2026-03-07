import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SplashScreenProps {
  onEnter: () => void;
}

const CORNER_DECORATIONS = [
  { pos: "top-4 left-4", d: "M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" },
  { pos: "top-4 right-4", d: "M32 0 L20 0 L20 2 L30 2 L30 12 L32 12 Z" },
  { pos: "bottom-4 left-4", d: "M0 32 L12 32 L12 30 L2 30 L2 20 L0 20 Z" },
  { pos: "bottom-4 right-4", d: "M32 32 L20 32 L20 30 L30 30 L30 20 L32 20 Z" },
] as const;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const { login, loginStatus, isLoggingIn, identity } = useInternetIdentity();
  const [phase, setPhase] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("ready"), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (identity) {
      onEnter();
    }
  }, [identity, onEnter]);

  const handleEnter = async () => {
    if (!identity) {
      await login();
    } else {
      onEnter();
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0a0a0f" }}
      data-ocid="splash.panel"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/assets/generated/solo-leveling-splash.dim_800x600.jpg')`,
          opacity: 0.35,
        }}
      />

      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, rgba(0,0,0,0.85) 70%)",
        }}
      />

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)",
        }}
      />

      {/* Geometric corner decorations */}
      {CORNER_DECORATIONS.map(({ pos, d }) => (
        <div key={pos} className={`absolute ${pos} w-8 h-8 opacity-60`}>
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d={d} fill="#00d4ff" />
          </svg>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: "#00d4ff",
                    borderTopColor: "transparent",
                  }}
                />
                <div
                  className="absolute inset-2 rounded-full border border-t-transparent animate-spin"
                  style={{
                    borderColor: "#8b5cf6",
                    borderTopColor: "transparent",
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                />
              </div>
              <p
                className="text-xs font-mono tracking-[0.4em] uppercase"
                style={{ color: "#00d4ff" }}
              >
                SYSTEM INITIALIZING...
              </p>
            </motion.div>
          )}

          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              {/* System badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xs font-mono px-4 py-1.5 border rounded-sm tracking-widest uppercase"
                style={{
                  color: "#00d4ff",
                  borderColor: "#00d4ff",
                  boxShadow: "0 0 12px rgba(0,212,255,0.3)",
                  background: "rgba(0,212,255,0.05)",
                }}
              >
                ◆ SYSTEM AWAKENING ◆
              </motion.div>

              {/* Main title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h1
                  className="font-display text-6xl md:text-7xl font-black uppercase leading-none tracking-tight"
                  style={{
                    color: "#ffffff",
                    textShadow:
                      "0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(139,92,246,0.3)",
                  }}
                >
                  SOLO
                </h1>
                <h1
                  className="font-display text-6xl md:text-7xl font-black uppercase leading-none tracking-tight"
                  style={{
                    color: "#00d4ff",
                    textShadow:
                      "0 0 20px #00d4ff, 0 0 40px rgba(0,212,255,0.6)",
                  }}
                >
                  LEVEL UP
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-sm font-mono tracking-[0.3em] uppercase"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                I AM THE STRONGEST
              </motion.p>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="w-32 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #00d4ff, transparent)",
                }}
              />

              {/* Enter button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                <button
                  type="button"
                  onClick={handleEnter}
                  disabled={isLoggingIn}
                  data-ocid="splash.primary_button"
                  className="group relative px-10 py-3.5 font-display font-bold text-sm uppercase tracking-[0.25em] transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: "transparent",
                    color: "#00d4ff",
                    border: "1px solid #00d4ff",
                    boxShadow:
                      "0 0 12px rgba(0,212,255,0.3), inset 0 0 12px rgba(0,212,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,212,255,0.1)";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(0,212,255,0.6), inset 0 0 20px rgba(0,212,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(0,212,255,0.3), inset 0 0 12px rgba(0,212,255,0.05)";
                  }}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      CONNECTING...
                    </span>
                  ) : (
                    "◆ ENTER THE SYSTEM ◆"
                  )}
                </button>
              </motion.div>

              {loginStatus === "loginError" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono"
                  style={{ color: "#ef4444" }}
                >
                  [ERROR] Authentication failed. Try again.
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-xs font-mono tracking-widest"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                POWERED BY INTERNET COMPUTER
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SplashScreen;
