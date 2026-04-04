import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test Player",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: () => {},
    } as any,
  };
}

describe("Rugby Tracker API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("Auth", () => {
    it("should return current user", async () => {
      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.email).toBe("test@example.com");
    });

    it("should logout successfully", async () => {
      const result = await caller.auth.logout();
      expect(result.success).toBe(true);
    });
  });

  describe("Profile", () => {
    it("should get user profile", async () => {
      const profile = await caller.profile.get();
      expect(profile).toBeDefined();
      expect(profile?.name).toBe("Test Player");
    });
  });

  describe("Training", () => {
    it("should create a gym training session", async () => {
      const result = await caller.training.create({
        date: new Date("2026-04-04"),
        type: "gym",
        duration: 60,
        effortLevel: 8,
        notes: "Great workout",
        gymExercises: [
          {
            exerciseName: "Bench Press",
            sets: 4,
            reps: 8,
            weight: 100,
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeGreaterThan(0);
    });

    it("should create a running session", async () => {
      const result = await caller.training.create({
        date: new Date("2026-04-04"),
        type: "running",
        duration: 45,
        effortLevel: 7,
        runningData: {
          distance: 7.5,
          numberOfSprints: 6,
          bestSprintTime: 18,
        },
      });

      expect(result.success).toBe(true);
    });

    it("should create a conditioning session", async () => {
      const result = await caller.training.create({
        date: new Date("2026-04-04"),
        type: "conditioning",
        duration: 30,
        effortLevel: 9,
        conditioningExercises: [
          {
            exerciseType: "pushups",
            reps: 50,
          },
          {
            exerciseType: "burpees",
            reps: 20,
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should list training sessions", async () => {
      const sessions = await caller.training.list({ limit: 10 });
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe("Matches", () => {
    it("should create a match record", async () => {
      const result = await caller.matches.create({
        date: new Date("2026-04-04"),
        opponent: "Central High",
        competition: "League",
        venue: "Home Stadium",
        homeAway: "home",
        position: "Flanker",
        minutesPlayed: 80,
        finalScore: "28-21",
        result: "win",
        performanceStats: {
          tacklesMade: 15,
          triesScored: 1,
          assists: 2,
          carries: 12,
        },
      });

      expect(result.success).toBe(true);
      expect(result.matchId).toBeGreaterThan(0);
    });

    it("should list matches", async () => {
      const matches = await caller.matches.list({ limit: 10 });
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  describe("Goals", () => {
    it("should create a fitness goal", async () => {
      const result = await caller.goals.create({
        title: "Do 50 push-ups without stopping",
        category: "fitness",
        targetNumber: 50,
        deadline: new Date("2026-05-04"),
      });

      expect(result.success).toBe(true);
      expect(result.goalId).toBeGreaterThan(0);
    });

    it("should create a match performance goal", async () => {
      const result = await caller.goals.create({
        title: "Average 8/10 effort in matches",
        category: "match_performance",
        targetNumber: 8,
      });

      expect(result.success).toBe(true);
    });

    it("should list goals", async () => {
      const goals = await caller.goals.list({ limit: 10 });
      expect(Array.isArray(goals)).toBe(true);
    });

    it("should update goal progress", async () => {
      // Create a goal first
      const created = await caller.goals.create({
        title: "Test Goal",
        category: "fitness",
        targetNumber: 100,
      });

      // Update progress
      const result = await caller.goals.updateProgress({
        id: created.goalId,
        progress: 50,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Personal Bests", () => {
    it("should create a personal best", async () => {
      const result = await caller.personalBests.create({
        metricType: "pushups",
        value: 45,
        unit: "reps",
        context: "single set",
      });

      expect(result.success).toBe(true);
      expect(result.pbId).toBeGreaterThan(0);
    });

    it("should list personal bests", async () => {
      const pbs = await caller.personalBests.list();
      expect(Array.isArray(pbs)).toBe(true);
    });
  });

  describe("Analytics", () => {
    it("should get weekly training summary", async () => {
      const summary = await caller.analytics.weeklyTraining();
      expect(summary).toBeDefined();
    });

    it("should get total distance this week", async () => {
      const distance = await caller.analytics.totalDistanceThisWeek();
      expect(distance).toBeDefined();
    });
  });
});
