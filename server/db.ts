import { eq, and, desc, gte, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  trainingSessions,
  gymLogs,
  runningLogs,
  conditioningLogs,
  matchStats,
  matchPerformanceStats,
  goals,
  personalBests,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Training Sessions Queries
export async function createTrainingSession(
  userId: number,
  data: {
    date: Date;
    type: string;
    duration?: number;
    effortLevel?: number;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trainingSessions).values({
    userId,
    date: data.date,
    type: data.type as any,
    duration: data.duration,
    effortLevel: data.effortLevel,
    notes: data.notes,
  });

  return result;
}

export async function getTrainingSessionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.userId, userId))
    .orderBy(desc(trainingSessions.date))
    .limit(limit);
}

export async function getTrainingSessionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Gym Logs Queries
export async function createGymLog(
  trainingSessionId: number,
  data: {
    exerciseName: string;
    sets?: number;
    reps?: number;
    weight?: number;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(gymLogs).values({
    trainingSessionId,
    exerciseName: data.exerciseName,
    sets: data.sets,
    reps: data.reps,
    weight: data.weight ? String(data.weight) : undefined,
    notes: data.notes,
  });
}

export async function getGymLogsBySession(trainingSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(gymLogs)
    .where(eq(gymLogs.trainingSessionId, trainingSessionId));
}

// Running Logs Queries
export async function createRunningLog(
  trainingSessionId: number,
  data: {
    distance?: number;
    time?: number;
    averagePace?: number;
    sprintDistance?: number;
    numberOfSprints?: number;
    bestSprintTime?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(runningLogs).values({
    trainingSessionId,
    distance: data.distance ? String(data.distance) : undefined,
    time: data.time,
    averagePace: data.averagePace ? String(data.averagePace) : undefined,
    sprintDistance: data.sprintDistance ? String(data.sprintDistance) : undefined,
    numberOfSprints: data.numberOfSprints,
    bestSprintTime: data.bestSprintTime,
  });
}

export async function getRunningLogBySession(trainingSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(runningLogs)
    .where(eq(runningLogs.trainingSessionId, trainingSessionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Conditioning Logs Queries
export async function createConditioningLog(
  trainingSessionId: number,
  data: {
    exerciseType: string;
    reps?: number;
    time?: number;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(conditioningLogs).values({
    trainingSessionId,
    exerciseType: data.exerciseType as any,
    reps: data.reps,
    time: data.time,
    notes: data.notes,
  });
}

export async function getConditioningLogsBySession(trainingSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(conditioningLogs)
    .where(eq(conditioningLogs.trainingSessionId, trainingSessionId));
}

// Match Stats Queries
export async function createMatchStat(
  userId: number,
  data: {
    date: Date;
    sport?: string;
    opponent: string;
    competition?: string;
    venue?: string;
    homeAway?: string;
    position?: string;
    minutesPlayed?: number;
    finalScore?: string;
    result?: string;
    notes?: string;
    // Sport-specific stats stored in notes as JSON
    [key: string]: any;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Build sport-specific notes with stats
  const sportStats = { ...data };
  delete sportStats.date;
  delete sportStats.opponent;
  delete sportStats.competition;
  delete sportStats.venue;
  delete sportStats.homeAway;
  delete sportStats.position;
  delete sportStats.minutesPlayed;
  delete sportStats.finalScore;
  delete sportStats.result;
  delete sportStats.sport;
  const notesWithStats = data.notes 
    ? data.notes 
    : JSON.stringify(sportStats);

  return db.insert(matchStats).values({
    userId,
    date: data.date,
    sport: (data.sport as any) || "rugby",
    opponent: data.opponent,
    competition: data.competition,
    venue: data.venue,
    homeAway: data.homeAway as any,
    position: data.position,
    minutesPlayed: data.minutesPlayed,
    finalScore: data.finalScore,
    result: data.result as any,
    notes: notesWithStats,
  });
}

export async function getMatchStatsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(matchStats)
    .where(eq(matchStats.userId, userId))
    .orderBy(desc(matchStats.date))
    .limit(limit);
}

export async function getMatchStatById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(matchStats)
    .where(eq(matchStats.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Match Performance Stats Queries
export async function createMatchPerformanceStat(
  matchId: number,
  data: Record<string, any>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(matchPerformanceStats).values({
    matchId,
    ...data,
  });
}

export async function getMatchPerformanceStatByMatch(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(matchPerformanceStats)
    .where(eq(matchPerformanceStats.matchId, matchId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Goals Queries
export async function createGoal(
  userId: number,
  data: {
    title: string;
    category: string;
    targetNumber?: number;
    deadline?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(goals).values({
    userId,
    title: data.title,
    category: data.category as any,
    targetNumber: data.targetNumber ? String(data.targetNumber) : undefined,
    deadline: data.deadline,
    status: "active",
  });
}

export async function getGoalsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt))
    .limit(limit);
}

export async function getGoalById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(goals)
    .where(eq(goals.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateGoalProgress(id: number, progress: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(goals)
    .set({ currentProgress: String(progress) })
    .where(eq(goals.id, id));
}

// Personal Bests Queries
export async function createPersonalBest(
  userId: number,
  data: {
    metricType: string;
    value: number;
    unit?: string;
    context?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(personalBests).values({
    userId,
    metricType: data.metricType as any,
    value: String(data.value),
    unit: data.unit,
    achievedDate: new Date(),
    context: data.context,
  });
}

export async function getPersonalBestsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(personalBests)
    .where(eq(personalBests.userId, userId))
    .orderBy(desc(personalBests.achievedDate));
}

// Analytics Queries
export async function getWeeklyTrainingSummary(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return db
    .select()
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        gte(trainingSessions.date, weekAgo)
      )
    );
}

export async function getTotalDistanceThisWeek(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessions = await db
    .select()
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.userId, userId),
        gte(trainingSessions.date, weekAgo)
      )
    );

  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length === 0) return 0;

  const runningData = await db
    .select()
    .from(runningLogs)
    .where(
      and(
        eq(runningLogs.trainingSessionId, sessionIds[0]),
        ...sessionIds.slice(1).map((id) => eq(runningLogs.trainingSessionId, id))
      )
    );

  return runningData.reduce((sum, log) => sum + Number(log.distance || 0), 0);
}
