import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { LoadingSpinner } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function Analytics() {
  const { data: trainingSessions, isLoading: trainingLoading } = trpc.training.list.useQuery({ limit: 100 });
  const { data: matches, isLoading: matchesLoading } = trpc.matches.list.useQuery({ limit: 100 });
  const { data: goals, isLoading: goalsLoading } = trpc.goals.list.useQuery({ limit: 100 });

  // Calculate weekly training frequency
  const trainingFrequencyData = useMemo(() => {
    if (!trainingSessions) return [];
    
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = new Array(7).fill(0);
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    
    trainingSessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= weekStart && sessionDate <= today) {
        const dayIndex = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;
        counts[dayIndex]++;
      }
    });
    
    return days.map((day, idx) => ({ day, sessions: counts[idx] }));
  }, [trainingSessions]);

  // Calculate running distance trend (last 4 weeks)
  const distanceTrendData = useMemo(() => {
    if (!trainingSessions) return [];
    
    const weeks: Record<number, { distance: number }> = { 0: { distance: 0 }, 1: { distance: 0 }, 2: { distance: 0 }, 3: { distance: 0 } };
    const today = new Date();
    
    trainingSessions.forEach((session: any) => {
      if (session.runningData && session.runningData.distance) {
        const sessionDate = new Date(session.date);
        const daysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(daysAgo / 7);
        
        if (weekIndex < 4) {
          weeks[weekIndex].distance = (weeks[weekIndex].distance || 0) + session.runningData.distance;
        }
      }
    });
    
    return [weeks[3], weeks[2], weeks[1], weeks[0]].map((week, idx) => ({
      week: `Week ${idx + 1}`,
      distance: week?.distance || 0,
    }));
  }, [trainingSessions]);

  // Calculate performance stats from matches
  const performanceData = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    
    const stats = {
      tackles: 0,
      tries: 0,
      assists: 0,
      conversions: 0,
    };
    
    matches.slice(0, 4).forEach((match: any) => {
      stats.tackles += match.tackles || 0;
      stats.tries += match.tries || 0;
      stats.assists += match.assists || 0;
      stats.conversions += match.conversions || 0;
    });
    
    return [
      { name: "Tackles", value: stats.tackles },
      { name: "Tries", value: stats.tries },
      { name: "Assists", value: stats.assists },
      { name: "Conversions", value: stats.conversions },
    ];
  }, [matches]);

  // Calculate effort distribution
  const effortDistribution = useMemo(() => {
    if (!trainingSessions) return [];
    
    let high = 0, medium = 0, low = 0;
    
    trainingSessions.forEach((session) => {
      const effort = session.effortLevel || 5;
      if (effort >= 8) high++;
      else if (effort >= 5) medium++;
      else low++;
    });
    
    const total = trainingSessions.length || 1;
    return [
      { name: "High (8-10)", value: Math.round((high / total) * 100) },
      { name: "Medium (5-7)", value: Math.round((medium / total) * 100) },
      { name: "Low (1-4)", value: Math.round((low / total) * 100) },
    ];
  }, [trainingSessions]);

  // Calculate personal bests
  const personalBests = useMemo(() => {
    if (!trainingSessions) return {};
    
    const bests: Record<string, number> = {};
    
    trainingSessions.forEach((session: any) => {
      if (session.gymExercises && Array.isArray(session.gymExercises)) {
        session.gymExercises.forEach((exercise: any) => {
          if (exercise.weight) {
            const weight = typeof exercise.weight === 'string' ? parseFloat(exercise.weight) : exercise.weight;
            if (!bests[exercise.exerciseName] || weight > bests[exercise.exerciseName]) {
              bests[exercise.exerciseName] = weight;
            }
          }
        });
      }
    });
    
    return bests;
  }, [trainingSessions]);

  // Calculate goals progress
  const goalsProgress = useMemo(() => {
    if (!goals) return [];
    
    return goals.map((goal) => {
      const current = parseInt(goal.currentProgress || "0");
      const target = parseInt(goal.targetNumber || "1");
      const progress = current && target 
        ? Math.min(Math.round((current / target) * 100), 100)
        : 0;
      return {
        title: goal.title,
        progress,
        category: goal.category,
      };
    });
  }, [goals]);

  // Calculate key stats
  const thisWeekSessions = trainingFrequencyData.reduce((sum, day) => sum + day.sessions, 0);
  const totalDistance = distanceTrendData.reduce((sum, week) => sum + week.distance, 0);
  const avgEffort = trainingSessions && trainingSessions.length > 0
    ? (trainingSessions.reduce((sum, s) => sum + (s.effortLevel || 0), 0) / trainingSessions.length).toFixed(1)
    : 0;
  const matchWins = matches?.filter(m => m.result === "win").length || 0;
  const matchLosses = matches?.filter(m => m.result === "loss").length || 0;

  const COLORS = ["#ff006e", "#00f5ff", "#b537f2", "#ffd60a"];

  const isLoading = trainingLoading || matchesLoading || goalsLoading;

  if (isLoading) {
    return (
      <div className="container py-6 pb-24">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow mb-6">Performance Analytics</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (!trainingSessions || trainingSessions.length === 0) {
    return (
      <div className="container py-6 pb-24">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow mb-6">Performance Analytics</h1>
        <EmptyState
          icon={BarChart3}
          title="No Training Data Yet"
          description="Start logging your training sessions to see your analytics and performance trends"
          actionLabel="Log Training"
          onAction={() => window.location.href = "/training"}
        />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your progress with detailed statistics and trends
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-neon p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">This Week</div>
          <div className="text-3xl font-bold text-neon-pink neon-glow mt-2">{thisWeekSessions}</div>
          <div className="text-xs text-muted-foreground mt-1">Sessions</div>
        </Card>

        <Card className="card-neon p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Distance</div>
          <div className="text-3xl font-bold text-neon-cyan neon-glow-cyan mt-2">{totalDistance.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">km</div>
        </Card>

        <Card className="card-neon p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Avg Effort</div>
          <div className="text-3xl font-bold text-neon-purple mt-2">{avgEffort}</div>
          <div className="text-xs text-muted-foreground mt-1">/10</div>
        </Card>

        <Card className="card-neon p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Matches</div>
          <div className="text-3xl font-bold text-neon-cyan neon-glow-cyan mt-2">{matches?.length || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">{matchWins}W {matchLosses}L</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Training Frequency */}
        {trainingFrequencyData && trainingFrequencyData.length > 0 && (
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-4">
              Weekly Training Frequency
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainingFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #ff006e",
                  }}
                />
                <Bar dataKey="sessions" fill="#ff006e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Distance Trend */}
        {distanceTrendData && distanceTrendData.length > 0 && distanceTrendData.some(d => d.distance > 0) && (
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-4">
              Running Distance Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={distanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #00f5ff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="#00f5ff"
                  strokeWidth={2}
                  dot={{ fill: "#00f5ff", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Performance Stats */}
        {performanceData && performanceData.some(d => d.value > 0) && (
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-4">
              Performance Stats (Last 4 Matches)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #b537f2",
                  }}
                />
                <Bar dataKey="value" fill="#b537f2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Effort Distribution */}
        {effortDistribution && effortDistribution.some(d => d.value > 0) && (
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-4">
              Effort Level Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={effortDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #ff006e",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Personal Bests */}
      {Object.keys(personalBests).length > 0 && (
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Personal Bests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(personalBests).map(([exercise, weight]) => (
              <div key={exercise} className="p-4 bg-background rounded border border-border">
                <p className="text-muted-foreground text-sm">{exercise}</p>
                <p className="text-3xl font-bold text-neon-pink">{weight} kg</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Goals Progress */}
      {goalsProgress.length > 0 && (
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Goals Progress</h2>
          <div className="space-y-4">
            {goalsProgress.map((goal, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-foreground">{goal.title}</span>
                  <span className="text-neon-pink font-bold">{goal.progress}%</span>
                </div>
                <div className="progress-neon">
                  <div className="progress-neon-fill" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
