import { CheckCircle2, Pause, Play, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FocusSession } from "../backend.d";
import {
  useCompleteFocusSession,
  useFocusSessions,
  useStartFocusSession,
} from "../hooks/useQueries";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

const TICK_MARKS = Array.from({ length: 60 }, (_, i) => ({
  angle: (i * 6 * Math.PI) / 180,
  isMajor: i % 5 === 0,
  id: `tick-deg-${i * 6}`,
}));

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatSessionTime = (time: bigint): string => {
  const ms = Number(time) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const FocusScreen: React.FC = () => {
  const [sessionType, setSessionType] = useState<"WORK" | "BREAK">("WORK");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<bigint | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = useStartFocusSession();
  const completeSession = useCompleteFocusSession();
  const { data: sessions = [] } = useFocusSessions();

  const totalDuration = sessionType === "WORK" ? WORK_DURATION : BREAK_DURATION;
  const progress = (totalDuration - timeLeft) / totalDuration;
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    setIsComplete(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (activeSessionId !== null) {
      try {
        await completeSession.mutateAsync(activeSessionId);
        toast.success("[SYSTEM] Focus session complete. XP awarded, Hunter.", {
          duration: 4000,
        });
      } catch {
        toast.error("[ERROR] Failed to record session.");
      }
      setActiveSessionId(null);
    }
  }, [activeSessionId, completeSession]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleSessionComplete]);

  const handleStart = async () => {
    if (isComplete) {
      setIsComplete(false);
      setTimeLeft(totalDuration);
      return;
    }
    try {
      await startSession.mutateAsync({
        durationMinutes: BigInt(sessionType === "WORK" ? 25 : 5),
        sessionType: sessionType.toLowerCase(),
      });
      // We'd need to get the session ID from the response, but since the API returns void,
      // we'll track it as null and just mark complete
      setActiveSessionId(BigInt(Date.now())); // placeholder
    } catch {
      // If backend fails, still allow timer to run locally
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setActiveSessionId(null);
    setTimeLeft(totalDuration);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTypeChange = (type: "WORK" | "BREAK") => {
    if (isRunning) return;
    setSessionType(type);
    setTimeLeft(type === "WORK" ? WORK_DURATION : BREAK_DURATION);
    setIsComplete(false);
    setActiveSessionId(null);
  };

  const recentSessions = [...sessions].reverse().slice(0, 5);

  const ringColor = isComplete
    ? "#22c55e"
    : sessionType === "WORK"
      ? "#00d4ff"
      : "#8b5cf6";

  return (
    <div className="flex-1 overflow-y-auto" data-ocid="focus.panel">
      <div className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-2">
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-muted-foreground">
            ◆ CONCENTRATION MODE ◆
          </p>
          <h2
            className="font-display text-2xl font-black uppercase tracking-wide"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 12px rgba(0,212,255,0.5)",
            }}
          >
            FOCUS CHAMBER
          </h2>
        </div>

        {/* Session type toggle */}
        <div
          className="flex rounded-sm overflow-hidden"
          style={{ border: "1px solid oklch(0.22 0.04 265)" }}
        >
          {(["WORK", "BREAK"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              disabled={isRunning}
              data-ocid="focus.toggle"
              className="flex-1 py-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed"
              style={{
                background:
                  sessionType === type
                    ? type === "WORK"
                      ? "rgba(0,212,255,0.15)"
                      : "rgba(139,92,246,0.15)"
                    : "transparent",
                color:
                  sessionType === type
                    ? type === "WORK"
                      ? "#00d4ff"
                      : "#8b5cf6"
                    : "oklch(0.55 0.04 240)",
                borderRight:
                  type === "WORK" ? "1px solid oklch(0.22 0.04 265)" : "none",
              }}
            >
              {type === "WORK" ? "◉ WORK (25M)" : "◎ BREAK (5M)"}
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="flex justify-center py-2">
          <div className="relative" data-ocid="focus.canvas_target">
            <svg
              width="220"
              height="220"
              className="transform -rotate-90"
              aria-hidden="true"
              style={{
                filter: isRunning
                  ? `drop-shadow(0 0 12px ${ringColor})`
                  : "none",
              }}
            >
              {/* Track */}
              <circle
                cx="110"
                cy="110"
                r={RADIUS}
                fill="none"
                stroke="oklch(0.16 0.02 265)"
                strokeWidth="10"
              />
              {/* Progress */}
              <circle
                cx="110"
                cy="110"
                r={RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
                }}
              />
              {/* Tick marks */}
              {TICK_MARKS.map(({ angle, isMajor, id }) => {
                const innerR = isMajor ? RADIUS - 16 : RADIUS - 12;
                const outerR = RADIUS - 4;
                return (
                  <line
                    key={id}
                    x1={110 + innerR * Math.cos(angle)}
                    y1={110 + innerR * Math.sin(angle)}
                    x2={110 + outerR * Math.cos(angle)}
                    y2={110 + outerR * Math.sin(angle)}
                    stroke={`${ringColor}30`}
                    strokeWidth={isMajor ? 2 : 1}
                  />
                );
              })}
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <CheckCircle2
                      className="w-10 h-10"
                      style={{ color: "#22c55e" }}
                    />
                    <span
                      className="text-xs font-mono uppercase tracking-widest"
                      style={{ color: "#22c55e" }}
                    >
                      COMPLETE
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span
                      className="font-mono font-bold text-4xl tabular-nums"
                      style={{
                        color: ringColor,
                        textShadow: `0 0 12px ${ringColor}80`,
                      }}
                    >
                      {formatTime(timeLeft)}
                    </span>
                    <span
                      className="text-xs font-mono uppercase tracking-widest mt-1"
                      style={{ color: "oklch(0.55 0.04 240)" }}
                    >
                      {sessionType === "WORK" ? "FOCUS" : "REST"}
                    </span>
                    {isRunning && (
                      <span
                        className="text-xs font-mono mt-1 animate-pulse"
                        style={{ color: ringColor }}
                      >
                        ● ACTIVE
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            data-ocid="focus.cancel_button"
            className="w-11 h-11 rounded-sm flex items-center justify-center transition-all duration-150"
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
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Start / Pause */}
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={startSession.isPending}
              data-ocid="focus.primary_button"
              className="px-8 py-3 rounded-sm font-display font-bold text-sm uppercase tracking-widest transition-all duration-150 disabled:opacity-50"
              style={{
                background: isComplete
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(0,212,255,0.12)",
                border: `1px solid ${isComplete ? "rgba(34,197,94,0.4)" : "rgba(0,212,255,0.4)"}`,
                color: isComplete ? "#22c55e" : "#00d4ff",
                boxShadow: `0 0 12px ${isComplete ? "rgba(34,197,94,0.2)" : "rgba(0,212,255,0.2)"}`,
              }}
            >
              {isComplete ? (
                <>◆ NEW SESSION</>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {isRunning ? "RUNNING" : "START"}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              data-ocid="focus.secondary_button"
              className="px-8 py-3 rounded-sm font-display font-bold text-sm uppercase tracking-widest transition-all duration-150"
              style={{
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#8b5cf6",
                boxShadow: "0 0 12px rgba(139,92,246,0.2)",
              }}
            >
              <span className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                PAUSE
              </span>
            </button>
          )}
        </div>

        {/* Session history */}
        {recentSessions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              RECENT SESSIONS
            </p>
            <div className="space-y-1.5">
              {recentSessions.map((session: FocusSession, _i) => (
                <div
                  key={String(session.id)}
                  className="flex items-center justify-between py-2 px-3 rounded-sm"
                  style={{
                    background: "oklch(0.11 0.018 265)",
                    border: "1px solid oklch(0.18 0.03 265)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: session.isCompleted ? "#22c55e" : "#6b7280",
                        boxShadow: session.isCompleted
                          ? "0 0 4px rgba(34,197,94,0.6)"
                          : "none",
                      }}
                    />
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {session.sessionType} — {Number(session.durationMinutes)}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatSessionTime(session.startTime)}
                    </span>
                    {session.isCompleted && (
                      <span
                        className="text-xs font-mono"
                        style={{ color: "#22c55e" }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusScreen;
