import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";

const SYSTEM_MESSAGES = [
  "You have been chosen by the System. Rise, Hunter.",
  "Only the weak rest. The strong forge their destiny.",
  "Complete your quests. Power awaits those who persist.",
  "The gate is open. Will you enter, or remain weak?",
  "Your potential is limitless. Prove it.",
  "Every completed quest brings you closer to the apex.",
  "The System observes your every action. Do not disappoint.",
  "Hunter, your rank is not your limit — it is your starting point.",
  "Focus your mind. Scatter your thoughts and you scatter your power.",
  "The strongest arose from the weakest. Begin your ascent.",
  "Consistent effort compounds into extraordinary power.",
  "You are the main character of your own story. Act accordingly.",
];

interface SystemMessageProps {
  customMessage?: string;
  activeQuestCount?: number;
  level?: number;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  customMessage,
  activeQuestCount,
  level,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const messages =
    activeQuestCount !== undefined && level !== undefined
      ? [
          `[SYSTEM] You have ${activeQuestCount} active quest${activeQuestCount !== 1 ? "s" : ""}. Rise, Hunter.`,
          `[SYSTEM] Current Level: ${level}. Keep pushing your limits.`,
          ...SYSTEM_MESSAGES.map((m) => `[SYSTEM] ${m}`),
        ]
      : SYSTEM_MESSAGES.map((m) => `[SYSTEM] ${m}`);

  const displayMessages = customMessage ? [customMessage] : messages;

  useEffect(() => {
    if (displayMessages.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % displayMessages.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayMessages.length]);

  return (
    <div
      className="system-panel rounded-sm p-3 relative overflow-hidden"
      style={{ minHeight: "48px" }}
    >
      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-3 h-3"
        style={{
          borderTop: "2px solid #00d4ff",
          borderLeft: "2px solid #00d4ff",
        }}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3"
        style={{
          borderTop: "2px solid #00d4ff",
          borderRight: "2px solid #00d4ff",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3"
        style={{
          borderBottom: "2px solid #00d4ff",
          borderLeft: "2px solid #00d4ff",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3"
        style={{
          borderBottom: "2px solid #00d4ff",
          borderRight: "2px solid #00d4ff",
        }}
      />

      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-mono tracking-wide leading-relaxed"
            style={{ color: "#00d4ff" }}
          >
            {displayMessages[messageIndex]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemMessage;
