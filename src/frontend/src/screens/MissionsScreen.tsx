import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Plus, Swords, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Quest } from "../backend.d";
import { RankBadge, getRankColor } from "../components/RankBadge";
import {
  useCompleteQuest,
  useCreateQuest,
  useDeleteQuest,
  useQuests,
} from "../hooks/useQueries";

const RANK_XP: Record<string, number> = {
  E: 50,
  D: 100,
  C: 200,
  B: 350,
  A: 500,
  S: 750,
};

const RANK_OPTIONS = ["E", "D", "C", "B", "A", "S"];

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

const QuestRow: React.FC<{
  quest: Quest;
  index: number;
  onComplete: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  isCompletingId: bigint | null;
  isDeletingId: bigint | null;
}> = ({ quest, index, onComplete, onDelete, isCompletingId, isDeletingId }) => {
  const rankColor = getRankColor(quest.rank);
  const isCompleting = isCompletingId === quest.id;
  const isDeleting = isDeletingId === quest.id;

  const ocidSuffix = `.${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      className="quest-card rounded-sm p-3"
      data-ocid={`missions.item${ocidSuffix}`}
    >
      <div className="flex items-center gap-3">
        {/* Rank badge */}
        <RankBadge rank={quest.rank} size="sm" />

        {/* Quest info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-display font-semibold leading-tight ${
              quest.isCompleted ? "line-through opacity-50" : ""
            }`}
          >
            {quest.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono" style={{ color: rankColor }}>
              +{Number(quest.xpReward)} XP
            </span>
            {quest.isCompleted && quest.completedAt && (
              <span className="text-xs text-muted-foreground font-mono">
                {formatTimestamp(quest.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!quest.isCompleted && (
            <button
              type="button"
              onClick={() => onComplete(quest.id)}
              disabled={isCompleting}
              data-ocid={`missions.confirm_button${ocidSuffix}`}
              className="w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-150 disabled:opacity-50"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(34,197,94,0.2)";
                e.currentTarget.style.boxShadow = "0 0 6px rgba(34,197,94,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="Complete Quest"
            >
              {isCompleting ? (
                <div className="w-3 h-3 border border-t-transparent border-current rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(quest.id)}
            disabled={isDeleting}
            data-ocid={`missions.delete_button${ocidSuffix}`}
            className="w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-150 disabled:opacity-50"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              e.currentTarget.style.boxShadow = "0 0 6px rgba(239,68,68,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="Delete Quest"
          >
            {isDeleting ? (
              <div className="w-3 h-3 border border-t-transparent border-current rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const MissionsScreen: React.FC = () => {
  const { data: quests = [], isLoading } = useQuests();
  const createQuest = useCreateQuest();
  const completeQuest = useCompleteQuest();
  const deleteQuest = useDeleteQuest();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questTitle, setQuestTitle] = useState("");
  const [questRank, setQuestRank] = useState("E");
  const [completingId, setCompletingId] = useState<bigint | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const activeQuests = quests.filter((q) => !q.isCompleted);
  const completedQuests = quests.filter((q) => q.isCompleted);

  const handleCreateQuest = async () => {
    if (!questTitle.trim()) return;
    try {
      await createQuest.mutateAsync({
        title: questTitle.trim(),
        rank: questRank,
        xpReward: BigInt(RANK_XP[questRank] || 50),
      });
      toast.success(`[SYSTEM] Quest "${questTitle}" has been registered.`);
      setQuestTitle("");
      setQuestRank("E");
      setIsDialogOpen(false);
    } catch {
      toast.error("[ERROR] Failed to create quest.");
    }
  };

  const handleComplete = async (id: bigint) => {
    setCompletingId(id);
    try {
      await completeQuest.mutateAsync(id);
      toast.success("[SYSTEM] Quest complete. XP awarded, Hunter.");
    } catch {
      toast.error("[ERROR] Failed to complete quest.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteQuest.mutateAsync(id);
      toast.success("[SYSTEM] Quest removed from the board.");
    } catch {
      toast.error("[ERROR] Failed to delete quest.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-mono tracking-[0.4em] uppercase text-muted-foreground">
              ◆ GUILD BOARD ◆
            </p>
            <h2
              className="font-display text-2xl font-black uppercase tracking-wide"
              style={{
                color: "#00d4ff",
                textShadow: "0 0 12px rgba(0,212,255,0.5)",
              }}
            >
              QUEST BOARD
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            data-ocid="missions.open_modal_button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-display font-bold uppercase tracking-wider transition-all duration-150"
            style={{
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.4)",
              color: "#00d4ff",
              boxShadow: "0 0 8px rgba(0,212,255,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,212,255,0.2)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(0,212,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,212,255,0.1)";
              e.currentTarget.style.boxShadow = "0 0 8px rgba(0,212,255,0.15)";
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            ADD QUEST
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList
            className="w-full rounded-sm p-0.5 h-auto"
            style={{
              background: "oklch(0.11 0.018 265)",
              border: "1px solid oklch(0.22 0.04 265)",
            }}
          >
            {(["all", "active", "completed"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                data-ocid="missions.tab"
                className="flex-1 text-xs font-mono uppercase tracking-wider rounded-sm py-2 data-[state=active]:text-foreground"
                style={{
                  color: "oklch(0.55 0.04 240)",
                }}
              >
                {tab === "all"
                  ? `ALL (${quests.length})`
                  : tab === "active"
                    ? `ACTIVE (${activeQuests.length})`
                    : `DONE (${completedQuests.length})`}
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", "active", "completed"].map((tabValue) => {
            const displayQuests =
              tabValue === "all"
                ? quests
                : tabValue === "active"
                  ? activeQuests
                  : completedQuests;

            return (
              <TabsContent
                key={tabValue}
                value={tabValue}
                className="mt-3 space-y-2"
              >
                {isLoading ? (
                  <div className="py-8 flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: "#00d4ff",
                        borderTopColor: "transparent",
                      }}
                    />
                  </div>
                ) : displayQuests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 flex flex-col items-center gap-3 text-center"
                    data-ocid="missions.empty_state"
                  >
                    <Swords className="w-10 h-10 opacity-20" />
                    <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                      [SYSTEM] No quests registered.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The guild board awaits your first quest.
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {displayQuests.map((quest, idx) => (
                      <QuestRow
                        key={String(quest.id)}
                        quest={quest}
                        index={idx + 1}
                        onComplete={handleComplete}
                        onDelete={handleDelete}
                        isCompletingId={completingId}
                        isDeletingId={deletingId}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Add Quest Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="rounded-sm max-w-sm border"
          style={{
            background: "oklch(0.10 0.018 265)",
            borderColor: "#00d4ff",
            boxShadow: "0 0 20px rgba(0,212,255,0.2)",
          }}
          data-ocid="missions.dialog"
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: "#00d4ff" }} />
              <DialogTitle
                className="font-display text-base uppercase tracking-widest"
                style={{ color: "#00d4ff" }}
              >
                REGISTER QUEST
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                QUEST NAME
              </Label>
              <Input
                value={questTitle}
                onChange={(e) => setQuestTitle(e.target.value)}
                placeholder="Enter quest objective..."
                data-ocid="missions.input"
                onKeyDown={(e) => e.key === "Enter" && handleCreateQuest()}
                className="rounded-sm font-mono text-sm"
                style={{
                  background: "oklch(0.13 0.02 265)",
                  borderColor: "oklch(0.22 0.04 265)",
                  color: "oklch(0.92 0.02 240)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                QUEST RANK
              </Label>
              <Select value={questRank} onValueChange={setQuestRank}>
                <SelectTrigger
                  data-ocid="missions.select"
                  className="rounded-sm font-mono text-sm"
                  style={{
                    background: "oklch(0.13 0.02 265)",
                    borderColor: "oklch(0.22 0.04 265)",
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: "oklch(0.12 0.02 265)",
                    borderColor: "oklch(0.22 0.04 265)",
                  }}
                >
                  {RANK_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="font-mono">
                      <span style={{ color: getRankColor(r) }}>
                        [{r}] {RANK_XP[r]} XP
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="rounded-sm p-2.5 text-xs font-mono"
              style={{
                background: "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "#00d4ff",
              }}
            >
              XP REWARD: +{RANK_XP[questRank]} XP (RANK {questRank})
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              data-ocid="missions.cancel_button"
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all duration-150"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#ef4444",
              }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleCreateQuest}
              disabled={!questTitle.trim() || createQuest.isPending}
              data-ocid="missions.submit_button"
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all duration-150 disabled:opacity-50"
              style={{
                background: "rgba(0,212,255,0.12)",
                border: "1px solid rgba(0,212,255,0.4)",
                color: "#00d4ff",
                boxShadow: "0 0 8px rgba(0,212,255,0.15)",
              }}
            >
              {createQuest.isPending ? "REGISTERING..." : "REGISTER"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissionsScreen;
