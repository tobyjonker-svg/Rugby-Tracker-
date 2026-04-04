import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with rugby-specific profile fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Rugby-specific profile fields
  age: int("age"),
  position: varchar("position", { length: 100 }),
  height: int("height"), // cm
  weight: int("weight"), // kg
  dominantFoot: mysqlEnum("dominantFoot", ["left", "right", "both"]),
  team: varchar("team", { length: 255 }),
  profilePhotoUrl: text("profilePhotoUrl"),
  seasonGoals: text("seasonGoals"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Training Sessions Table
 * Logs all training activities with flexible exercise tracking
 */
export const trainingSessions = mysqlTable("training_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  type: mysqlEnum("type", [
    "gym",
    "running",
    "conditioning",
    "rugby_practice",
    "recovery",
    "speed_work",
    "skills_practice",
    "other",
  ]).notNull(),
  duration: int("duration"), // minutes
  effortLevel: int("effortLevel"), // 1-10
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;

/**
 * Gym Logs Table
 * Detailed gym exercise tracking
 */
export const gymLogs = mysqlTable("gym_logs", {
  id: int("id").autoincrement().primaryKey(),
  trainingSessionId: int("trainingSessionId").notNull(),
  exerciseName: varchar("exerciseName", { length: 255 }).notNull(),
  sets: int("sets"),
  reps: int("reps"),
  weight: decimal("weight", { precision: 6, scale: 2 }), // kg
  notes: text("notes"),
});

export type GymLog = typeof gymLogs.$inferSelect;
export type InsertGymLog = typeof gymLogs.$inferInsert;

/**
 * Running Logs Table
 * Running session metrics
 */
export const runningLogs = mysqlTable("running_logs", {
  id: int("id").autoincrement().primaryKey(),
  trainingSessionId: int("trainingSessionId").notNull(),
  distance: decimal("distance", { precision: 8, scale: 2 }), // km
  time: int("time"), // minutes
  averagePace: decimal("averagePace", { precision: 6, scale: 2 }), // min/km
  sprintDistance: decimal("sprintDistance", { precision: 8, scale: 2 }), // km
  numberOfSprints: int("numberOfSprints"),
  bestSprintTime: int("bestSprintTime"), // seconds
});

export type RunningLog = typeof runningLogs.$inferSelect;
export type InsertRunningLog = typeof runningLogs.$inferInsert;

/**
 * Conditioning Logs Table
 * Bodyweight and conditioning exercise tracking
 */
export const conditioningLogs = mysqlTable("conditioning_logs", {
  id: int("id").autoincrement().primaryKey(),
  trainingSessionId: int("trainingSessionId").notNull(),
  exerciseType: mysqlEnum("exerciseType", [
    "pushups",
    "situps",
    "pullups",
    "squats",
    "planks",
    "burpees",
    "lunges",
    "shuttle_runs",
    "custom",
  ]).notNull(),
  reps: int("reps"),
  time: int("time"), // seconds (for timed exercises)
  notes: text("notes"),
});

export type ConditioningLog = typeof conditioningLogs.$inferSelect;
export type InsertConditioningLog = typeof conditioningLogs.$inferInsert;

/**
 * Match Stats Table
 * Rugby match performance tracking
 */
export const matchStats = mysqlTable("match_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  opponent: varchar("opponent", { length: 255 }).notNull(),
  competition: varchar("competition", { length: 255 }),
  venue: varchar("venue", { length: 255 }),
  homeAway: mysqlEnum("homeAway", ["home", "away"]),
  position: varchar("position", { length: 100 }),
  minutesPlayed: int("minutesPlayed"),
  finalScore: varchar("finalScore", { length: 50 }),
  result: mysqlEnum("result", ["win", "loss", "draw"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatchStat = typeof matchStats.$inferSelect;
export type InsertMatchStat = typeof matchStats.$inferInsert;

/**
 * Match Performance Stats Table
 * Detailed individual performance metrics per match
 */
export const matchPerformanceStats = mysqlTable("match_performance_stats", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  tacklesMade: int("tacklesMade"),
  tacklesMissed: int("tacklesMissed"),
  triesScored: int("triesScored"),
  conversionsKicked: int("conversionsKicked"),
  penaltiesKicked: int("penaltiesKicked"),
  dropGoals: int("dropGoals"),
  carries: int("carries"),
  metresGained: int("metresGained"),
  turnoversWon: int("turnoversWon"),
  offloads: int("offloads"),
  passesCompleted: int("passesCompleted"),
  knockOns: int("knockOns"),
  penaltiesConceded: int("penaltiesConceded"),
  lineBreaks: int("lineBreaks"),
  assists: int("assists"),
  kicksFromHand: int("kicksFromHand"),
});

export type MatchPerformanceStat = typeof matchPerformanceStats.$inferSelect;
export type InsertMatchPerformanceStat = typeof matchPerformanceStats.$inferInsert;

/**
 * Goals Table
 * Personal goal tracking with progress monitoring
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", [
    "fitness",
    "match_performance",
    "training",
    "personal",
  ]).notNull(),
  targetNumber: decimal("targetNumber", { precision: 10, scale: 2 }),
  currentProgress: decimal("currentProgress", { precision: 10, scale: 2 }).default("0"),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * Personal Bests Table
 * Tracks user's personal records
 */
export const personalBests = mysqlTable("personal_bests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricType: mysqlEnum("metricType", [
    "pushups",
    "distance",
    "pace",
    "weight",
    "tries",
    "tackles",
    "custom",
  ]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  achievedDate: timestamp("achievedDate").notNull(),
  context: text("context"),
});

export type PersonalBest = typeof personalBests.$inferSelect;
export type InsertPersonalBest = typeof personalBests.$inferInsert;

/**
 * Teams Table (Future)
 * For multi-user team support
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  school: varchar("school", { length: 255 }),
  coach: varchar("coach", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team Memberships Table (Future)
 * Links users to teams
 */
export const teamMemberships = mysqlTable("team_memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  teamId: int("teamId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  role: mysqlEnum("role", ["player", "coach", "admin"]).default("player"),
});

export type TeamMembership = typeof teamMemberships.$inferSelect;
export type InsertTeamMembership = typeof teamMemberships.$inferInsert;
