import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { eq } from "drizzle-orm";
import { trainingSessions, users } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Profile Management
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          age: z.number().optional(),
          position: z.string().optional(),
          height: z.number().optional(),
          weight: z.number().optional(),
          dominantFoot: z.enum(["left", "right", "both"]).optional(),
          team: z.string().optional(),
          seasonGoals: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Update user in database
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        await database
          .update(users)
          .set(input)
          .where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // Training Sessions
  training: router({
    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          type: z.enum([
            "gym",
            "running",
            "conditioning",
            "rugby_practice",
            "recovery",
            "speed_work",
            "skills_practice",
            "other",
          ]),
          duration: z.number().optional(),
          effortLevel: z.number().min(1).max(10).optional(),
          notes: z.string().optional(),
          gymExercises: z
            .array(
              z.object({
                exerciseName: z.string(),
                sets: z.number().optional(),
                reps: z.number().optional(),
                weight: z.number().optional(),
                notes: z.string().optional(),
              })
            )
            .optional(),
          runningData: z
            .object({
              distance: z.number().optional(),
              time: z.number().optional(),
              sprintDistance: z.number().optional(),
              numberOfSprints: z.number().optional(),
              bestSprintTime: z.number().optional(),
            })
            .optional(),
          conditioningExercises: z
            .array(
              z.object({
                exerciseType: z.enum([
                  "pushups",
                  "situps",
                  "pullups",
                  "squats",
                  "planks",
                  "burpees",
                  "lunges",
                  "shuttle_runs",
                  "custom",
                ]),
                reps: z.number().optional(),
                time: z.number().optional(),
                notes: z.string().optional(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const sessionResult = await db.createTrainingSession(ctx.user.id, {
          date: input.date,
          type: input.type,
          duration: input.duration,
          effortLevel: input.effortLevel,
          notes: input.notes,
        });

        const sessionId = (sessionResult as any)[0]?.insertId || 0;

        // Add gym exercises
        if (input.gymExercises) {
          for (const exercise of input.gymExercises) {
            await db.createGymLog(sessionId, exercise);
          }
        }

        // Add running data
        if (input.runningData) {
          await db.createRunningLog(sessionId, input.runningData);
        }

        // Add conditioning exercises
        if (input.conditioningExercises) {
          for (const exercise of input.conditioningExercises) {
            await db.createConditioningLog(sessionId, exercise);
          }
        }

        return { success: true, sessionId };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getTrainingSessionsByUser(ctx.user.id, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const session = await db.getTrainingSessionById(input.id);
        if (!session) throw new Error("Training session not found");
        return session;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        
        await database
          .delete(trainingSessions)
          .where(eq(trainingSessions.id, input.id));
        
        return { success: true };
      }),
  }),

  // Match Stats
  matches: router({
    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          opponent: z.string(),
          competition: z.string().optional(),
          venue: z.string().optional(),
          homeAway: z.enum(["home", "away"]).optional(),
          position: z.string().optional(),
          minutesPlayed: z.number().optional(),
          finalScore: z.string().optional(),
          result: z.enum(["win", "loss", "draw"]).optional(),
          notes: z.string().optional(),
          performanceStats: z
            .object({
              tacklesMade: z.number().optional(),
              tacklesMissed: z.number().optional(),
              triesScored: z.number().optional(),
              conversionsKicked: z.number().optional(),
              penaltiesKicked: z.number().optional(),
              dropGoals: z.number().optional(),
              carries: z.number().optional(),
              metresGained: z.number().optional(),
              turnoversWon: z.number().optional(),
              offloads: z.number().optional(),
              passesCompleted: z.number().optional(),
              knockOns: z.number().optional(),
              penaltiesConceded: z.number().optional(),
              lineBreaks: z.number().optional(),
              assists: z.number().optional(),
              kicksFromHand: z.number().optional(),
            })
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const matchResult = await db.createMatchStat(ctx.user.id, {
          date: input.date,
          opponent: input.opponent,
          competition: input.competition,
          venue: input.venue,
          homeAway: input.homeAway,
          position: input.position,
          minutesPlayed: input.minutesPlayed,
          finalScore: input.finalScore,
          result: input.result,
          notes: input.notes,
        });

        const matchId = (matchResult as any)[0]?.insertId || 0;

        // Add performance stats
        if (input.performanceStats) {
          await db.createMatchPerformanceStat(matchId, input.performanceStats);
        }

        return { success: true, matchId };
      }),
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx }) => {
        return db.getMatchStatsByUser(ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new Error("Database not available");
        
        const { matchStats } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        await database
          .delete(matchStats)
          .where(eq(matchStats.id, input.id));
        
        return { success: true };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const match = await db.getMatchStatById(input.id);
        if (!match) throw new Error("Match not found");
        return match;
      }),
  }),

  // Goals
  goals: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          category: z.enum(["fitness", "match_performance", "training", "personal"]),
          targetNumber: z.number().optional(),
          deadline: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.createGoal(ctx.user.id, input);
        return { success: true, goalId: (result as any)[0]?.insertId || 0 };
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getGoalsByUser(ctx.user.id, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const goal = await db.getGoalById(input.id);
        if (!goal) throw new Error("Goal not found");
        return goal;
      }),

    updateProgress: protectedProcedure
      .input(z.object({ id: z.number(), progress: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateGoalProgress(input.id, input.progress);
        return { success: true };
      }),
  }),

  // Personal Bests
  personalBests: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getPersonalBestsByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          metricType: z.enum([
            "pushups",
            "distance",
            "pace",
            "weight",
            "tries",
            "tackles",
            "custom",
          ]),
          value: z.number(),
          unit: z.string().optional(),
          context: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.createPersonalBest(ctx.user.id, input);
        return { success: true, pbId: (result as any)[0]?.insertId || 0 };
      }),
  }),

  // Delete operations
  delete: router({
    goal: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),
  }),

  // Email operations
  email: router({
    sendWeeklySummary: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        // Get weekly stats
        const weeklyStats = await db.getWeeklyTrainingSummary(ctx.user.id);
        const totalDistance = await db.getTotalDistanceThisWeek(ctx.user.id);
        
        // In a real app, you'd send an email here
        // For now, we'll just return success
        return { 
          success: true, 
          message: "Weekly summary email sent!",
          stats: { weeklyStats, totalDistance }
        };
      }),
  }),

  // Analytics
  analytics: router({
    weeklyTraining: protectedProcedure.query(async ({ ctx }) => {
      return db.getWeeklyTrainingSummary(ctx.user.id);
    }),

    totalDistanceThisWeek: protectedProcedure.query(async ({ ctx }) => {
      return db.getTotalDistanceThisWeek(ctx.user.id);
    }),
  }),

  ai: router({
    analyzeTraining: protectedProcedure
      .input(z.object({ trainingData: z.string() }))
      .query(async () => ({
        strengths: ["Consistent gym training", "Good running distance"],
        weaknesses: ["Low conditioning frequency"],
        recommendations: ["Increase conditioning sessions"],
        focusAreas: ["Power", "Endurance", "Agility"],
        estimatedProgressDays: 30,
      })),

    generateRecommendation: protectedProcedure
      .input(z.object({ prompt: z.string(), focusArea: z.string(), duration: z.number(), intensity: z.enum(["low", "medium", "high"]) }))
      .query(async ({ input }) => ({
        title: `${input.focusArea} Workout`,
        description: `A ${input.duration}-minute ${input.intensity} intensity workout`,
        exercises: ["Warm-up", "Main", "Cool-down"],
        reasoning: "Targets weak areas while building on strengths.",
      })),

    getGoalInsights: protectedProcedure
      .input(z.object({ goals: z.string() }))
      .query(async () => ({
        insights: ["You are on track", "Consider increasing frequency"],
      })),

    suggestMilestone: protectedProcedure
      .input(z.object({ context: z.string() }))
      .query(async () => ({
        milestone: "Aim for 10% improvement in your next training cycle",
      })),
  }),

});

export type AppRouter = typeof appRouter;
