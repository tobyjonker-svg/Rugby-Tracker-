/**
 * Database layer using sql.js (pure-JS SQLite, no native compilation needed).
 * Data is persisted to a JSON file on disk between restarts.
 */
import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sport-fitness-tracker.json");

let _db: Database | null = null;
let _saveTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Persistence helpers ───────────────────────────────────────────────────

function saveDb() {
  if (!_db) return;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    if (!_db) return;
    const data = _db.export();
    fs.writeFileSync(DB_FILE + ".sqlite", Buffer.from(data));
  }, 500);
}

async function getDb(): Promise<Database> {
  if (_db) return _db;
  const SQL = await initSqlJs();
  const sqliteFile = DB_FILE + ".sqlite";
  if (fs.existsSync(sqliteFile)) {
    const buf = fs.readFileSync(sqliteFile);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }
  initSchema(_db);
  return _db;
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      name TEXT, email TEXT, loginMethod TEXT,
      role TEXT DEFAULT 'user' NOT NULL,
      age INTEGER, position TEXT, height INTEGER, weight INTEGER,
      dominantFoot TEXT, team TEXT, profilePhotoUrl TEXT, seasonGoals TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastSignedIn TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS training_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER,
      effortLevel INTEGER,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS match_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      sport TEXT DEFAULT 'rugby' NOT NULL,
      opponent TEXT NOT NULL,
      competition TEXT, venue TEXT, homeAway TEXT, position TEXT,
      minutesPlayed INTEGER, finalScore TEXT, result TEXT, notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      targetNumber TEXT,
      currentProgress TEXT DEFAULT '0',
      deadline TEXT,
      status TEXT DEFAULT 'active' NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS gym_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainingSessionId INTEGER NOT NULL,
      exerciseName TEXT, sets INTEGER, reps INTEGER, weight REAL
    );
    CREATE TABLE IF NOT EXISTS running_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainingSessionId INTEGER NOT NULL,
      distance REAL, duration INTEGER, pace REAL
    );
    CREATE TABLE IF NOT EXISTS conditioning_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainingSessionId INTEGER NOT NULL,
      exerciseName TEXT, sets INTEGER, reps INTEGER, duration INTEGER
    );
    CREATE TABLE IF NOT EXISTS match_performance_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matchId INTEGER NOT NULL,
      metricName TEXT, metricValue TEXT
    );
    CREATE TABLE IF NOT EXISTS personal_bests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      metricType TEXT, value TEXT, unit TEXT,
      achievedDate TEXT, context TEXT
    );
  `);
}

// ─── Query helpers ─────────────────────────────────────────────────────────

function queryAll(db: Database, sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(db: Database, sql: string, params: any[] = []): any | null {
  const rows = queryAll(db, sql, params);
  return rows[0] ?? null;
}

function run(db: Database, sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDb();
  return { lastInsertRowid: queryOne(db, "SELECT last_insert_rowid() as id")?.id };
}

// ─── User Queries ──────────────────────────────────────────────────────────

export async function upsertUser(user: any): Promise<void> {
  const db = await getDb();
  const existing = queryOne(db, "SELECT id FROM users WHERE openId = ?", [user.openId]);
  if (existing) {
    run(db, `UPDATE users SET name=?, email=?, loginMethod=?, lastSignedIn=?, updatedAt=? WHERE openId=?`, [
      user.name ?? null, user.email ?? null, user.loginMethod ?? null,
      new Date().toISOString(), new Date().toISOString(), user.openId,
    ]);
  } else {
    run(db, `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn) VALUES (?,?,?,?,?,?)`, [
      user.openId, user.name ?? null, user.email ?? null, user.loginMethod ?? null,
      user.role ?? "user", new Date().toISOString(),
    ]);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  return queryOne(db, "SELECT * FROM users WHERE openId = ?", [openId]);
}

// ─── Training Sessions ─────────────────────────────────────────────────────

export async function createTrainingSession(userId: number, data: {
  date: Date; type: string; duration?: number; effortLevel?: number; notes?: string;
}) {
  const db = await getDb();
  const result = run(db, `INSERT INTO training_sessions (userId, date, type, duration, effortLevel, notes) VALUES (?,?,?,?,?,?)`, [
    userId,
    data.date.toISOString(),
    data.type,
    data.duration ?? null,
    data.effortLevel ?? null,
    data.notes ?? null,
  ]);
  return result;
}

export async function getTrainingSessionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  return queryAll(db, "SELECT * FROM training_sessions WHERE userId = ? ORDER BY date DESC LIMIT ?", [userId, limit]);
}

export async function deleteTrainingSession(id: number) {
  const db = await getDb();
  run(db, "DELETE FROM training_sessions WHERE id = ?", [id]);
}

// ─── Gym Logs ──────────────────────────────────────────────────────────────

export async function createGymLog(trainingSessionId: number, exercises: any[]) {
  const db = await getDb();
  for (const ex of exercises) {
    run(db, `INSERT INTO gym_logs (trainingSessionId, exerciseName, sets, reps, weight) VALUES (?,?,?,?,?)`, [
      trainingSessionId, ex.exerciseName, ex.sets ?? null, ex.reps ?? null, ex.weight ?? null,
    ]);
  }
}

export async function getGymLogsBySession(trainingSessionId: number) {
  const db = await getDb();
  return queryAll(db, "SELECT * FROM gym_logs WHERE trainingSessionId = ?", [trainingSessionId]);
}

// ─── Running Logs ──────────────────────────────────────────────────────────

export async function createRunningLog(trainingSessionId: number, data: any) {
  const db = await getDb();
  run(db, `INSERT INTO running_logs (trainingSessionId, distance, duration, pace) VALUES (?,?,?,?)`, [
    trainingSessionId, data.distance ?? null, data.duration ?? null, data.pace ?? null,
  ]);
}

export async function getRunningLogsBySession(trainingSessionId: number) {
  const db = await getDb();
  return queryAll(db, "SELECT * FROM running_logs WHERE trainingSessionId = ?", [trainingSessionId]);
}

// ─── Conditioning Logs ─────────────────────────────────────────────────────

export async function createConditioningLog(trainingSessionId: number, exercises: any[]) {
  const db = await getDb();
  for (const ex of exercises) {
    run(db, `INSERT INTO conditioning_logs (trainingSessionId, exerciseName, sets, reps, duration) VALUES (?,?,?,?,?)`, [
      trainingSessionId, ex.exerciseName ?? ex.exerciseType ?? null, ex.sets ?? null, ex.reps ?? null, ex.duration ?? null,
    ]);
  }
}

// ─── Match Stats ───────────────────────────────────────────────────────────

export async function createMatchStat(userId: number, data: any) {
  const db = await getDb();
  const sportStats: Record<string, any> = {};
  const statFields = [
    "tackles","tries","assists","conversions","penalties","carries","meters","offloads",
    "setsWon","setsLost","aces","doubleFaults",
    "goalsScored","goalAttempts","intercepts","rebounds",
    "runsScored","ballsFaced","wicketsTaken","oversBowled","catches",
    "goals","shots",
    "holesPlayed","score","parScore","fairwaysHit","greensInRegulation",
    "strokeType","distanceMeters","timeSeconds","laps","poolLength",
  ];
  for (const f of statFields) {
    if (data[f] !== undefined && data[f] !== 0 && data[f] !== "") {
      sportStats[f] = data[f];
    }
  }
  const notesWithStats = Object.keys(sportStats).length > 0
    ? `${data.notes || ""}\n[STATS:${JSON.stringify(sportStats)}]`
    : data.notes || "";

  return run(db, `INSERT INTO match_stats (userId, date, sport, opponent, competition, venue, homeAway, position, minutesPlayed, finalScore, result, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [
    userId,
    data.date instanceof Date ? data.date.toISOString() : (data.date || new Date().toISOString()),
    data.sport || "rugby",
    data.opponent || "",
    data.competition ?? null,
    data.venue ?? null,
    data.homeAway ?? null,
    data.position ?? null,
    data.minutesPlayed ?? null,
    data.finalScore ?? null,
    data.result ?? null,
    notesWithStats,
  ]);
}

export async function getMatchStatsByUser(userId: number, limit = 50) {
  const db = await getDb();
  return queryAll(db, "SELECT * FROM match_stats WHERE userId = ? ORDER BY date DESC LIMIT ?", [userId, limit]);
}

export async function getMatchStatById(id: number) {
  const db = await getDb();
  return queryOne(db, "SELECT * FROM match_stats WHERE id = ?", [id]);
}

export async function deleteMatchStat(id: number) {
  const db = await getDb();
  run(db, "DELETE FROM match_stats WHERE id = ?", [id]);
}

export async function createMatchPerformanceStat(matchId: number, data: Record<string, any>) {
  const db = await getDb();
  for (const [key, value] of Object.entries(data)) {
    run(db, `INSERT INTO match_performance_stats (matchId, metricName, metricValue) VALUES (?,?,?)`, [matchId, key, String(value)]);
  }
}

export async function getMatchPerformanceStatByMatch(matchId: number) {
  const db = await getDb();
  return queryOne(db, "SELECT * FROM match_performance_stats WHERE matchId = ?", [matchId]);
}

// ─── Goals ─────────────────────────────────────────────────────────────────

export async function createGoal(userId: number, data: {
  title: string; category: string; targetNumber?: number; deadline?: Date;
}) {
  const db = await getDb();
  return run(db, `INSERT INTO goals (userId, title, category, targetNumber, deadline, status) VALUES (?,?,?,?,?,?)`, [
    userId, data.title, data.category,
    data.targetNumber ? String(data.targetNumber) : null,
    data.deadline ? data.deadline.toISOString() : null,
    "active",
  ]);
}

export async function getGoalsByUser(userId: number, limit = 50) {
  const db = await getDb();
  return queryAll(db, "SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC LIMIT ?", [userId, limit]);
}

export async function getGoalById(id: number) {
  const db = await getDb();
  return queryOne(db, "SELECT * FROM goals WHERE id = ?", [id]);
}

export async function updateGoalProgress(id: number, progress: number) {
  const db = await getDb();
  run(db, "UPDATE goals SET currentProgress = ? WHERE id = ?", [String(progress), id]);
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  run(db, "DELETE FROM goals WHERE id = ?", [id]);
}

// ─── Personal Bests ────────────────────────────────────────────────────────

export async function createPersonalBest(userId: number, data: {
  metricType: string; value: number; unit?: string; context?: string;
}) {
  const db = await getDb();
  return run(db, `INSERT INTO personal_bests (userId, metricType, value, unit, achievedDate, context) VALUES (?,?,?,?,?,?)`, [
    userId, data.metricType, String(data.value), data.unit ?? null,
    new Date().toISOString(), data.context ?? null,
  ]);
}

export async function getPersonalBestsByUser(userId: number) {
  const db = await getDb();
  return queryAll(db, "SELECT * FROM personal_bests WHERE userId = ? ORDER BY achievedDate DESC", [userId]);
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export async function getWeeklyTrainingSummary(userId: number) {
  const db = await getDb();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return queryAll(db, "SELECT * FROM training_sessions WHERE userId = ? AND date >= ?", [userId, weekAgo.toISOString()]);
}

export async function getTotalDistanceThisWeek(userId: number) {
  return 0;
}

// Stub table references kept for any legacy imports
export const users = { id: "id", openId: "openId" } as any;
export const trainingSessions = { id: "id", userId: "userId" } as any;
export const matchStats = { id: "id", userId: "userId" } as any;
export const goals = { id: "id", userId: "userId" } as any;
