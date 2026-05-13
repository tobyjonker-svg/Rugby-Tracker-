import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, X, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ExerciseDropdown } from "@/components/ExerciseDropdown";
import { ConditioningExerciseDropdown } from "@/components/ConditioningExerciseDropdown";

const SPORT_TABS = [
  { value: "rugby", label: "🏉 Rugby", color: "red" },
  { value: "gym", label: "💪 Gym", color: "pink" },
  { value: "running", label: "🏃 Running", color: "cyan" },
  { value: "conditioning", label: "⚡ Conditioning", color: "purple" },
  { value: "tennis", label: "🎾 Tennis", color: "yellow" },
  { value: "netball", label: "🏐 Netball", color: "orange" },
  { value: "cricket", label: "🏏 Cricket", color: "green" },
  { value: "hockey", label: "🏑 Hockey", color: "blue" },
  { value: "golf", label: "⛳ Golf", color: "emerald" },
  { value: "swimming", label: "🏊 Swimming", color: "sky" },
];

export default function Training() {
  const [activeTab, setActiveTab] = useState("gym");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [effortLevel, setEffortLevel] = useState("5");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const trainingMutation = trpc.training.create.useMutation();
  const trainingList = trpc.training.list.useQuery({ limit: 100 });

  const deleteTraining = trpc.training.delete.useMutation({
    onSuccess: () => {
      toast.success("Training session deleted!");
      setDeleteConfirm(null);
      trainingList.refetch();
    },
    onError: () => {
      toast.error("Failed to delete training session");
    },
  });

  // Gym state
  const [gymExercises, setGymExercises] = useState<
    Array<{ exerciseName: string; sets: string; reps: string; weight: string; notes: string }>
  >([{ exerciseName: "", sets: "", reps: "", weight: "", notes: "" }]);

  // Running state
  const [runningData, setRunningData] = useState({
    distance: "", time: "", sprintDistance: "", numberOfSprints: "", bestSprintTime: "",
  });

  // Conditioning state
  const [conditioningExercises, setConditioningExercises] = useState<
    Array<{ exerciseType: string; reps: string; time: string; notes: string }>
  >([{ exerciseType: "pushups", reps: "", time: "", notes: "" }]);

  // Tennis state
  const [tennisData, setTennisData] = useState({
    setsWon: "", setsLost: "", aces: "", doubleFaults: "", duration: "",
  });

  // Netball state
  const [netballData, setNetballData] = useState({
    goalsScored: "", goalAttempts: "", intercepts: "", rebounds: "", duration: "",
  });

  // Cricket state
  const [cricketData, setCricketData] = useState({
    runsScored: "", ballsFaced: "", wicketsTaken: "", oversBowled: "", catches: "", duration: "",
  });

  // Hockey state
  const [hockeyData, setHockeyData] = useState({
    goals: "", assists: "", shots: "", tackles: "", duration: "",
  });

  // Golf state
  const [golfData, setGolfData] = useState({
    holesPlayed: "", score: "", parScore: "", fairwaysHit: "", greensInRegulation: "",
  });

  // Swimming state
  const [swimmingData, setSwimmingData] = useState({
    strokeType: "freestyle", distanceMeters: "", timeSeconds: "", laps: "", poolLength: "25",
  });

  const getExerciseHistory = () => {
    const exercises = new Set<string>();
    trainingList.data?.forEach((session: any) => {
      if (session.notes) exercises.add(session.notes);
    });
    return Array.from(exercises).sort();
  };
  const exerciseHistory = getExerciseHistory();

  const filteredSessions = trainingList.data?.filter((session: any) => {
    const sessionDate = new Date(session.date);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    const typeMatch = filterType === "all" || session.type === filterType;
    const dateMatch =
      (!startDate || sessionDate >= startDate) && (!endDate || sessionDate <= endDate);
    return typeMatch && dateMatch;
  }) || [];

  const exportToCSV = () => {
    if (!filteredSessions.length) { toast.error("No sessions to export"); return; }
    const headers = ["Date", "Type", "Effort Level", "Notes"];
    const rows = filteredSessions.map((session: any) => [
      new Date(session.date).toLocaleDateString(),
      session.type.replace(/_/g, " "),
      session.effortLevel,
      session.notes || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Training log exported!");
  };

  const resetCommon = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setEffortLevel("5");
    setNotes("");
    trainingList.refetch();
  };

  const handleSubmitGym = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "gym", effortLevel: parseInt(effortLevel),
        notes: `Gym: ${gymExercises.map((e) => e.exerciseName).join(", ")}`,
      });
      toast.success("Gym session logged!");
      setGymExercises([{ exerciseName: "", sets: "", reps: "", weight: "", notes: "" }]);
      resetCommon();
    } catch { toast.error("Failed to log gym session"); }
  };

  const handleSubmitRunning = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "running", effortLevel: parseInt(effortLevel),
        notes: `Running: ${runningData.distance}km in ${runningData.time}min`,
      });
      toast.success("Running session logged!");
      setRunningData({ distance: "", time: "", sprintDistance: "", numberOfSprints: "", bestSprintTime: "" });
      resetCommon();
    } catch { toast.error("Failed to log running session"); }
  };

  const handleSubmitConditioning = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "conditioning", effortLevel: parseInt(effortLevel),
        notes: `Conditioning: ${conditioningExercises.map((e) => e.exerciseType).join(", ")}`,
      });
      toast.success("Conditioning session logged!");
      setConditioningExercises([{ exerciseType: "pushups", reps: "", time: "", notes: "" }]);
      resetCommon();
    } catch { toast.error("Failed to log conditioning session"); }
  };

  const handleSubmitTennis = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "tennis", effortLevel: parseInt(effortLevel),
        notes: `Tennis: Sets ${tennisData.setsWon}-${tennisData.setsLost}, Aces: ${tennisData.aces}, Double Faults: ${tennisData.doubleFaults}`,
      });
      toast.success("Tennis session logged!");
      setTennisData({ setsWon: "", setsLost: "", aces: "", doubleFaults: "", duration: "" });
      resetCommon();
    } catch { toast.error("Failed to log tennis session"); }
  };

  const handleSubmitNetball = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "netball", effortLevel: parseInt(effortLevel),
        notes: `Netball: Goals ${netballData.goalsScored}/${netballData.goalAttempts}, Intercepts: ${netballData.intercepts}`,
      });
      toast.success("Netball session logged!");
      setNetballData({ goalsScored: "", goalAttempts: "", intercepts: "", rebounds: "", duration: "" });
      resetCommon();
    } catch { toast.error("Failed to log netball session"); }
  };

  const handleSubmitCricket = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "cricket", effortLevel: parseInt(effortLevel),
        notes: `Cricket: Runs ${cricketData.runsScored} (${cricketData.ballsFaced} balls), Wickets: ${cricketData.wicketsTaken}`,
      });
      toast.success("Cricket session logged!");
      setCricketData({ runsScored: "", ballsFaced: "", wicketsTaken: "", oversBowled: "", catches: "", duration: "" });
      resetCommon();
    } catch { toast.error("Failed to log cricket session"); }
  };

  const handleSubmitHockey = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "hockey", effortLevel: parseInt(effortLevel),
        notes: `Hockey: Goals ${hockeyData.goals}, Assists: ${hockeyData.assists}, Shots: ${hockeyData.shots}, Tackles: ${hockeyData.tackles}`,
      });
      toast.success("Hockey session logged!");
      setHockeyData({ goals: "", assists: "", shots: "", tackles: "", duration: "" });
      resetCommon();
    } catch { toast.error("Failed to log hockey session"); }
  };

  const handleSubmitGolf = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "golf", effortLevel: parseInt(effortLevel),
        notes: `Golf: ${golfData.holesPlayed} holes, Score: ${golfData.score} (Par: ${golfData.parScore})`,
      });
      toast.success("Golf round logged!");
      setGolfData({ holesPlayed: "", score: "", parScore: "", fairwaysHit: "", greensInRegulation: "" });
      resetCommon();
    } catch { toast.error("Failed to log golf round"); }
  };

  const handleSubmitSwimming = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "swimming", effortLevel: parseInt(effortLevel),
        notes: `Swimming: ${swimmingData.distanceMeters}m ${swimmingData.strokeType} in ${swimmingData.timeSeconds}s`,
      });
      toast.success("Swimming session logged!");
      setSwimmingData({ strokeType: "freestyle", distanceMeters: "", timeSeconds: "", laps: "", poolLength: "25" });
      resetCommon();
    } catch { toast.error("Failed to log swimming session"); }
  };

  // Rugby state
  const [rugbyData, setRugbyData] = useState({
    tackles: "", tries: "", assists: "", conversions: "", penalties: "",
    carries: "", meters: "", offloads: "", duration: "",
  });

  const handleSubmitRugby = async () => {
    if (!date) { toast.error("Please fill in date"); return; }
    try {
      await trainingMutation.mutateAsync({
        date: new Date(date), type: "rugby" as any, effortLevel: parseInt(effortLevel),
        notes: `Rugby: Tackles ${rugbyData.tackles}, Tries ${rugbyData.tries}, Assists ${rugbyData.assists}, Carries ${rugbyData.carries}, Meters ${rugbyData.meters}`,
      });
      toast.success("Rugby session logged!");
      setRugbyData({ tackles: "", tries: "", assists: "", conversions: "", penalties: "", carries: "", meters: "", offloads: "", duration: "" });
      resetCommon();
    } catch { toast.error("Failed to log rugby session"); }
  };

  const inputClass = "bg-gray-800 border-gray-600 text-white";
  const labelClass = "text-gray-300";

  const SportField = ({ label, value, onChange, type = "number", placeholder = "" }: any) => (
    <div>
      <Label className={labelClass}>{label}</Label>
      <Input type={type} placeholder={placeholder || label} value={value}
        onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );

  const CommonFields = ({ borderColor }: { borderColor: string }) => (
    <>
      <div>
        <Label className={labelClass}>Date</Label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className={`bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500`} />
      </div>
      <div>
        <Label className={labelClass}>Effort Level (1-10)</Label>
        <Input type="number" min="1" max="10" value={effortLevel}
          onChange={(e) => setEffortLevel(e.target.value)}
          className={`bg-gray-800 border-${borderColor}-500/30 text-white`} />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-500">
          Training Log
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-10 bg-gray-900 border border-pink-500/30 mb-2 h-auto gap-1 p-1">
            {SPORT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-xs py-2">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* RUGBY TAB */}
          <TabsContent value="rugby">
            <Card className="bg-gray-900 border border-red-500/30 p-6">
              <h2 className="text-2xl font-bold text-red-400 mb-6">🏉 Log Rugby Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="red" />
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Attack</p>
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Tries" value={rugbyData.tries} onChange={(v: string) => setRugbyData({ ...rugbyData, tries: v })} />
                  <SportField label="Assists" value={rugbyData.assists} onChange={(v: string) => setRugbyData({ ...rugbyData, assists: v })} />
                  <SportField label="Carries" value={rugbyData.carries} onChange={(v: string) => setRugbyData({ ...rugbyData, carries: v })} />
                  <SportField label="Meters Made" value={rugbyData.meters} onChange={(v: string) => setRugbyData({ ...rugbyData, meters: v })} />
                  <SportField label="Offloads" value={rugbyData.offloads} onChange={(v: string) => setRugbyData({ ...rugbyData, offloads: v })} />
                </div>
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Defence &amp; Kicking</p>
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Tackles" value={rugbyData.tackles} onChange={(v: string) => setRugbyData({ ...rugbyData, tackles: v })} />
                  <SportField label="Conversions" value={rugbyData.conversions} onChange={(v: string) => setRugbyData({ ...rugbyData, conversions: v })} />
                  <SportField label="Penalties Kicked" value={rugbyData.penalties} onChange={(v: string) => setRugbyData({ ...rugbyData, penalties: v })} />
                  <SportField label="Duration (minutes)" value={rugbyData.duration} onChange={(v: string) => setRugbyData({ ...rugbyData, duration: v })} />
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Match notes, position played, opposition..." className="bg-gray-800 border-red-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitRugby} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Rugby Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* GYM TAB */}
          <TabsContent value="gym">
            <Card className="bg-gray-900 border border-pink-500/30 p-6">
              <h2 className="text-2xl font-bold text-pink-400 mb-6">💪 Log Gym Workout</h2>
              <div className="space-y-4">
                <CommonFields borderColor="pink" />
                <div>
                  <Label className={labelClass}>Exercises</Label>
                  {gymExercises.map((exercise, index) => (
                    <div key={index} className="space-y-2 mb-4 p-4 bg-gray-800 rounded border border-pink-500/20">
                      <ExerciseDropdown value={exercise.exerciseName}
                        onChange={(value) => { const u = [...gymExercises]; u[index].exerciseName = value; setGymExercises(u); }}
                        exerciseHistory={exerciseHistory} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder="Sets" value={exercise.sets}
                          onChange={(e) => { const u = [...gymExercises]; u[index].sets = e.target.value; setGymExercises(u); }}
                          className="bg-gray-700 border-pink-500/30 text-white" />
                        <Input type="number" placeholder="Reps" value={exercise.reps}
                          onChange={(e) => { const u = [...gymExercises]; u[index].reps = e.target.value; setGymExercises(u); }}
                          className="bg-gray-700 border-pink-500/30 text-white" />
                        <Input type="number" placeholder="Weight (kg)" value={exercise.weight}
                          onChange={(e) => { const u = [...gymExercises]; u[index].weight = e.target.value; setGymExercises(u); }}
                          className="bg-gray-700 border-pink-500/30 text-white" />
                      </div>
                      {gymExercises.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setGymExercises(gymExercises.filter((_, i) => i !== index))} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setGymExercises([...gymExercises, { exerciseName: "", sets: "", reps: "", weight: "", notes: "" }])}
                    className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
                    <Plus className="w-4 h-4 mr-2" /> Add Exercise
                  </Button>
                </div>
                <Button onClick={handleSubmitGym} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Gym Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* RUNNING TAB */}
          <TabsContent value="running">
            <Card className="bg-gray-900 border border-cyan-500/30 p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">🏃 Log Running Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="cyan" />
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Distance (km)" value={runningData.distance} onChange={(v: string) => setRunningData({ ...runningData, distance: v })} />
                  <SportField label="Time (minutes)" value={runningData.time} onChange={(v: string) => setRunningData({ ...runningData, time: v })} />
                  <SportField label="Sprint Distance (km)" value={runningData.sprintDistance} onChange={(v: string) => setRunningData({ ...runningData, sprintDistance: v })} />
                  <SportField label="Number of Sprints" value={runningData.numberOfSprints} onChange={(v: string) => setRunningData({ ...runningData, numberOfSprints: v })} />
                  <SportField label="Best Sprint Time (s)" value={runningData.bestSprintTime} onChange={(v: string) => setRunningData({ ...runningData, bestSprintTime: v })} />
                </div>
                <Button onClick={handleSubmitRunning} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Running Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* CONDITIONING TAB */}
          <TabsContent value="conditioning">
            <Card className="bg-gray-900 border border-purple-500/30 p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">⚡ Log Conditioning</h2>
              <div className="space-y-4">
                <CommonFields borderColor="purple" />
                <div>
                  <Label className={labelClass}>Exercises</Label>
                  {conditioningExercises.map((exercise, index) => (
                    <div key={index} className="space-y-2 mb-4 p-4 bg-gray-800 rounded border border-purple-500/20">
                      <ConditioningExerciseDropdown value={exercise.exerciseType}
                        onChange={(value) => { const u = [...conditioningExercises]; u[index].exerciseType = value; setConditioningExercises(u); }}
                        exercises={["pushups", "burpees", "planks", "mountain climbers", "jumping jacks", "box jumps", "dips", "pull-ups", "squats", "lunges", "sit-ups", "plank holds"]} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Reps" value={exercise.reps}
                          onChange={(e) => { const u = [...conditioningExercises]; u[index].reps = e.target.value; setConditioningExercises(u); }}
                          className="bg-gray-700 border-purple-500/30 text-white" />
                        <Input type="number" placeholder="Time (seconds)" value={exercise.time}
                          onChange={(e) => { const u = [...conditioningExercises]; u[index].time = e.target.value; setConditioningExercises(u); }}
                          className="bg-gray-700 border-purple-500/30 text-white" />
                      </div>
                      {conditioningExercises.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setConditioningExercises(conditioningExercises.filter((_, i) => i !== index))} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setConditioningExercises([...conditioningExercises, { exerciseType: "pushups", reps: "", time: "", notes: "" }])}
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    <Plus className="w-4 h-4 mr-2" /> Add Exercise
                  </Button>
                </div>
                <Button onClick={handleSubmitConditioning} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Conditioning Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TENNIS TAB */}
          <TabsContent value="tennis">
            <Card className="bg-gray-900 border border-yellow-500/30 p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">🎾 Log Tennis Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="yellow" />
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Sets Won" value={tennisData.setsWon} onChange={(v: string) => setTennisData({ ...tennisData, setsWon: v })} />
                  <SportField label="Sets Lost" value={tennisData.setsLost} onChange={(v: string) => setTennisData({ ...tennisData, setsLost: v })} />
                  <SportField label="Aces" value={tennisData.aces} onChange={(v: string) => setTennisData({ ...tennisData, aces: v })} />
                  <SportField label="Double Faults" value={tennisData.doubleFaults} onChange={(v: string) => setTennisData({ ...tennisData, doubleFaults: v })} />
                  <SportField label="Duration (minutes)" value={tennisData.duration} onChange={(v: string) => setTennisData({ ...tennisData, duration: v })} />
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Match notes, opponent info..." className="bg-gray-800 border-yellow-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitTennis} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Tennis Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* NETBALL TAB */}
          <TabsContent value="netball">
            <Card className="bg-gray-900 border border-orange-500/30 p-6">
              <h2 className="text-2xl font-bold text-orange-400 mb-6">🏐 Log Netball Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="orange" />
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Goals Scored" value={netballData.goalsScored} onChange={(v: string) => setNetballData({ ...netballData, goalsScored: v })} />
                  <SportField label="Goal Attempts" value={netballData.goalAttempts} onChange={(v: string) => setNetballData({ ...netballData, goalAttempts: v })} />
                  <SportField label="Intercepts" value={netballData.intercepts} onChange={(v: string) => setNetballData({ ...netballData, intercepts: v })} />
                  <SportField label="Rebounds" value={netballData.rebounds} onChange={(v: string) => setNetballData({ ...netballData, rebounds: v })} />
                  <SportField label="Duration (minutes)" value={netballData.duration} onChange={(v: string) => setNetballData({ ...netballData, duration: v })} />
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Match notes, position played..." className="bg-gray-800 border-orange-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitNetball} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Netball Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* CRICKET TAB */}
          <TabsContent value="cricket">
            <Card className="bg-gray-900 border border-green-500/30 p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">🏏 Log Cricket Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="green" />
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Batting</p>
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Runs Scored" value={cricketData.runsScored} onChange={(v: string) => setCricketData({ ...cricketData, runsScored: v })} />
                  <SportField label="Balls Faced" value={cricketData.ballsFaced} onChange={(v: string) => setCricketData({ ...cricketData, ballsFaced: v })} />
                </div>
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Bowling</p>
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Wickets Taken" value={cricketData.wicketsTaken} onChange={(v: string) => setCricketData({ ...cricketData, wicketsTaken: v })} />
                  <SportField label="Overs Bowled" value={cricketData.oversBowled} onChange={(v: string) => setCricketData({ ...cricketData, oversBowled: v })} />
                </div>
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Fielding</p>
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Catches" value={cricketData.catches} onChange={(v: string) => setCricketData({ ...cricketData, catches: v })} />
                  <SportField label="Duration (minutes)" value={cricketData.duration} onChange={(v: string) => setCricketData({ ...cricketData, duration: v })} />
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Match notes, pitch conditions..." className="bg-gray-800 border-green-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitCricket} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Cricket Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* HOCKEY TAB */}
          <TabsContent value="hockey">
            <Card className="bg-gray-900 border border-blue-500/30 p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">🏑 Log Hockey Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="blue" />
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Goals" value={hockeyData.goals} onChange={(v: string) => setHockeyData({ ...hockeyData, goals: v })} />
                  <SportField label="Assists" value={hockeyData.assists} onChange={(v: string) => setHockeyData({ ...hockeyData, assists: v })} />
                  <SportField label="Shots on Goal" value={hockeyData.shots} onChange={(v: string) => setHockeyData({ ...hockeyData, shots: v })} />
                  <SportField label="Tackles Made" value={hockeyData.tackles} onChange={(v: string) => setHockeyData({ ...hockeyData, tackles: v })} />
                  <SportField label="Duration (minutes)" value={hockeyData.duration} onChange={(v: string) => setHockeyData({ ...hockeyData, duration: v })} />
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Match notes, position played..." className="bg-gray-800 border-blue-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitHockey} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Hockey Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* GOLF TAB */}
          <TabsContent value="golf">
            <Card className="bg-gray-900 border border-emerald-500/30 p-6">
              <h2 className="text-2xl font-bold text-emerald-400 mb-6">⛳ Log Golf Round</h2>
              <div className="space-y-4">
                <CommonFields borderColor="emerald" />
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Holes Played" value={golfData.holesPlayed} onChange={(v: string) => setGolfData({ ...golfData, holesPlayed: v })} />
                  <SportField label="Score (strokes)" value={golfData.score} onChange={(v: string) => setGolfData({ ...golfData, score: v })} />
                  <SportField label="Par Score" value={golfData.parScore} onChange={(v: string) => setGolfData({ ...golfData, parScore: v })} />
                  <SportField label="Fairways Hit" value={golfData.fairwaysHit} onChange={(v: string) => setGolfData({ ...golfData, fairwaysHit: v })} />
                  <SportField label="Greens in Regulation" value={golfData.greensInRegulation} onChange={(v: string) => setGolfData({ ...golfData, greensInRegulation: v })} />
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Course name, weather conditions..." className="bg-gray-800 border-emerald-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitGolf} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Golf Round"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* SWIMMING TAB */}
          <TabsContent value="swimming">
            <Card className="bg-gray-900 border border-sky-500/30 p-6">
              <h2 className="text-2xl font-bold text-sky-400 mb-6">🏊 Log Swimming Session</h2>
              <div className="space-y-4">
                <CommonFields borderColor="sky" />
                <div>
                  <Label className={labelClass}>Stroke Type</Label>
                  <select value={swimmingData.strokeType} onChange={(e) => setSwimmingData({ ...swimmingData, strokeType: e.target.value })}
                    className="w-full bg-gray-800 border border-sky-500/30 text-white p-2 rounded">
                    <option value="freestyle">Freestyle</option>
                    <option value="backstroke">Backstroke</option>
                    <option value="breaststroke">Breaststroke</option>
                    <option value="butterfly">Butterfly</option>
                    <option value="medley">Medley</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SportField label="Distance (meters)" value={swimmingData.distanceMeters} onChange={(v: string) => setSwimmingData({ ...swimmingData, distanceMeters: v })} />
                  <SportField label="Time (seconds)" value={swimmingData.timeSeconds} onChange={(v: string) => setSwimmingData({ ...swimmingData, timeSeconds: v })} />
                  <SportField label="Laps" value={swimmingData.laps} onChange={(v: string) => setSwimmingData({ ...swimmingData, laps: v })} />
                  <div>
                    <Label className={labelClass}>Pool Length (m)</Label>
                    <select value={swimmingData.poolLength} onChange={(e) => setSwimmingData({ ...swimmingData, poolLength: e.target.value })}
                      className="w-full bg-gray-800 border border-sky-500/30 text-white p-2 rounded">
                      <option value="25">25m</option>
                      <option value="50">50m</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className={labelClass}>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Session notes, times per lap..." className="bg-gray-800 border-sky-500/30 text-white" />
                </div>
                <Button onClick={handleSubmitSwimming} disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold">
                  {trainingMutation.isPending ? "Logging..." : "Log Swimming Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FILTERS & RECENT SESSIONS */}
        <Card className="bg-gray-900 border border-gray-700 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-300 mb-6">Recent Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-gray-400">Filter by Sport</Label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded">
                <option value="all">All Sports</option>
                <option value="gym">💪 Gym</option>
                <option value="running">🏃 Running</option>
                <option value="conditioning">⚡ Conditioning</option>
                <option value="tennis">🎾 Tennis</option>
                <option value="netball">🏐 Netball</option>
                <option value="cricket">🏏 Cricket</option>
                <option value="hockey">🏑 Hockey</option>
                <option value="golf">⛳ Golf</option>
                <option value="swimming">🏊 Swimming</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-400">Start Date</Label>
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
            <div>
              <Label className="text-gray-400">End Date</Label>
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
            </div>
          </div>

          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white font-bold mb-6">
            📥 Export to CSV
          </Button>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <p className="text-gray-400">No training sessions found</p>
            ) : (
              filteredSessions.map((session: any) => {
                const sportEmoji: Record<string, string> = {
                  gym: "💪", running: "🏃", conditioning: "⚡", tennis: "🎾",
                  netball: "🏐", cricket: "🏏", hockey: "🏑", golf: "⛳", swimming: "🏊",
                  rugby_practice: "🏉", recovery: "😴", speed_work: "⚡", skills_practice: "🎯", other: "📋",
                };
                return (
                  <div key={session.id} className="bg-gray-800 border border-gray-700 p-4 rounded flex justify-between items-center">
                    <div>
                      <p className="text-gray-300">
                        <strong>{new Date(session.date).toLocaleDateString()}</strong> —{" "}
                        <span className="text-cyan-400 capitalize">
                          {sportEmoji[session.type] || "📋"} {session.type.replace(/_/g, " ")}
                        </span>
                      </p>
                      <p className="text-gray-500 text-sm">Effort: {session.effortLevel}/10</p>
                      {session.notes && <p className="text-gray-400 text-sm">{session.notes}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(session.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {deleteConfirm === session.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="bg-gray-900 border border-red-500 p-6">
                          <p className="text-white mb-4">Delete this session?</p>
                          <div className="flex gap-2">
                            <Button onClick={() => deleteTraining.mutate({ id: session.id })} className="bg-red-600 hover:bg-red-700">Delete</Button>
                            <Button onClick={() => setDeleteConfirm(null)} className="bg-gray-700 hover:bg-gray-600">Cancel</Button>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
