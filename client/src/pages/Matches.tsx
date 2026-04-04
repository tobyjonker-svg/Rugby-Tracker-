import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Matches() {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [opponent, setOpponent] = useState("");
  const [competition, setCompetition] = useState("");
  const [venue, setVenue] = useState("");
  const [homeAway, setHomeAway] = useState("home");
  const [position, setPosition] = useState("");
  const [minutesPlayed, setMinutesPlayed] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [result, setResult] = useState("win");
  const [notes, setNotes] = useState("");

  // Performance stats
  const [stats, setStats] = useState({
    tacklesMade: "",
    tacklesMissed: "",
    triesScored: "",
    conversionsKicked: "",
    penaltiesKicked: "",
    dropGoals: "",
    carries: "",
    metresGained: "",
    turnoversWon: "",
    offloads: "",
    passesCompleted: "",
    knockOns: "",
    penaltiesConceded: "",
    lineBreaks: "",
    assists: "",
    kicksFromHand: "",
  });

  const matchesMutation = trpc.matches.create.useMutation();
  const matchesList = trpc.matches.list.useQuery({ limit: 20 });

  const handleSubmit = async () => {
    if (!date || !opponent) {
      toast.error("Please fill in date and opponent");
      return;
    }

    try {
      await matchesMutation.mutateAsync({
        date: new Date(date),
        opponent,
        competition: competition || undefined,
        venue: venue || undefined,
        homeAway: (homeAway as "home" | "away") || undefined,
        position: position || undefined,
        minutesPlayed: minutesPlayed ? parseInt(minutesPlayed) : undefined,
        finalScore: finalScore || undefined,
        result: (result as "win" | "loss" | "draw") || undefined,
        notes: notes || undefined,
        performanceStats: {
          tacklesMade: stats.tacklesMade ? parseInt(stats.tacklesMade) : undefined,
          tacklesMissed: stats.tacklesMissed ? parseInt(stats.tacklesMissed) : undefined,
          triesScored: stats.triesScored ? parseInt(stats.triesScored) : undefined,
          conversionsKicked: stats.conversionsKicked
            ? parseInt(stats.conversionsKicked)
            : undefined,
          penaltiesKicked: stats.penaltiesKicked
            ? parseInt(stats.penaltiesKicked)
            : undefined,
          dropGoals: stats.dropGoals ? parseInt(stats.dropGoals) : undefined,
          carries: stats.carries ? parseInt(stats.carries) : undefined,
          metresGained: stats.metresGained ? parseInt(stats.metresGained) : undefined,
          turnoversWon: stats.turnoversWon ? parseInt(stats.turnoversWon) : undefined,
          offloads: stats.offloads ? parseInt(stats.offloads) : undefined,
          passesCompleted: stats.passesCompleted
            ? parseInt(stats.passesCompleted)
            : undefined,
          knockOns: stats.knockOns ? parseInt(stats.knockOns) : undefined,
          penaltiesConceded: stats.penaltiesConceded
            ? parseInt(stats.penaltiesConceded)
            : undefined,
          lineBreaks: stats.lineBreaks ? parseInt(stats.lineBreaks) : undefined,
          assists: stats.assists ? parseInt(stats.assists) : undefined,
          kicksFromHand: stats.kicksFromHand ? parseInt(stats.kicksFromHand) : undefined,
        },
      });

      toast.success("Match logged successfully!");
      setShowForm(false);
      setDate(new Date().toISOString().split("T")[0]);
      setOpponent("");
      setCompetition("");
      setVenue("");
      setHomeAway("home");
      setPosition("");
      setMinutesPlayed("");
      setFinalScore("");
      setResult("win");
      setNotes("");
      setStats({
        tacklesMade: "",
        tacklesMissed: "",
        triesScored: "",
        conversionsKicked: "",
        penaltiesKicked: "",
        dropGoals: "",
        carries: "",
        metresGained: "",
        turnoversWon: "",
        offloads: "",
        passesCompleted: "",
        knockOns: "",
        penaltiesConceded: "",
        lineBreaks: "",
        assists: "",
        kicksFromHand: "",
      });
      matchesList.refetch();
    } catch (error) {
      toast.error("Failed to log match");
    }
  };

  return (
    <div className="container py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Match Stats
        </h1>
        <p className="text-muted-foreground">
          Track your rugby match performance and statistics
        </p>
      </div>

      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="btn-neon"
        >
          <Plus size={18} className="mr-2" />
          Add Match
        </Button>
      )}

      {showForm && (
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-6">
            Log Match Performance
          </h2>

          <div className="space-y-4">
            {/* Basic Match Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground">Opponent *</Label>
                <Input
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="Team name"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Competition</Label>
                <Input
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  placeholder="League/Tournament"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground">Venue</Label>
                <Input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Stadium name"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-foreground">Home/Away</Label>
                <select
                  value={homeAway}
                  onChange={(e) => setHomeAway(e.target.value)}
                  className="w-full bg-input border border-border text-foreground rounded px-3 py-2"
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>
              <div>
                <Label className="text-foreground">Position</Label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g., Flanker"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground">Minutes Played</Label>
                <Input
                  type="number"
                  value={minutesPlayed}
                  onChange={(e) => setMinutesPlayed(e.target.value)}
                  placeholder="80"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Final Score</Label>
                <Input
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  placeholder="e.g., 28-21"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground">Result</Label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full bg-input border border-border text-foreground rounded px-3 py-2"
                >
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="draw">Draw</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-foreground">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Match highlights and observations..."
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* Performance Stats */}
            <div className="border-t border-border pt-4">
              <h3 className="font-bold text-neon-cyan mb-4">Performance Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setStats({ ...stats, [key]: e.target.value })
                      }
                      placeholder="0"
                      className="bg-input border-border text-foreground text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="btn-neon flex-1"
                disabled={matchesMutation.isPending}
              >
                {matchesMutation.isPending ? "Logging..." : "Log Match"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-border text-foreground hover:bg-background"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Matches */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Recent Matches</h2>
        {matchesList.isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : matchesList.data && matchesList.data.length > 0 ? (
          <div className="space-y-3">
            {matchesList.data.map((match) => (
              <div
                key={match.id}
                className="flex justify-between items-center p-4 bg-background rounded border border-border hover:border-neon-cyan transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-neon-cyan" />
                    <p className="font-semibold text-foreground">
                      vs {match.opponent}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(match.date).toLocaleDateString()} •{" "}
                    {match.competition || "Match"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neon-pink">{match.finalScore}</p>
                  <p
                    className={`text-sm font-semibold ${
                      match.result === "win"
                        ? "text-neon-cyan"
                        : match.result === "loss"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {match.result?.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No matches logged yet. Add your first match!
          </p>
        )}
      </Card>
    </div>
  );
}
