import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Achievement,
  FocusSession,
  MoodEntry,
  Profile,
  Quest,
  Stats,
} from "../backend.d";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuests() {
  const { actor, isFetching } = useActor();
  return useQuery<Quest[]>({
    queryKey: ["quests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listQuests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveQuests() {
  const { actor, isFetching } = useActor();
  return useQuery<Quest[]>({
    queryKey: ["quests", "active"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveQuests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAchievements() {
  const { actor, isFetching } = useActor();
  return useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAchievements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMoodLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<MoodEntry[]>({
    queryKey: ["mood"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMoodLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFocusSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<FocusSession[]>({
    queryKey: ["focusSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFocusSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnlockedAchievementsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["achievementsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnlockedAchievementsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useCreateQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      rank,
      xpReward,
    }: {
      title: string;
      rank: string;
      xpReward: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.createQuest(title, rank, xpReward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}

export function useCompleteQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.completeQuest(questId);
      await actor.checkAndUnlockAchievements();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["achievementsCount"] });
    },
  });
}

export function useDeleteQuest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteQuest(questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
    },
  });
}

export function useAddMoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      moodLevel,
      moodLabel,
      note,
    }: {
      moodLevel: bigint;
      moodLabel: string;
      note: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.addMoodEntry(moodLevel, moodLabel, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useStartFocusSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      durationMinutes,
      sessionType,
    }: {
      durationMinutes: bigint;
      sessionType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.startFocusSession(durationMinutes, sessionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focusSessions"] });
    },
  });
}

export function useCompleteFocusSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.completeFocusSession(sessionId);
      await actor.checkAndUnlockAchievements();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focusSessions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
