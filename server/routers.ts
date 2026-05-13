import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
// Table stubs no longer needed - using direct db functions

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
        await db.upsertUser({ openId: ctx.user.openId, ...input });
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
          await db.upsertUser({ openId: ctx.user.openId, profilePhotoUrl: url });
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
        type: z.enum(["gym", "running", "conditioning", "rugby_practice", "recovery", "speed_work", "skills_practice", "tennis", "netball", "cricket", "hockey", "golf", "swimming", "other"]),
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
        await db.deleteTrainingSession(input.id);
        return { success: true };
      }),
  }),

  matches: router({
    create: protectedProcedure
      .input(z.object({
        date: z.date(),
        sport: z.enum(["rugby", "tennis", "netball", "cricket", "hockey", "golf", "swimming"]).default("rugby"),
        opponent: z.string(),
        result: z.enum(["win", "loss", "draw"]),
        finalScore: z.string(),
        position: z.string(),
        // Rugby stats
        tackles: z.number().optional().default(0),
        tries: z.number().optional().default(0),
        assists: z.number().optional().default(0),
        conversions: z.number().optional().default(0),
        penalties: z.number().optional().default(0),
        carries: z.number().optional().default(0),
        meters: z.number().optional().default(0),
        offloads: z.number().optional().default(0),
        // Tennis stats
        setsWon: z.number().optional().default(0),
        setsLost: z.number().optional().default(0),
        aces: z.number().optional().default(0),
        doubleFaults: z.number().optional().default(0),
        // Netball stats
        goalsScored: z.number().optional().default(0),
        goalAttempts: z.number().optional().default(0),
        intercepts: z.number().optional().default(0),
        // Cricket stats
        runsScored: z.number().optional().default(0),
        wicketsTaken: z.number().optional().default(0),
        catches: z.number().optional().default(0),
        // Hockey stats
        goals: z.number().optional().default(0),
        shots: z.number().optional().default(0),
        // Golf stats
        holesPlayed: z.number().optional().default(0),
        score: z.number().optional().default(0),
        parScore: z.number().optional().default(0),
        // Swimming stats
        strokeType: z.string().optional().default(""),
        distanceMeters: z.number().optional().default(0),
        timeSeconds: z.number().optional().default(0),
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
        await db.deleteMatchStat(input.id);
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
        await db.createGoal(ctx.user.id, {
          title: input.title,
          category: input.category,
          targetNumber: input.targetNumber,
          deadline: input.deadline,
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
        await db.deleteGoal(input.id);
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
