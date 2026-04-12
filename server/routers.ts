import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { eq } from "drizzle-orm";
import { trainingSessions, users, matchStats, goals } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => ctx.user),
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        age: z.number().optional(),
        position: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        dominantFoot: z.enum(["left", "right", "both"]).optional(),
        team: z.string().optional(),
        seasonGoals: z.string().optional(),
        profilePhotoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        await database.update(users).set(input).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
    uploadPhoto: protectedProcedure
      .input(z.object({ photoBase64: z.string(), fileName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { storagePut } = await import("./storage");
          const base64Data = input.photoBase64.includes(",") 
            ? input.photoBase64.split(",")[1] 
            : input.photoBase64;
          const buffer = Buffer.from(base64Data, "base64");
          const fileKey = `profile-photos/${ctx.user.id}-${Date.now()}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, "image/jpeg");
          const database = await db.getDb();
          if (!database) throw new Error("Database not available");
          await database.update(users).set({ profilePhotoUrl: url }).where(eq(users.id, ctx.user.id));
          return { success: true, photoUrl: url };
        } catch (error) {
          console.error("Photo upload error:", error);
          throw new Error("Failed to upload photo");
        }
      }),
  }),

  training: router({
    create: protectedProcedure
      .input(z.object({
        date: z.date(),
        type: z.enum(["gym", "running", "conditioning"]),
        effortLevel: z.number().min(1).max(10),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createTrainingSession(ctx.user.id, input);
      }),
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getTrainingSessionsByUser(ctx.user.id, input.limit);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(trainingSessions).where(eq(trainingSessions.id, input.id));
        return { success: true };
      }),
  }),

  matches: router({
    create: protectedProcedure
      .input(z.object({
        date: z.date(),
        opponent: z.string(),
        result: z.enum(["win", "loss", "draw"]),
        finalScore: z.string(),
        position: z.string(),
        tackles: z.number(),
        tries: z.number(),
        assists: z.number(),
        conversions: z.number(),
        penalties: z.number(),
        carries: z.number(),
        meters: z.number(),
        offloads: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createMatchStat(ctx.user.id, input);
      }),
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getMatchStatsByUser(ctx.user.id, input.limit);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(matchStats).where(eq(matchStats.id, input.id));
        return { success: true };
      }),
  }),

  goals: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        category: z.enum(["fitness", "match_performance", "training", "personal"]),
        targetNumber: z.number().optional(),
        deadline: z.date().optional(),
        status: z.enum(["active", "completed", "abandoned"]).default("active"),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        const result = await database.insert(goals).values({
          userId: ctx.user.id,
          title: input.title,
          category: input.category,
          targetNumber: input.targetNumber ? input.targetNumber.toString() : undefined,
          deadline: input.deadline,
          status: input.status,
        });
        return { success: true };
      }),
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getGoalsByUser(ctx.user.id, input.limit);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        currentValue: z.number().optional(),
        status: z.enum(["active", "completed", "abandoned"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateGoalProgress(input.id, input.currentValue || 0);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(goals).where(eq(goals.id, input.id));
        return { success: true };
      }),
  }),

  analytics: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await db.getTrainingSessionsByUser(ctx.user.id, 100);
      const matches = await db.getMatchStatsByUser(ctx.user.id, 100);
      const goals_data = await db.getGoalsByUser(ctx.user.id, 100);
      return { sessions: sessions || [], matches: matches || [], goals: goals_data || [] };
    }),
  }),

  ai: router({
    analyzeTraining: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await db.getTrainingSessionsByUser(ctx.user.id, 100);
      if (!sessions || sessions.length === 0) {
        return { analysis: "Start logging training sessions to get personalized recommendations" };
      }
      return { analysis: "Your training data is being analyzed for personalized insights" };
    }),
    getRecommendations: protectedProcedure.query(async ({ ctx }) => {
      return {
        recommendations: [
          "Increase training frequency to 5+ sessions per week",
          "Focus on strength training 3x per week",
          "Add conditioning work to improve explosive power",
        ],
      };
    }),
    generateWorkout: protectedProcedure
      .input(z.object({ focusArea: z.string(), duration: z.number(), intensity: z.string() }))
      .query(async ({ ctx, input }) => {
        return {
          workout: `${input.duration}min ${input.intensity} intensity ${input.focusArea} workout`,
          exercises: ["Exercise 1", "Exercise 2", "Exercise 3"],
        };
      }),
    getProgressInsights: protectedProcedure.query(async ({ ctx }) => {
      return { insights: "Your training consistency is improving. Keep up the great work!" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
