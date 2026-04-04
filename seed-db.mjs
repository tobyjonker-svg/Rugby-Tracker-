import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  console.log('🌱 Seeding database with sample data...');

  // Create a demo user
  const userId = 1;
  const demoUser = {
    openId: 'demo-user-123',
    name: 'Alex Thompson',
    email: 'alex@rugby.local',
    loginMethod: 'manus',
    role: 'user',
    age: 13,
    position: 'Flanker',
    height: 165,
    weight: 62,
    dominantFoot: 'right',
    team: 'Riverside Rugby Club',
    seasonGoals: 'Improve speed and tackle accuracy',
  };

  // Insert demo user
  await connection.execute(
    `INSERT INTO users (openId, name, email, loginMethod, role, age, position, height, weight, dominantFoot, team, seasonGoals) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      demoUser.openId,
      demoUser.name,
      demoUser.email,
      demoUser.loginMethod,
      demoUser.role,
      demoUser.age,
      demoUser.position,
      demoUser.height,
      demoUser.weight,
      demoUser.dominantFoot,
      demoUser.team,
      demoUser.seasonGoals,
    ]
  );

  console.log('✓ Created demo user');

  // Create training sessions
  const trainingData = [
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      type: 'gym',
      duration: 60,
      effortLevel: 8,
      notes: 'Upper body strength session',
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      type: 'running',
      duration: 45,
      effortLevel: 7,
      notes: 'Interval training with sprints',
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      type: 'conditioning',
      duration: 30,
      effortLevel: 9,
      notes: 'Core and leg conditioning',
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      type: 'rugby_practice',
      duration: 90,
      effortLevel: 8,
      notes: 'Team practice - defensive drills',
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      type: 'recovery',
      duration: 20,
      effortLevel: 3,
      notes: 'Light stretching and mobility work',
    },
  ];

  const trainingSessionIds = [];
  for (const training of trainingData) {
    const [result] = await connection.execute(
      `INSERT INTO training_sessions (userId, date, type, duration, effortLevel, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        training.date,
        training.type,
        training.duration,
        training.effortLevel,
        training.notes,
      ]
    );
    trainingSessionIds.push(result.insertId);
  }

  console.log('✓ Created 5 training sessions');

  // Add gym logs
  const gymExercises = [
    { sessionId: trainingSessionIds[0], name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
    { sessionId: trainingSessionIds[0], name: 'Squats', sets: 4, reps: 10, weight: 80 },
    { sessionId: trainingSessionIds[0], name: 'Deadlifts', sets: 3, reps: 5, weight: 100 },
  ];

  for (const exercise of gymExercises) {
    await connection.execute(
      `INSERT INTO gym_logs (trainingSessionId, exerciseName, sets, reps, weight) 
       VALUES (?, ?, ?, ?, ?)`,
      [exercise.sessionId, exercise.name, exercise.sets, exercise.reps, exercise.weight]
    );
  }

  console.log('✓ Created gym exercise logs');

  // Add running logs
  const runningData = {
    sessionId: trainingSessionIds[1],
    distance: 7.5,
    time: 45,
    averagePace: 6.0,
    sprintDistance: 2.0,
    numberOfSprints: 6,
    bestSprintTime: 18,
  };

  await connection.execute(
    `INSERT INTO running_logs (trainingSessionId, distance, time, averagePace, sprintDistance, numberOfSprints, bestSprintTime) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      runningData.sessionId,
      runningData.distance,
      runningData.time,
      runningData.averagePace,
      runningData.sprintDistance,
      runningData.numberOfSprints,
      runningData.bestSprintTime,
    ]
  );

  console.log('✓ Created running session logs');

  // Add conditioning logs
  const conditioningExercises = [
    { sessionId: trainingSessionIds[2], type: 'pushups', reps: 45 },
    { sessionId: trainingSessionIds[2], type: 'situps', reps: 60 },
    { sessionId: trainingSessionIds[2], type: 'planks', time: 120 },
    { sessionId: trainingSessionIds[2], type: 'burpees', reps: 30 },
  ];

  for (const exercise of conditioningExercises) {
    await connection.execute(
      `INSERT INTO conditioning_logs (trainingSessionId, exerciseType, reps, time) 
       VALUES (?, ?, ?, ?)`,
      [exercise.sessionId, exercise.type, exercise.reps || null, exercise.time || null]
    );
  }

  console.log('✓ Created conditioning exercise logs');

  // Add match stats
  const matchesData = [
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      opponent: 'Central High',
      competition: 'Regional League',
      venue: 'Riverside Stadium',
      homeAway: 'home',
      position: 'Flanker',
      minutesPlayed: 80,
      finalScore: '28-21',
      result: 'win',
      notes: 'Strong defensive performance',
    },
    {
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      opponent: 'Northside Academy',
      competition: 'Regional League',
      venue: 'Northside Ground',
      homeAway: 'away',
      position: 'Flanker',
      minutesPlayed: 75,
      finalScore: '14-17',
      result: 'loss',
      notes: 'Close match, good effort in second half',
    },
  ];

  const matchIds = [];
  for (const match of matchesData) {
    const [result] = await connection.execute(
      `INSERT INTO match_stats (userId, date, opponent, competition, venue, homeAway, position, minutesPlayed, finalScore, result, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        match.date,
        match.opponent,
        match.competition,
        match.venue,
        match.homeAway,
        match.position,
        match.minutesPlayed,
        match.finalScore,
        match.result,
        match.notes,
      ]
    );
    matchIds.push(result.insertId);
  }

  console.log('✓ Created 2 match records');

  // Add match performance stats
  const performanceStats = [
    {
      matchId: matchIds[0],
      tacklesMade: 12,
      tacklesMissed: 2,
      triesScored: 1,
      conversionsKicked: 0,
      penaltiesKicked: 0,
      dropGoals: 0,
      carries: 8,
      metresGained: 45,
      turnoversWon: 3,
      offloads: 2,
      passesCompleted: 15,
      knockOns: 1,
      penaltiesConceded: 2,
      lineBreaks: 1,
      assists: 1,
      kicksFromHand: 3,
    },
    {
      matchId: matchIds[1],
      tacklesMade: 10,
      tacklesMissed: 3,
      triesScored: 0,
      conversionsKicked: 0,
      penaltiesKicked: 0,
      dropGoals: 0,
      carries: 6,
      metresGained: 32,
      turnoversWon: 2,
      offloads: 1,
      passesCompleted: 12,
      knockOns: 2,
      penaltiesConceded: 3,
      lineBreaks: 0,
      assists: 0,
      kicksFromHand: 2,
    },
  ];

  for (const stats of performanceStats) {
    await connection.execute(
      `INSERT INTO match_performance_stats (matchId, tacklesMade, tacklesMissed, triesScored, conversionsKicked, penaltiesKicked, dropGoals, carries, metresGained, turnoversWon, offloads, passesCompleted, knockOns, penaltiesConceded, lineBreaks, assists, kicksFromHand) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stats.matchId,
        stats.tacklesMade,
        stats.tacklesMissed,
        stats.triesScored,
        stats.conversionsKicked,
        stats.penaltiesKicked,
        stats.dropGoals,
        stats.carries,
        stats.metresGained,
        stats.turnoversWon,
        stats.offloads,
        stats.passesCompleted,
        stats.knockOns,
        stats.penaltiesConceded,
        stats.lineBreaks,
        stats.assists,
        stats.kicksFromHand,
      ]
    );
  }

  console.log('✓ Created match performance statistics');

  // Add goals
  const goalsData = [
    {
      title: 'Do 50 push-ups without stopping',
      category: 'fitness',
      targetNumber: 50,
      currentProgress: 45,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active',
    },
    {
      title: 'Run 5km under 25 minutes',
      category: 'fitness',
      targetNumber: 25,
      currentProgress: 26.5,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      status: 'active',
    },
    {
      title: 'Score 10 tries this season',
      category: 'match_performance',
      targetNumber: 10,
      currentProgress: 1,
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      status: 'active',
    },
    {
      title: 'Make 15 tackles in a game',
      category: 'match_performance',
      targetNumber: 15,
      currentProgress: 12,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      status: 'active',
    },
    {
      title: 'Attend 4 training sessions each week',
      category: 'training',
      targetNumber: 4,
      currentProgress: 3,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      status: 'active',
    },
  ];

  for (const goal of goalsData) {
    await connection.execute(
      `INSERT INTO goals (userId, title, category, targetNumber, currentProgress, deadline, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        goal.title,
        goal.category,
        goal.targetNumber,
        goal.currentProgress,
        goal.deadline,
        goal.status,
      ]
    );
  }

  console.log('✓ Created 5 personal goals');

  // Add personal bests
  const personalBestsData = [
    {
      metricType: 'pushups',
      value: 45,
      unit: 'reps',
      achievedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      context: 'Gym session',
    },
    {
      metricType: 'distance',
      value: 7.5,
      unit: 'km',
      achievedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      context: 'Running session',
    },
    {
      metricType: 'pace',
      value: 6.0,
      unit: 'min/km',
      achievedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      context: 'Running session',
    },
    {
      metricType: 'weight',
      value: 100,
      unit: 'kg',
      achievedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      context: 'Deadlift',
    },
    {
      metricType: 'tackles',
      value: 12,
      unit: 'tackles',
      achievedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      context: 'Match vs Central High',
    },
  ];

  for (const pb of personalBestsData) {
    await connection.execute(
      `INSERT INTO personal_bests (userId, metricType, value, unit, achievedDate, context) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, pb.metricType, pb.value, pb.unit, pb.achievedDate, pb.context]
    );
  }

  console.log('✓ Created personal best records');

  console.log('\n✅ Database seeding completed successfully!');
  console.log(`\nDemo User Credentials:`);
  console.log(`  OpenID: ${demoUser.openId}`);
  console.log(`  Name: ${demoUser.name}`);
  console.log(`  Email: ${demoUser.email}`);
} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
} finally {
  await connection.end();
}
