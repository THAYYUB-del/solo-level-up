import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserProfile = {
    name : Text;
  };

  type Profile = {
    currentLevel : Nat;
    currentXP : Nat;
    rank : Text; // E, D, C, B, A, S, SS, SSS
    totalTasksCompleted : Nat;
    totalFocusSessions : Nat;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Nat.compare(profile1.currentXP, profile2.currentXP);
    };
  };

  type Quest = {
    id : Nat;
    title : Text;
    rank : Text; // E, D, C, B, A, S
    xpReward : Nat;
    isCompleted : Bool;
    completedAt : ?Time.Time;
  };

  module Quest {
    public func compare(quest1 : Quest, quest2 : Quest) : Order.Order {
      Text.compare(quest1.rank, quest2.rank);
    };
  };

  type FocusSession = {
    id : Nat;
    startTime : Time.Time;
    durationMinutes : Nat;
    sessionType : Text; // "work" or "break"
    endTime : ?Time.Time;
    isCompleted : Bool;
  };

  type MoodEntry = {
    moodLevel : Nat; // 1-5
    moodLabel : Text;
    note : ?Text;
    timestamp : Time.Time;
  };

  type Achievement = {
    id : Nat;
    title : Text;
    description : Text;
    xpReward : Nat;
    conditionType : Text;
    isUnlocked : Bool;
  };

  type Stats = {
    totalXP : Nat;
    currentLevel : Nat;
    rank : Text;
    tasksCompletedToday : Nat;
    tasksCompletedThisWeek : Nat;
    totalTasks : Nat;
    totalFocusSessions : Nat;
    totalFocusMinutes : Nat;
    currentStreak : Nat;
    moodAverageLast7Days : Nat;
  };

  // Persistent state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let profiles = Map.empty<Principal, Profile>();
  let userQuests = Map.empty<Principal, List.List<Quest>>();
  var nextQuestId = 1;

  let userFocusSessions = Map.empty<Principal, List.List<FocusSession>>();
  var nextFocusSessionId = 1;
  let userMoodEntries = Map.empty<Principal, List.List<MoodEntry>>();
  let achievements = Map.empty<Nat, Achievement>();
  let userAchievements = Map.empty<Principal, List.List<Nat>>();

  // Authorization state and mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required user profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Game profile management
  public query ({ caller }) func getProfile() : async Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (profiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        // Return default profile
        {
          currentLevel = 1;
          currentXP = 0;
          rank = "E";
          totalTasksCompleted = 0;
          totalFocusSessions = 0;
        };
      };
    };
  };

  public shared ({ caller }) func addXp(xp : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add XP");
    };

    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) {
        {
          currentLevel = 1;
          currentXP = 0;
          rank = "E";
          totalTasksCompleted = 0;
          totalFocusSessions = 0;
        };
      };
    };

    let newXp = profile.currentXP + xp;
    let newLevel = 1 + newXp / 1000;
    let newRank = if (newLevel < 10) {
      "E";
    } else if (newLevel < 20) {
      "D";
    } else if (newLevel < 30) {
      "C";
    } else if (newLevel < 40) {
      "B";
    } else if (newLevel < 50) {
      "A";
    } else if (newLevel < 60) {
      "S";
    } else if (newLevel < 70) {
      "SS";
    } else {
      "SSS";
    };

    let updatedProfile = {
      profile with
      currentXP = newXp;
      currentLevel = newLevel;
      rank = newRank;
    };
    profiles.add(caller, updatedProfile);
  };

  // Quest management
  public shared ({ caller }) func createQuest(title : Text, rank : Text, xpReward : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create quests");
    };

    let quest : Quest = {
      id = nextQuestId;
      title;
      rank;
      xpReward;
      isCompleted = false;
      completedAt = null;
    };

    let currentQuests = switch (userQuests.get(caller)) {
      case (?q) { q };
      case (null) { List.empty<Quest>() };
    };
    currentQuests.add(quest);
    userQuests.add(caller, currentQuests);

    nextQuestId += 1;
  };

  public shared ({ caller }) func completeQuest(questId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete quests");
    };

    let currentQuests = switch (userQuests.get(caller)) {
      case (?q) { q };
      case (null) { Runtime.trap("No quests found") };
    };

    var questFound = false;
    var xpToAward = 0;

    let updatedQuests = currentQuests.map<Quest, Quest>(
      func(quest) {
        if (quest.id == questId and not quest.isCompleted) {
          questFound := true;
          xpToAward := quest.xpReward;
          { quest with isCompleted = true; completedAt = ?Time.now() };
        } else {
          quest;
        };
      }
    );

    if (not questFound) {
      Runtime.trap("Quest not found or already completed");
    };

    userQuests.add(caller, updatedQuests);

    // Update profile
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) {
        {
          currentLevel = 1;
          currentXP = 0;
          rank = "E";
          totalTasksCompleted = 0;
          totalFocusSessions = 0;
        };
      };
    };

    let updatedProfile = {
      profile with
      totalTasksCompleted = profile.totalTasksCompleted + 1;
    };
    profiles.add(caller, updatedProfile);

    await addXp(xpToAward);
  };

  public shared ({ caller }) func deleteQuest(questId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete quests");
    };

    let currentQuests = switch (userQuests.get(caller)) {
      case (?q) { q };
      case (null) { Runtime.trap("No quests found") };
    };

    let filteredQuests = currentQuests.filter(func(q) { q.id != questId });
    userQuests.add(caller, filteredQuests);
  };

  public query ({ caller }) func listQuests() : async [Quest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list quests");
    };

    switch (userQuests.get(caller)) {
      case (?quests) { quests.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func listActiveQuests() : async [Quest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list active quests");
    };

    switch (userQuests.get(caller)) {
      case (?quests) {
        quests.filter(func(q) { not q.isCompleted }).toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func listCompletedQuests() : async [Quest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list completed quests");
    };

    switch (userQuests.get(caller)) {
      case (?quests) {
        quests.filter(func(q) { q.isCompleted }).toArray();
      };
      case (null) { [] };
    };
  };

  // Focus session management
  public shared ({ caller }) func startFocusSession(durationMinutes : Nat, sessionType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start focus sessions");
    };

    let session : FocusSession = {
      id = nextFocusSessionId;
      startTime = Time.now();
      durationMinutes;
      sessionType;
      endTime = null;
      isCompleted = false;
    };

    let currentSessions = switch (userFocusSessions.get(caller)) {
      case (?s) { s };
      case (null) { List.empty<FocusSession>() };
    };
    currentSessions.add(session);
    userFocusSessions.add(caller, currentSessions);

    nextFocusSessionId += 1;
  };

  public shared ({ caller }) func completeFocusSession(sessionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete focus sessions");
    };

    let currentSessions = switch (userFocusSessions.get(caller)) {
      case (?s) { s };
      case (null) { Runtime.trap("No focus sessions found") };
    };

    var sessionFound = false;

    let updatedSessions = currentSessions.map<FocusSession, FocusSession>(
      func(session) {
        if (session.id == sessionId and not session.isCompleted) {
          sessionFound := true;
          {
            session with
            isCompleted = true;
            endTime = ?Time.now();
          };
        } else {
          session;
        };
      }
    );

    if (not sessionFound) {
      Runtime.trap("Focus session not found or already completed");
    };

    userFocusSessions.add(caller, updatedSessions);

    // Update profile
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) {
        {
          currentLevel = 1;
          currentXP = 0;
          rank = "E";
          totalTasksCompleted = 0;
          totalFocusSessions = 0;
        };
      };
    };

    let updatedProfile = {
      profile with
      totalFocusSessions = profile.totalFocusSessions + 1;
    };
    profiles.add(caller, updatedProfile);

    await addXp(50); // Award 50 XP for completing a focus session
  };

  public query ({ caller }) func getAllFocusSessions() : async [FocusSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view focus sessions");
    };

    switch (userFocusSessions.get(caller)) {
      case (?sessions) { sessions.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getTotalFocusStats() : async { totalSessions : Nat; totalMinutes : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view focus stats");
    };

    switch (userFocusSessions.get(caller)) {
      case (?sessions) {
        var totalMinutes = 0;
        var totalSessions = 0;
        sessions.forEach(func(s) {
          if (s.isCompleted) {
            totalMinutes += s.durationMinutes;
            totalSessions += 1;
          };
        });
        { totalSessions; totalMinutes };
      };
      case (null) { { totalSessions = 0; totalMinutes = 0 } };
    };
  };

  // Mood log management
  public shared ({ caller }) func addMoodEntry(moodLevel : Nat, moodLabel : Text, note : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add mood entries");
    };

    let entry : MoodEntry = {
      moodLevel;
      moodLabel;
      note;
      timestamp = Time.now();
    };

    let currentEntries = switch (userMoodEntries.get(caller)) {
      case (?e) { e };
      case (null) { List.empty<MoodEntry>() };
    };

    let entriesList = List.empty<MoodEntry>();
    entriesList.add(entry);

    currentEntries.toArray().sliceToArray(0, 29).forEach(func(e) { entriesList.add(e) });

    userMoodEntries.add(caller, entriesList);
  };

  public query ({ caller }) func getMoodLogs() : async [MoodEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mood logs");
    };

    switch (userMoodEntries.get(caller)) {
      case (?entries) { entries.toArray() };
      case (null) { [] };
    };
  };

  // Achievement management
  public query ({ caller }) func listAchievements() : async [Achievement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view achievements");
    };

    let unlockedIds = switch (userAchievements.get(caller)) {
      case (?ids) { ids };
      case (null) { List.empty<Nat>() };
    };

    achievements.values().toArray().map(
      func(achievement) {
        let isUnlocked = unlockedIds.values().find(func(id) { id == achievement.id }) != null;
        { achievement with isUnlocked };
      }
    );
  };

  public query ({ caller }) func getUnlockedAchievementsCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view achievement count");
    };

    switch (userAchievements.get(caller)) {
      case (?ids) { ids.size() };
      case (null) { 0 };
    };
  };

  public shared ({ caller }) func checkAndUnlockAchievements() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock achievements");
    };

    // Implementation would check conditions and unlock achievements
    // This is a placeholder
  };

  // Statistics
  public query ({ caller }) func getStats() : async Stats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };

    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) {
        {
          currentLevel = 1;
          currentXP = 0;
          rank = "E";
          totalTasksCompleted = 0;
          totalFocusSessions = 0;
        };
      };
    };

    let focusStats = switch (userFocusSessions.get(caller)) {
      case (?sessions) {
        var totalMinutes = 0;
        sessions.forEach(func(s) {
          if (s.isCompleted) {
            totalMinutes += s.durationMinutes;
          };
        });
        totalMinutes;
      };
      case (null) { 0 };
    };

    {
      totalXP = profile.currentXP;
      currentLevel = profile.currentLevel;
      rank = profile.rank;
      tasksCompletedToday = 0; // Would need date tracking
      tasksCompletedThisWeek = 0; // Would need date tracking
      totalTasks = profile.totalTasksCompleted;
      totalFocusSessions = profile.totalFocusSessions;
      totalFocusMinutes = focusStats;
      currentStreak = 0; // Would need date tracking
      moodAverageLast7Days = 0; // Would need calculation
    };
  };
};
