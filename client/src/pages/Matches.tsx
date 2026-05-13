import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trophy, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Sport = "rugby" | "tennis" | "netball" | "cricket" | "hockey" | "golf" | "swimming";

const SPORTS: { value: Sport; label: string; emoji: string; color: string }[] = [
  { value: "rugby", label: "Rugby", emoji: "🏉", color: "neon-pink" },
  { value: "tennis", label: "Tennis", emoji: "🎾", color: "yellow-400" },
  { value: "netball", label: "Netball", emoji: "🏐", color: "orange-400" },
  { value: "cricket", label: "Cricket", emoji: "🏏", color: "green-400" },
  { value: "hockey", label: "Hockey", emoji: "🏑", color: "blue-400" },
  { value: "golf", label: "Golf", emoji: "⛳", color: "emerald-400" },
  { value: "swimming", label: "Swimming", emoji: "🏊", color: "sky-400" },
];

const SPORT_STATS: Record<Sport, { key: string; label: string }[]> = {
  rugby: [
    { key: "tackles", label: "Tackles Made" },
    { key: "tries", label: "Tries Scored" },
    { key: "assists", label: "Assists" },
    { key: "conversions", label: "Conversions" },
    { key: "penalties", label: "Penalties Kicked" },
    { key: "carries", label: "Carries" },
    { key: "meters", label: "Metres Gained" },
    { key: "offloads", label: "Offloads" },
  ],
  tennis: [
    { key: "setsWon", label: "Sets Won" },
    { key: "setsLost", label: "Sets Lost" },
    { key: "aces", label: "Aces" },
    { key: "doubleFaults", label: "Double Faults" },
  ],
  netball: [
    { key: "goalsScored", label: "Goals Scored" },
    { key: "goalAttempts", label: "Goal Attempts" },
    { key: "intercepts", label: "Intercepts" },
    { key: "rebounds", label: "Rebounds" },
  ],
  cricket: [
    { key: "runsScored", label: "Runs Scored" },
    { key: "ballsFaced", label: "Balls Faced" },
    { key: "wicketsTaken", label: "Wickets Taken" },
    { key: "oversBowled", label: "Overs Bowled" },
    { key: "catches", label: "Catches" },
  ],
  hockey: [
    { key: "goals", label: "Goals" },
    { key: "assists", label: "Assists" },
    { key: "shots", label: "Shots on Goal" },
    { key: "tackles", label: "Tackles" },
  ],
  golf: [
    { key: "holesPlayed", label: "Holes Played" },
    { key: "score", label: "Score (strokes)" },
    { key: "parScore", label: "Par Score" },
    { key: "fairwaysHit", label: "Fairways Hit" },
    { key: "greensInRegulation", label: "Greens in Regulation" },
  ],
  swimming: [
    { key: "distanceMeters", label: "Distance (m)" },
    { key: "timeSeconds", label: "Time (seconds)" },
    { key: "laps", label: "Laps" },
  ],
};

export default function Matches() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport>("rugby");
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
  const [sportStats, setSportStats] = useState<Record<string, string>>({});
  const [filterSport, setFilterSport] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const matchesMutation = trpc.matches.create.useMutation();
  const matchesList = trpc.matches.list.useQuery({ limit: 50 });
  const deleteMatch = trpc.matches.delete.useMutation({
    onSuccess: () => {
      toast.success("Match deleted!");
      setDeleteConfirm(null);
      matchesList.refetch();
    },
    onError: () => toast.error("Failed to delete match"),
  });

  const handleSportChange = (sport: Sport) => {
    setSelectedSport(sport);
    setSportStats({});
  };

  const handleSubmit = async () => {
    if (!date || !opponent) {
      toast.error("Please fill in date and opponent");
      return;
    }
    try {
      const numStats: Record<string, number> = {};
      Object.entries(sportStats).forEach(([k, v]) => {
        numStats[k] = v ? parseInt(v) : 0;
      });

      await matchesMutation.mutateAsync({
        date: new Date(date),
        sport: selectedSport,
        opponent,
        finalScore: finalScore || "",
        result: (result as "win" | "loss" | "draw") || "win",
        position: position || "",
        notes: notes || "",
        // Rugby stats
        tackles: numStats.tackles || 0,
        tries: numStats.tries || 0,
        assists: numStats.assists || 0,
        conversions: numStats.conversions || 0,
        penalties: numStats.penalties || 0,
        carries: numStats.carries || 0,
        meters: numStats.meters || 0,
        offloads: numStats.offloads || 0,
        // Tennis
        setsWon: numStats.setsWon || 0,
        setsLost: numStats.setsLost || 0,
        aces: numStats.aces || 0,
        doubleFaults: numStats.doubleFaults || 0,
        // Netball
        goalsScored: numStats.goalsScored || 0,
        goalAttempts: numStats.goalAttempts || 0,
        intercepts: numStats.intercepts || 0,
        // Cricket
        runsScored: numStats.runsScored || 0,
        wicketsTaken: numStats.wicketsTaken || 0,
        catches: numStats.catches || 0,
        // Hockey
        goals: numStats.goals || 0,
        shots: numStats.shots || 0,
        // Golf
        holesPlayed: numStats.holesPlayed || 0,
        score: numStats.score || 0,
        parScore: numStats.parScore || 0,
        // Swimming
        distanceMeters: numStats.distanceMeters || 0,
        timeSeconds: numStats.timeSeconds || 0,
      });

      toast.success("Match logged successfully!");
      setShowForm(false);
      setDate(new Date().toISOString().split("T")[0]);
      setOpponent(""); setCompetition(""); setVenue(""); setHomeAway("home");
      setPosition(""); setMinutesPlayed(""); setFinalScore(""); setResult("win");
      setNotes(""); setSportStats({});
      matchesList.refetch();
    } catch (error) {
      toast.error("Failed to log match");
    }
  };

  const filteredMatches = matchesList.data?.filter((m: any) =>
    filterSport === "all" || m.sport === filterSport
  ) || [];

  const sportInfo = SPORTS.find((s) => s.value === selectedSport)!;

  return (
    <div className="container py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">Match Stats</h1>
        <p className="text-muted-foreground">Track your performance across all school sports</p>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filterSport === "all" ? "default" : "outline"}
          onClick={() => setFilterSport("all")} className="text-xs">All Sports</Button>
        {SPORTS.map((s) => (
          <Button key={s.value} size="sm" variant={filterSport === s.value ? "default" : "outline"}
            onClick={() => setFilterSport(s.value)} className="text-xs">
            {s.emoji} {s.label}
          </Button>
        ))}
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="btn-neon">
          <Plus size={18} className="mr-2" /> Log Match
        </Button>
      )}

      {showForm && (
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-6">Log Match Performance</h2>

          {/* Sport Selector */}
          <div className="mb-6">
            <Label className="text-foreground mb-2 block">Select Sport</Label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <button key={s.value} onClick={() => handleSportChange(s.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    selectedSport === s.value
                      ? "bg-neon-pink/20 border-neon-pink text-neon-pink"
                      : "border-border text-muted-foreground hover:border-neon-cyan"
                  }`}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Basic Match Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Date</Label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <Label className="text-foreground">
                  {selectedSport === "golf" ? "Course Name" : selectedSport === "swimming" ? "Event / Meet" : "Opponent *"}
                </Label>
                <Input value={opponent} onChange={(e) => setOpponent(e.target.value)}
                  placeholder={selectedSport === "golf" ? "Course name" : selectedSport === "swimming" ? "Event name" : "Team name"}
                  className="bg-input border-border text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Competition / League</Label>
                <Input value={competition} onChange={(e) => setCompetition(e.target.value)}
                  placeholder="e.g., School League" className="bg-input border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Venue</Label>
                <Input value={venue} onChange={(e) => setVenue(e.target.value)}
                  placeholder="Location" className="bg-input border-border text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedSport !== "golf" && selectedSport !== "swimming" && (
                <div>
                  <Label className="text-foreground">Home/Away</Label>
                  <select value={homeAway} onChange={(e) => setHomeAway(e.target.value)}
                    className="w-full bg-input border border-border text-foreground rounded px-3 py-2">
                    <option value="home">Home</option>
                    <option value="away">Away</option>
                  </select>
                </div>
              )}
              <div>
                <Label className="text-foreground">Position / Role</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)}
                  placeholder={selectedSport === "swimming" ? "Stroke type" : "e.g., Forward"}
                  className="bg-input border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">
                  {selectedSport === "swimming" ? "Time (seconds)" : "Duration (minutes)"}
                </Label>
                <Input type="number" value={minutesPlayed} onChange={(e) => setMinutesPlayed(e.target.value)}
                  placeholder={selectedSport === "swimming" ? "e.g., 62" : "e.g., 80"}
                  className="bg-input border-border text-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">
                  {selectedSport === "golf" ? "Score" : selectedSport === "swimming" ? "Time / Distance" : "Final Score"}
                </Label>
                <Input value={finalScore} onChange={(e) => setFinalScore(e.target.value)}
                  placeholder={selectedSport === "golf" ? "e.g., 72" : selectedSport === "swimming" ? "e.g., 1:02.5" : "e.g., 28-21"}
                  className="bg-input border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Result</Label>
                <select value={result} onChange={(e) => setResult(e.target.value)}
                  className="w-full bg-input border border-border text-foreground rounded px-3 py-2">
                  <option value="win">Win ✅</option>
                  <option value="loss">Loss ❌</option>
                  <option value="draw">Draw 🤝</option>
                </select>
              </div>
            </div>

            {/* Sport-Specific Stats */}
            <div className="border-t border-border pt-4">
              <h3 className="font-bold text-neon-cyan mb-4">
                {sportInfo.emoji} {sportInfo.label} Performance Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SPORT_STATS[selectedSport].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input type="number" value={sportStats[key] || ""}
                      onChange={(e) => setSportStats({ ...sportStats, [key]: e.target.value })}
                      placeholder="0" className="bg-input border-border text-foreground text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-foreground">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Match highlights and observations..."
                className="bg-input border-border text-foreground" />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="btn-neon flex-1" disabled={matchesMutation.isPending}>
                {matchesMutation.isPending ? "Logging..." : `Log ${sportInfo.emoji} ${sportInfo.label} Match`}
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-border text-foreground">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Matches */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">
          Recent Matches {filterSport !== "all" && `— ${SPORTS.find(s => s.value === filterSport)?.emoji} ${SPORTS.find(s => s.value === filterSport)?.label}`}
        </h2>
        {matchesList.isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-3">
            {filteredMatches.map((match: any) => {
              const sport = SPORTS.find((s) => s.value === (match.sport || "rugby"));
              return (
                <div key={match.id}
                  className="flex justify-between items-center p-4 bg-background rounded border border-border hover:border-neon-cyan transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sport?.emoji || "🏉"}</span>
                      <p className="font-semibold text-foreground">vs {match.opponent}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neon-pink/10 text-neon-pink border border-neon-pink/30">
                        {sport?.label || "Rugby"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(match.date).toLocaleDateString()} • {match.competition || "Match"}
                    </p>
                    {match.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{match.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-neon-pink">{match.finalScore}</p>
                      <p className={`text-sm font-semibold ${
                        match.result === "win" ? "text-neon-cyan"
                          : match.result === "loss" ? "text-destructive"
                          : "text-muted-foreground"
                      }`}>
                        {match.result?.toUpperCase()}
                      </p>
                    </div>
                    {deleteConfirm === match.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => deleteMatch.mutate({ id: match.id })}
                          className="bg-destructive text-white hover:bg-destructive/90">Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(match.id)}
                        className="text-destructive hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No matches logged yet. Log your first match!</p>
        )}
      </Card>
    </div>
  );
}
