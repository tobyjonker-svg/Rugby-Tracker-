import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ExerciseDropdown } from "@/components/ExerciseDropdown";

export default function Training() {
  const [activeTab, setActiveTab] = useState("gym");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [effortLevel, setEffortLevel] = useState("5");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState<"all" | "gym" | "running" | "conditioning">("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Gym state
  const [gymExercises, setGymExercises] = useState<
    Array<{ exerciseName: string; sets: string; reps: string; weight: string; notes: string }>
  >([
    { exerciseName: "", sets: "", reps: "", weight: "", notes: "" },
  ]);

  // Running state
  const [runningData, setRunningData] = useState({
    distance: "",
    time: "",
    sprintDistance: "",
    numberOfSprints: "",
    bestSprintTime: "",
  });

  // Conditioning state
  const [conditioningExercises, setConditioningExercises] = useState<
    Array<{ exerciseType: string; reps: string; time: string; notes: string }>
  >([
    { exerciseType: "pushups", reps: "", time: "", notes: "" },
  ]);

  const trainingMutation = trpc.training.create.useMutation();
  const trainingList = trpc.training.list.useQuery({ limit: 20 });

  // Extract unique exercises from training history
  const getExerciseHistory = () => {
    const exercises = new Set<string>();
    trainingList.data?.forEach((session: any) => {
      if (session.gymExercises) {
        session.gymExercises.forEach((ex: any) => {
          if (ex.exerciseName) exercises.add(ex.exerciseName);
        });
      }
    });
    return Array.from(exercises).sort();
  };

  const exerciseHistory = getExerciseHistory();

  // Filter training sessions
  const filteredSessions = trainingList.data?.filter((session: any) => {
    const sessionDate = new Date(session.date);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    const typeMatch = filterType === "all" || session.type === filterType;
    const dateMatch =
      (!startDate || sessionDate >= startDate) &&
      (!endDate || sessionDate <= endDate);

    return typeMatch && dateMatch;
  }) || [];

  // CSV Export function
  const exportToCSV = () => {
    if (!filteredSessions.length) {
      toast.error("No sessions to export");
      return;
    }

    const headers = [
      "Date",
      "Type",
      "Duration (min)",
      "Effort Level",
      "Notes",
    ];
    const rows = filteredSessions.map((session: any) => [
      new Date(session.date).toLocaleDateString(),
      session.type.replace("_", " "),
      session.duration,
      session.effortLevel,
      session.notes || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `training-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Training log exported!");
  };

  const handleAddGymExercise = () => {
    setGymExercises([
      ...gymExercises,
      { exerciseName: "", sets: "", reps: "", weight: "", notes: "" } as any,
    ]);
  };

  const handleRemoveGymExercise = (index: number) => {
    setGymExercises(gymExercises.filter((_, i) => i !== index));
  };

  const handleAddConditioningExercise = () => {
    setConditioningExercises([
      ...conditioningExercises,
      { exerciseType: "pushups", reps: "", time: "", notes: "" } as any,
    ]);
  };

  const handleRemoveConditioningExercise = (index: number) => {
    setConditioningExercises(
      conditioningExercises.filter((_, i) => i !== index)
    );
  };

  const handleSubmitGym = async () => {
    if (!date || !duration) {
      toast.error("Please fill in date and duration");
      return;
    }

    try {
      await trainingMutation.mutateAsync({
        date: new Date(date),
        type: "gym",
        duration: parseInt(duration),
        effortLevel: parseInt(effortLevel),
        notes: notes || undefined,
        gymExercises: gymExercises
          .filter((e) => e.exerciseName)
          .map((e) => ({
            exerciseName: e.exerciseName,
            sets: e.sets ? parseInt(e.sets) : undefined,
            reps: e.reps ? parseInt(e.reps) : undefined,
            weight: e.weight ? parseFloat(e.weight) : undefined,
            notes: e.notes || undefined,
          })),
      });

      toast.success("Gym session logged!");
      setDate(new Date().toISOString().split("T")[0]);
      setDuration("");
      setEffortLevel("5");
      setNotes("");
      setGymExercises([
        { exerciseName: "", sets: "", reps: "", weight: "", notes: "" },
      ]);
      trainingList.refetch();
    } catch (error) {
      toast.error("Failed to log training session");
    }
  };

  const handleSubmitRunning = async () => {
    if (!date || !duration) {
      toast.error("Please fill in date and duration");
      return;
    }

    try {
      await trainingMutation.mutateAsync({
        date: new Date(date),
        type: "running",
        duration: parseInt(duration),
        effortLevel: parseInt(effortLevel),
        notes: notes || undefined,
        runningData: {
          distance: runningData.distance
            ? parseFloat(runningData.distance)
            : undefined,
          time: runningData.time ? parseInt(runningData.time) : undefined,
          sprintDistance: runningData.sprintDistance
            ? parseFloat(runningData.sprintDistance)
            : undefined,
          numberOfSprints: runningData.numberOfSprints
            ? parseInt(runningData.numberOfSprints)
            : undefined,
          bestSprintTime: runningData.bestSprintTime
            ? parseInt(runningData.bestSprintTime)
            : undefined,
        },
      });

      toast.success("Running session logged!");
      setDate(new Date().toISOString().split("T")[0]);
      setDuration("");
      setEffortLevel("5");
      setNotes("");
      setRunningData({
        distance: "",
        time: "",
        sprintDistance: "",
        numberOfSprints: "",
        bestSprintTime: "",
      });
      trainingList.refetch();
    } catch (error) {
      toast.error("Failed to log training session");
    }
  };

  const handleSubmitConditioning = async () => {
    if (!date || !duration) {
      toast.error("Please fill in date and duration");
      return;
    }

    try {
      await trainingMutation.mutateAsync({
        date: new Date(date),
        type: "conditioning",
        duration: parseInt(duration),
        effortLevel: parseInt(effortLevel),
        notes: notes || undefined,
        conditioningExercises: conditioningExercises
          .filter((e) => e.reps || e.time)
          .map((e) => ({
            exerciseType: e.exerciseType as any,
            reps: e.reps ? parseInt(e.reps) : undefined,
            time: e.time ? parseInt(e.time) : undefined,
            notes: e.notes || undefined,
          })),
      });

      toast.success("Conditioning session logged!");
      setDate(new Date().toISOString().split("T")[0]);
      setDuration("");
      setEffortLevel("5");
      setNotes("");
      setConditioningExercises([
        { exerciseType: "pushups", reps: "", time: "", notes: "" },
      ]);
      trainingList.refetch();
    } catch (error) {
      toast.error("Failed to log training session");
    }
  };

  return (
    <div className="container py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Training Log
        </h1>
        <p className="text-muted-foreground">
          Track your gym, running, and conditioning sessions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border hud-border">
          <TabsTrigger value="gym" className="data-[state=active]:text-neon-pink">
            💪 Gym
          </TabsTrigger>
          <TabsTrigger
            value="running"
            className="data-[state=active]:text-neon-pink"
          >
            🏃 Running
          </TabsTrigger>
          <TabsTrigger
            value="conditioning"
            className="data-[state=active]:text-neon-pink"
          >
            🔥 Conditioning
          </TabsTrigger>
        </TabsList>

        {/* GYM TAB */}
        <TabsContent value="gym" className="space-y-4">
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-6">
              Add Gym Session
            </h2>

            <div className="space-y-4">
              {/* Basic Info */}
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
                  <Label className="text-foreground">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Effort Level (1-10)</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={effortLevel}
                    onChange={(e) => setEffortLevel(e.target.value)}
                    className="w-full"
                  />
                  <div className="text-center text-neon-pink font-bold">
                    {effortLevel}/10
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-foreground">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did the session go?"
                  className="bg-input border-border text-foreground"
                />
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                <h3 className="font-bold text-neon-cyan">Exercises</h3>
                {gymExercises.map((exercise, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-background rounded">
                    <ExerciseDropdown
                      value={exercise.exerciseName}
                      onChange={(value) => {
                        const updated = [...gymExercises];
                        updated[idx].exerciseName = value;
                        setGymExercises(updated);
                      }}
                      placeholder="Exercise name"
                      exerciseHistory={exerciseHistory}
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => {
                          const updated = [...gymExercises];
                          updated[idx].sets = e.target.value;
                          setGymExercises(updated);
                        }}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => {
                          const updated = [...gymExercises];
                          updated[idx].reps = e.target.value;
                          setGymExercises(updated);
                        }}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Weight (kg)"
                        value={exercise.weight}
                        onChange={(e) => {
                          const updated = [...gymExercises];
                          updated[idx].weight = e.target.value;
                          setGymExercises(updated);
                        }}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGymExercise(idx)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddGymExercise}
                  className="w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Plus size={16} className="mr-2" />
                  Add Exercise
                </Button>
              </div>

              <Button
                onClick={handleSubmitGym}
                className="btn-neon w-full"
                disabled={trainingMutation.isPending}
              >
                {trainingMutation.isPending ? "Logging..." : "Log Gym Session"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* RUNNING TAB */}
        <TabsContent value="running" className="space-y-4">
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-6">
              Add Running Session
            </h2>

            <div className="space-y-4">
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
                  <Label className="text-foreground">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="45"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Distance (km)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={runningData.distance}
                    onChange={(e) =>
                      setRunningData({ ...runningData, distance: e.target.value })
                    }
                    placeholder="7.5"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Effort Level (1-10)</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={effortLevel}
                    onChange={(e) => setEffortLevel(e.target.value)}
                    className="w-full"
                  />
                  <div className="text-center text-neon-pink font-bold">
                    {effortLevel}/10
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Sprint Distance (km)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={runningData.sprintDistance}
                    onChange={(e) =>
                      setRunningData({
                        ...runningData,
                        sprintDistance: e.target.value,
                      })
                    }
                    placeholder="2.0"
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Number of Sprints</Label>
                  <Input
                    type="number"
                    value={runningData.numberOfSprints}
                    onChange={(e) =>
                      setRunningData({
                        ...runningData,
                        numberOfSprints: e.target.value,
                      })
                    }
                    placeholder="6"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground">Best Sprint Time (seconds)</Label>
                <Input
                  type="number"
                  value={runningData.bestSprintTime}
                  onChange={(e) =>
                    setRunningData({
                      ...runningData,
                      bestSprintTime: e.target.value,
                    })
                  }
                  placeholder="18"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label className="text-foreground">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did the run go?"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <Button
                onClick={handleSubmitRunning}
                className="btn-neon w-full"
                disabled={trainingMutation.isPending}
              >
                {trainingMutation.isPending ? "Logging..." : "Log Running Session"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* CONDITIONING TAB */}
        <TabsContent value="conditioning" className="space-y-4">
          <Card className="card-neon p-6">
            <h2 className="text-xl font-bold text-neon-cyan mb-6">
              Add Conditioning Session
            </h2>

            <div className="space-y-4">
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
                  <Label className="text-foreground">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground">Effort Level (1-10)</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={effortLevel}
                  onChange={(e) => setEffortLevel(e.target.value)}
                  className="w-full"
                />
                <div className="text-center text-neon-pink font-bold">
                  {effortLevel}/10
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-neon-cyan">Exercises</h3>
                {conditioningExercises.map((exercise, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-background rounded">
                    <select
                      value={exercise.exerciseType}
                      onChange={(e) => {
                        const updated = [...conditioningExercises];
                        updated[idx].exerciseType = e.target.value;
                        setConditioningExercises(updated);
                      }}
                      className="w-full bg-input border border-border text-foreground rounded px-3 py-2"
                    >
                      <option value="pushups">Push-ups</option>
                      <option value="situps">Sit-ups</option>
                      <option value="pullups">Pull-ups</option>
                      <option value="squats">Squats</option>
                      <option value="planks">Planks</option>
                      <option value="burpees">Burpees</option>
                      <option value="lunges">Lunges</option>
                      <option value="shuttle_runs">Shuttle Runs</option>
                      <option value="custom">Custom</option>
                    </select>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => {
                          const updated = [...conditioningExercises];
                          updated[idx].reps = e.target.value;
                          setConditioningExercises(updated);
                        }}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Time (sec)"
                        value={exercise.time}
                        onChange={(e) => {
                          const updated = [...conditioningExercises];
                          updated[idx].time = e.target.value;
                          setConditioningExercises(updated);
                        }}
                        className="bg-input border-border text-foreground text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveConditioningExercise(idx)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddConditioningExercise}
                  className="w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Plus size={16} className="mr-2" />
                  Add Exercise
                </Button>
              </div>

              <div>
                <Label className="text-foreground">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did the session go?"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <Button
                onClick={handleSubmitConditioning}
                className="btn-neon w-full"
                disabled={trainingMutation.isPending}
              >
                {trainingMutation.isPending
                  ? "Logging..."
                  : "Log Conditioning Session"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filters & Export */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Filter Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-foreground text-sm">Type</Label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as "all" | "gym" | "running" | "conditioning"
                )
              }
              className="w-full px-3 py-2 bg-input border border-border text-foreground rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="gym">Gym</option>
              <option value="running">Running</option>
              <option value="conditioning">Conditioning</option>
            </select>
          </div>
          <div>
            <Label className="text-foreground text-sm">Start Date</Label>
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-input border-border text-foreground text-sm"
            />
          </div>
          <div>
            <Label className="text-foreground text-sm">End Date</Label>
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-input border-border text-foreground text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={exportToCSV}
              className="btn-neon w-full text-sm"
              disabled={!filteredSessions.length}
            >
              📥 Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Sessions */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">
          Recent Sessions ({filteredSessions.length})
        </h2>
        {trainingList.isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map((session: any) => (
              <div
                key={session.id}
                className="flex justify-between items-center p-3 bg-background rounded border border-border"
              >
                <div>
                  <p className="font-semibold text-foreground capitalize">
                    {session.type.replace("_", " ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.date).toLocaleDateString()} •{" "}
                    {session.duration} min
                  </p>
                </div>
                <div className="text-neon-pink font-bold">{session.effortLevel}/10</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No sessions yet. Start logging!</p>
        )}
      </Card>
    </div>
  );
}
