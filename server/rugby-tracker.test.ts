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

  describe("Training", () => {
    it("should list training sessions", async () => {
      const sessions = await caller.training.list({ limit: 10 });
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe("Matches", () => {
    it("should list matches", async () => {
      const matches = await caller.matches.list({ limit: 10 });
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  describe("Goals", () => {
    it("should list goals", async () => {
      const goals = await caller.goals.list({ limit: 10 });
      expect(Array.isArray(goals)).toBe(true);
    });
  });

  describe("Profile", () => {
    it("should get user profile", async () => {
      const profile = await caller.profile.get();
      expect(profile).toBeDefined();
    });
  });
});
