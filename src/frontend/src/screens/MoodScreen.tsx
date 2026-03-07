import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { MoodEntry } from "../backend.d";
import { useAddMoodEntry, useMoodLogs } from "../hooks/useQueries";

const MOODS = [
  {
    level: 1,
    emoji: "😴",
    label: "EXHAUSTED",
    color: "#6b7280",
    description: "Running on empty",
  },
  {
    level: 2,
    emoji: "😔",
    label: "TIRED",
    color: "#3b82f6",
    description: "Low on stamina",
  },
  {
    level: 3,
    emoji: "😐",
    label: "NEUTRAL",
    color: "#8b5cf6",
    description: "Steady state",
  },
  {
    level: 4,
    emoji: "😤",
    label: "FOCUSED",
    color: "#f97316",
    description: "In the zone",
  },
  {
    level: 5,
    emoji: "🔥",
    label: "PEAK",
    color: "#eab308",
    description: "Maximum power",
  },
];

const formatTimestamp = (time: bigint): string => {
  const ms = Number(time) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MoodLogItem: React.FC<{ entry: MoodEntry; index: number }> = ({
  entry,
  index,
}) => {
  const mood =
    MOODS.find((m) => m.level === Number(entry.moodLevel)) || MOODS[2];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-sm"
      data-ocid={`mood.item.${index}`}
      style={{
        background: "oklch(0.11 0.018 265)",
        border: "1px solid oklch(0.18 0.03 265)",
      }}
    >
      <span className="text-xl">{mood.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-display font-bold uppercase tracking-wider"
            style={{ color: mood.color }}
          >
            {entry.moodLabel || mood.label}
          </span>
        </div>
        {entry.note && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
            {entry.note}
          </p>
        )}
      </div>
      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
        {formatTimestamp(entry.timestamp)}
      </span>
    </motion.div>
  );
};

export const MoodScreen: React.FC = () => {
  const { data: moodLogs = [], isLoading } = useMoodLogs();
  const addMood = useAddMoodEntry();

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("[SYSTEM] Select a mood level first.");
      return;
    }
    const mood = MOODS.find((m) => m.level === selectedMood)!;
    try {
      await addMood.mutateAsync({
        moodLevel: BigInt(selectedMood),
        moodLabel: mood.label,
        note: note.trim() || null,
      });
      toast.success(
        "[SYSTEM] Mood logged. The System acknowledges your state.",
      );
      setSelectedMood(null);
      setNote("");
    } catch {
      toast.error("[ERROR] Failed to log mood.");
    }
  };

  const recentLogs = [...moodLogs].reverse().slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto" data-ocid="mood.panel">
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-2">
          <p className="text-xs font-mono tracking-[0.4em] uppercase text-muted-foreground">
            ◆ MENTAL STATUS ◆
          </p>
          <h2
            className="font-display text-2xl font-black uppercase tracking-wide"
            style={{
              color: "#00d4ff",
              textShadow: "0 0 12px rgba(0,212,255,0.5)",
            }}
          >
            MOOD TRACKER
          </h2>
        </div>

        {/* Mood selector */}
        <div className="system-panel rounded-sm p-4 space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            CURRENT STATUS
          </p>

          <div className="flex gap-2 justify-between" data-ocid="mood.toggle">
            {MOODS.map((mood) => (
              <button
                key={mood.level}
                type="button"
                onClick={() => setSelectedMood(mood.level)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm transition-all duration-200"
                style={{
                  background:
                    selectedMood === mood.level
                      ? `${mood.color}18`
                      : "oklch(0.13 0.02 265)",
                  border: `1px solid ${
                    selectedMood === mood.level
                      ? `${mood.color}60`
                      : "oklch(0.20 0.03 265)"
                  }`,
                  boxShadow:
                    selectedMood === mood.level
                      ? `0 0 10px ${mood.color}25`
                      : "none",
                  transform:
                    selectedMood === mood.level ? "scale(1.04)" : "scale(1)",
                }}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span
                  className="text-xs font-mono uppercase leading-none"
                  style={{
                    color:
                      selectedMood === mood.level
                        ? mood.color
                        : "oklch(0.45 0.04 240)",
                    fontSize: "9px",
                  }}
                >
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          {/* Selected mood display */}
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-center py-1"
            >
              <p
                className="text-sm font-display font-bold uppercase tracking-wider"
                style={{
                  color: MOODS.find((m) => m.level === selectedMood)?.color,
                }}
              >
                {MOODS.find((m) => m.level === selectedMood)?.description}
              </p>
            </motion.div>
          )}

          {/* Note */}
          <div className="space-y-1.5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              NOTE (OPTIONAL)
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a status note..."
              rows={2}
              data-ocid="mood.textarea"
              className="w-full resize-none rounded-sm p-2.5 text-sm font-mono outline-none focus:ring-1"
              style={{
                background: "oklch(0.13 0.02 265)",
                border: "1px solid oklch(0.22 0.04 265)",
                color: "oklch(0.85 0.02 240)",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMood || addMood.isPending}
            data-ocid="mood.submit_button"
            className="w-full py-3 rounded-sm font-display font-bold text-sm uppercase tracking-widest transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedMood
                ? "rgba(0,212,255,0.12)"
                : "rgba(107,114,128,0.08)",
              border: `1px solid ${selectedMood ? "rgba(0,212,255,0.4)" : "rgba(107,114,128,0.2)"}`,
              color: selectedMood ? "#00d4ff" : "#6b7280",
              boxShadow: selectedMood
                ? "0 0 10px rgba(0,212,255,0.15)"
                : "none",
            }}
          >
            {addMood.isPending ? "LOGGING..." : "◆ LOG STATUS"}
          </button>
        </div>

        {/* Mood history */}
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            STATUS HISTORY
          </p>

          {isLoading ? (
            <div className="py-6 flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "#00d4ff",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                [SYSTEM] No status logs recorded.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentLogs.map((entry, idx) => (
                <MoodLogItem
                  key={String(entry.timestamp)}
                  entry={entry}
                  index={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodScreen;
