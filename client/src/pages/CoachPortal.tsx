import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CoachPortal() {
  const [coachCode, setCoachCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Fetch current user's data (this is the player being viewed)
  const { user } = useAuth();
  const { data: trainingSessions } = trpc.training.list.useQuery({ limit: 100 });
  const { data: matches } = trpc.matches.list.useQuery({ limit: 100 });

  // Calculate player stats from live data
  const playerStats = useMemo(() => {
    if (!trainingSessions || !matches || !user) return null;

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    // This week workouts
    const workoutsThisWeek = trainingSessions.filter((session: any) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart && sessionDate <= today;
    }).length;

    // Total distance
    const totalDistance = trainingSessions.reduce((sum: number, session: any) => {
      return sum + (session.runningData?.distance || 0);
    }, 0);

    // Personal bests
    let pushupsPB = 0;
    let squatsPB = 0;
    trainingSessions.forEach((session: any) => {
      if (session.conditioningLogs) {
        session.conditioningLogs.forEach((log: any) => {
          if (log.exerciseType === "pushups" && log.reps) {
            pushupsPB = Math.max(pushupsPB, parseInt(log.reps));
          }
        });
      }
      if (session.gymExercises) {
        session.gymExercises.forEach((ex: any) => {
          if (ex.exerciseName?.toLowerCase().includes("squat") && ex.weight) {
            squatsPB = Math.max(squatsPB, parseInt(ex.weight));
          }
        });
      }
    });

    // Recent match
    const recentMatch = matches?.[0];

    // Consistency (percentage of days with training)
    const daysWithTraining = new Set(
      trainingSessions.map((s: any) => new Date(s.date).toDateString())
    ).size;
    const totalDays = Math.ceil((today.getTime() - new Date(trainingSessions[trainingSessions.length - 1]?.date).getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const consistency = Math.round((daysWithTraining / Math.max(totalDays, 7)) * 100);

    // Trend
    const recentSessions = trainingSessions.slice(0, 10);
    const avgRecentEffort = recentSessions.reduce((sum: number, s: any) => sum + (s.effortLevel || 0), 0) / recentSessions.length;
    const olderSessions = trainingSessions.slice(10, 20);
    const avgOlderEffort = olderSessions.length > 0 ? olderSessions.reduce((sum: number, s: any) => sum + (s.effortLevel || 0), 0) / olderSessions.length : avgRecentEffort;

    const trend = avgRecentEffort > avgOlderEffort ? "improving" : avgRecentEffort < avgOlderEffort ? "declining" : "steady";

    return {
      id: user.id.toString(),
      name: user.name || "Player",
      position: "Rugby Player",
      workoutsThisWeek,
      totalDistance: totalDistance.toFixed(1),
      personalBests: { pushups: pushupsPB, squats: squatsPB },
      recentMatch: recentMatch ? {
        opponent: recentMatch.opponent,
        result: recentMatch.result?.toUpperCase() || "N/A",
        score: recentMatch.finalScore || "N/A",
      } : null,
      consistency,
      trend,
    };
  }, [trainingSessions, matches, user]);

  const handleCoachLogin = () => {
    if (coachCode === "COACH2024") {
      setIsAuthenticated(true);
      if (playerStats) {
        setSelectedPlayer(playerStats.id);
      }
      toast.success("Coach portal access granted!");
    } else {
      toast.error("Invalid coach code");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-6 space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neon-pink neon-glow">
            Coach & Parent Portal
          </h1>
          <p className="text-muted-foreground">
            Access player performance data and training insights
          </p>
        </div>

        <Card className="card-neon p-8 max-w-md mx-auto">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neon-cyan">Coach Access</h2>
            <p className="text-sm text-muted-foreground">
              Enter your coach code to view player performance data
            </p>
            <div className="space-y-2">
              <Label className="text-foreground">Coach Code</Label>
              <Input
                type="password"
                placeholder="Enter code"
                value={coachCode}
                onChange={(e) => setCoachCode(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button
              onClick={handleCoachLogin}
              className="btn-neon w-full"
            >
              Access Portal
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Demo code: COACH2024
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="container py-6 space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neon-pink neon-glow">
            Coach & Parent Portal
          </h1>
          <p className="text-muted-foreground">
            Loading player data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Coach & Parent Portal
        </h1>
        <p className="text-muted-foreground">
          Live player performance data and training insights
        </p>
      </div>

      {/* Player Overview */}
      <Card className="card-neon p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neon-cyan">{playerStats.name}</h2>
            <p className="text-sm text-muted-foreground">{playerStats.position}</p>
          </div>
          <div className={`px-4 py-2 rounded font-bold ${playerStats.trend === "improving" ? "bg-green-500/20 text-green-400" : playerStats.trend === "declining" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
            {playerStats.trend.charAt(0).toUpperCase() + playerStats.trend.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-neon-pink">{playerStats.workoutsThisWeek}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold text-neon-cyan">{playerStats.totalDistance}</p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Consistency</p>
            <p className="text-2xl font-bold text-neon-purple">{playerStats.consistency}%</p>
            <p className="text-xs text-muted-foreground">Training Days</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Push-ups PB</p>
            <p className="text-2xl font-bold text-neon-pink">{playerStats.personalBests.pushups}</p>
            <p className="text-xs text-muted-foreground">Reps</p>
          </div>
        </div>
      </Card>

      {/* Recent Match */}
      {playerStats.recentMatch && (
        <Card className="card-neon p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-neon-cyan" size={24} />
            <h2 className="text-xl font-bold text-neon-cyan">Recent Match</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold">Opponent:</span>
              <span className="text-neon-pink">{playerStats.recentMatch.opponent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold">Result:</span>
              <span className={`font-bold ${playerStats.recentMatch.result === "WIN" ? "text-green-400" : playerStats.recentMatch.result === "LOSS" ? "text-red-400" : "text-yellow-400"}`}>
                {playerStats.recentMatch.result}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold">Score:</span>
              <span className="text-neon-cyan">{playerStats.recentMatch.score}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Insights */}
      <Card className="card-neon p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-neon-pink" size={24} />
          <h2 className="text-xl font-bold text-neon-pink">Performance Insights</h2>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-background rounded border border-border">
            <p className="text-foreground">
              {playerStats.trend === "improving" ? "✓ Player is showing improvement in training intensity and consistency." : playerStats.trend === "declining" ? "⚠ Player's effort level has decreased recently. Consider motivational check-in." : "→ Player maintaining steady performance level."}
            </p>
          </div>
          <div className="p-3 bg-background rounded border border-border">
            <p className="text-foreground">
              {playerStats.workoutsThisWeek >= 5 ? "✓ Excellent training frequency this week." : playerStats.workoutsThisWeek >= 3 ? "→ Good training frequency. Consider adding 1-2 more sessions." : "⚠ Below target training frequency. Recommend increasing sessions."}
            </p>
          </div>
          <div className="p-3 bg-background rounded border border-border">
            <p className="text-foreground">
              {playerStats.consistency >= 80 ? "✓ Outstanding training consistency." : playerStats.consistency >= 60 ? "→ Good consistency. Room for improvement." : "⚠ Consistency needs improvement. Establish regular training schedule."}
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Bests */}
      <Card className="card-neon p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-neon-cyan" size={24} />
          <h2 className="text-xl font-bold text-neon-cyan">Personal Bests</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground mb-1">Push-ups</p>
            <p className="text-2xl font-bold text-neon-pink">{playerStats.personalBests.pushups}</p>
            <p className="text-xs text-muted-foreground mt-1">reps</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground mb-1">Squats</p>
            <p className="text-2xl font-bold text-neon-cyan">{playerStats.personalBests.squats}</p>
            <p className="text-xs text-muted-foreground mt-1">kg</p>
          </div>
        </div>
      </Card>

      <Button
        onClick={() => {
          setIsAuthenticated(false);
          setCoachCode("");
        }}
        variant="outline"
        className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink/10"
      >
        Logout
      </Button>
    </div>
  );
}
