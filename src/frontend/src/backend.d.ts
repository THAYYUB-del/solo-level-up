import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Achievement {
    id: bigint;
    title: string;
    xpReward: bigint;
    description: string;
    conditionType: string;
    isUnlocked: boolean;
}
export type Time = bigint;
export interface Stats {
    totalTasks: bigint;
    tasksCompletedToday: bigint;
    totalXP: bigint;
    rank: string;
    totalFocusSessions: bigint;
    tasksCompletedThisWeek: bigint;
    currentLevel: bigint;
    totalFocusMinutes: bigint;
    moodAverageLast7Days: bigint;
    currentStreak: bigint;
}
export interface Quest {
    id: bigint;
    completedAt?: Time;
    title: string;
    isCompleted: boolean;
    xpReward: bigint;
    rank: string;
}
export interface Profile {
    currentXP: bigint;
    rank: string;
    totalFocusSessions: bigint;
    currentLevel: bigint;
    totalTasksCompleted: bigint;
}
export interface FocusSession {
    id: bigint;
    startTime: Time;
    isCompleted: boolean;
    endTime?: Time;
    sessionType: string;
    durationMinutes: bigint;
}
export interface UserProfile {
    name: string;
}
export interface MoodEntry {
    note?: string;
    moodLabel: string;
    timestamp: Time;
    moodLevel: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMoodEntry(moodLevel: bigint, moodLabel: string, note: string | null): Promise<void>;
    addXp(xp: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkAndUnlockAchievements(): Promise<void>;
    completeFocusSession(sessionId: bigint): Promise<void>;
    completeQuest(questId: bigint): Promise<void>;
    createQuest(title: string, rank: string, xpReward: bigint): Promise<void>;
    deleteQuest(questId: bigint): Promise<void>;
    getAllFocusSessions(): Promise<Array<FocusSession>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMoodLogs(): Promise<Array<MoodEntry>>;
    getProfile(): Promise<Profile>;
    getStats(): Promise<Stats>;
    getTotalFocusStats(): Promise<{
        totalSessions: bigint;
        totalMinutes: bigint;
    }>;
    getUnlockedAchievementsCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAchievements(): Promise<Array<Achievement>>;
    listActiveQuests(): Promise<Array<Quest>>;
    listCompletedQuests(): Promise<Array<Quest>>;
    listQuests(): Promise<Array<Quest>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startFocusSession(durationMinutes: bigint, sessionType: string): Promise<void>;
}
