import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function CoachPortal() {
  const [coachCode, setCoachCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // Mock player data
  const players = [
    {
      id: "1",
      name: "Zander Vos",
      position: "Hooker",
      workoutsThisWeek: 5,
      totalDistance: 7.5,
      personalBests: { pushups: 45, squats: 120 },
      recentMatch: { opponent: "Central High", result: "WIN", score: "28-21" },
      consistency: 85,
      trend: "improving",
    },
    {
      id: "2",
      name: "James Smith",
      position: "Fly-half",
      workoutsThisWeek: 6,
      totalDistance: 12.3,
      personalBests: { pushups: 52, squats: 135 },
      recentMatch: { opponent: "Riverside", result: "WIN", score: "35-14" },
      consistency: 92,
      trend: "improving",
    },
    {
      id: "3",
      name: "Marcus Johnson",
      position: "Prop",
      workoutsThisWeek: 4,
      totalDistance: 5.2,
      personalBests: { pushups: 38, squats: 180 },
      recentMatch: { opponent: "Valley High", result: "LOSS", score: "21-24" },
      consistency: 72,
      trend: "steady",
    },
  ];

  const handleCoachLogin = () => {
    if (coachCode === "COACH2024") {
      setIsAuthenticated(true);
      toast.success("Coach portal access granted!");
    } else {
      toast.error("Invalid coach code");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-6 space-y-6">
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

  const currentPlayer = selectedPlayer
    ? players.find((p) => p.id === selectedPlayer)
    : players[0];

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Coach Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor player performance and training consistency
        </p>
      </div>

      {/* Player Selection */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Select Player</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {players.map((player) => (
            <Button
              key={player.id}
              onClick={() => setSelectedPlayer(player.id)}
              variant={selectedPlayer === player.id ? "default" : "outline"}
              className={selectedPlayer === player.id ? "btn-neon" : ""}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Player Overview */}
      {currentPlayer && (
        <>
          <Card className="card-neon p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentPlayer.name}
                  </h2>
                  <p className="text-muted-foreground">{currentPlayer.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Consistency</p>
                  <p className="text-2xl font-bold text-neon-cyan">
                    {currentPlayer.consistency}%
                  </p>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center gap-2 p-3 bg-background rounded border border-border">
                <TrendingUp size={20} className="text-neon-pink" />
                <div>
                  <p className="text-sm text-muted-foreground">Performance Trend</p>
                  <p className="font-bold text-foreground capitalize">
                    {currentPlayer.trend}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="card-neon p-4">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-neon-pink">
                {currentPlayer.workoutsThisWeek}
              </p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </Card>

            <Card className="card-neon p-4">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-2xl font-bold text-neon-cyan">
                {currentPlayer.totalDistance}
              </p>
              <p className="text-xs text-muted-foreground">km</p>
            </Card>

            <Card className="card-neon p-4">
              <p className="text-sm text-muted-foreground">Push-ups PB</p>
              <p className="text-2xl font-bold text-neon-purple">
                {currentPlayer.personalBests.pushups}
              </p>
              <p className="text-xs text-muted-foreground">reps</p>
            </Card>

            <Card className="card-neon p-4">
              <p className="text-sm text-muted-foreground">Squats PB</p>
              <p className="text-2xl font-bold text-neon-purple">
                {currentPlayer.personalBests.squats}
              </p>
              <p className="text-xs text-muted-foreground">kg</p>
            </Card>
          </div>

          {/* Recent Match */}
          <Card className="card-neon p-6">
            <h3 className="text-xl font-bold text-neon-cyan mb-4">Recent Match</h3>
            <div className="flex justify-between items-center p-4 bg-background rounded border border-border">
              <div>
                <p className="font-semibold text-foreground">
                  vs {currentPlayer.recentMatch.opponent}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentPlayer.recentMatch.score}
                </p>
              </div>
              <p
                className={`text-lg font-bold ${
                  currentPlayer.recentMatch.result === "WIN"
                    ? "text-neon-cyan"
                    : "text-destructive"
                }`}
              >
                {currentPlayer.recentMatch.result}
              </p>
            </div>
          </Card>

          {/* Performance Insights */}
          <Card className="card-neon p-6">
            <h3 className="text-xl font-bold text-neon-cyan mb-4">
              Performance Insights
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-background rounded border border-border">
                <p className="text-sm text-muted-foreground">Training Consistency</p>
                <div className="w-full bg-border rounded-full h-2 mt-2">
                  <div
                    className="bg-neon-cyan h-2 rounded-full"
                    style={{ width: `${currentPlayer.consistency}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-background rounded border border-border">
                <p className="text-sm text-muted-foreground">Weekly Activity</p>
                <p className="text-lg font-bold text-neon-pink mt-1">
                  {currentPlayer.workoutsThisWeek} sessions logged
                </p>
              </div>

              <div className="p-3 bg-background rounded border border-border">
                <p className="text-sm text-muted-foreground">Trend Status</p>
                <p className="text-lg font-bold text-neon-cyan mt-1 capitalize">
                  {currentPlayer.trend === "improving"
                    ? "📈 Improving"
                    : "➡️ Steady"}
                </p>
              </div>
            </div>
          </Card>

          {/* Team Comparison */}
          <Card className="card-neon p-6">
            <h3 className="text-xl font-bold text-neon-cyan mb-4">Team Comparison</h3>
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center p-3 bg-background rounded border border-border"
                >
                  <div>
                    <p className="font-semibold text-foreground">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.workoutsThisWeek} workouts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neon-cyan">{player.consistency}%</p>
                    <p className="text-xs text-muted-foreground">consistency</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
