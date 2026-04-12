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

export default function Training() {
  const [activeTab, setActiveTab] = useState("gym");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [effortLevel, setEffortLevel] = useState("5");
  const [notes, setNotes] = useState("");
  const [filterType, setFilterType] = useState<"all" | "gym" | "running" | "conditioning">("all");
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

  // Extract unique exercises from training history
  const getExerciseHistory = () => {
    const exercises = new Set<string>();
    trainingList.data?.forEach((session: any) => {
      if (session.notes) exercises.add(session.notes);
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

    const headers = ["Date", "Type", "Effort Level", "Notes"];
    const rows = filteredSessions.map((session: any) => [
      new Date(session.date).toLocaleDateString(),
      session.type.replace("_", " "),
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

  const handleAddGymExercise = () => {
    setGymExercises([
      ...gymExercises,
      { exerciseName: "", sets: "", reps: "", weight: "", notes: "" },
    ]);
  };

  const handleRemoveGymExercise = (index: number) => {
    setGymExercises(gymExercises.filter((_, i) => i !== index));
  };

  const handleAddConditioningExercise = () => {
    setConditioningExercises([
      ...conditioningExercises,
      { exerciseType: "pushups", reps: "", time: "", notes: "" },
    ]);
  };

  const handleRemoveConditioningExercise = (index: number) => {
    setConditioningExercises(
      conditioningExercises.filter((_, i) => i !== index)
    );
  };

  const handleSubmitGym = async () => {
    if (!date) {
      toast.error("Please fill in date");
      return;
    }

    try {
      await trainingMutation.mutateAsync({
        date: new Date(date),
        type: "gym",
        effortLevel: parseInt(effortLevel),
        notes: `Gym: ${gymExercises.map((e) => e.exerciseName).join(", ")}`,
      });

      toast.success("Gym session logged!");
      setDate(new Date().toISOString().split("T")[0]);
      setEffortLevel("5");
      setNotes("");
      setGymExercises([{ exerciseName: "", sets: "", reps: "", weight: "", notes: "" }]);
      trainingList.refetch();
    } catch (error) {
      toast.error("Failed to log gym session");
    }
  };

  const handleSubmitRunning = async () => {
    if (!date) {
      toast.error("Please fill in date");
      return;
    }

    try {
      await trainingMutation.mutateAsync({
        date: new Date(date),
        type: "running",
        effortLevel: parseInt(effortLevel),
        notes: `Running: ${runningData.distance}km in ${runningData.time}min`,
      });

      toast.success("Running session logged!");
      setDate(new Date().toISOString().split("T")[0]);
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
      toast.error("Failed to log running session");
    }
  };

  const handleSubmitConditioning = async () => {
    if (!date) {
      toast.error("Please fill in date");
      return;
    }

    try {
      await trainingMutation.mutateAsync({
        date: new Date(date),
        type: "conditioning",
        effortLevel: parseInt(effortLevel),
        notes: `Conditioning: ${conditioningExercises.map((e) => e.exerciseType).join(", ")}`,
      });

      toast.success("Conditioning session logged!");
      setDate(new Date().toISOString().split("T")[0]);
      setEffortLevel("5");
      setNotes("");
      setConditioningExercises([{ exerciseType: "pushups", reps: "", time: "", notes: "" }]);
      trainingList.refetch();
    } catch (error) {
      toast.error("Failed to log conditioning session");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-500">
          Training Log
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-pink-500/30">
            <TabsTrigger
              value="gym"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
            >
              💪 Gym
            </TabsTrigger>
            <TabsTrigger
              value="running"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              🏃 Running
            </TabsTrigger>
            <TabsTrigger
              value="conditioning"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              ⚡ Conditioning
            </TabsTrigger>
          </TabsList>

          {/* GYM TAB */}
          <TabsContent value="gym" className="space-y-6">
            <Card className="bg-gray-900 border border-pink-500/30 p-6">
              <h2 className="text-2xl font-bold text-pink-400 mb-6">Log Gym Workout</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-800 border-pink-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Effort Level (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={effortLevel}
                    onChange={(e) => setEffortLevel(e.target.value)}
                    className="bg-gray-800 border-pink-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Exercises</Label>
                  {gymExercises.map((exercise, index) => (
                    <div key={index} className="space-y-2 mb-4 p-4 bg-gray-800 rounded border border-pink-500/20">
                      <ExerciseDropdown
                        value={exercise.exerciseName}
                        onChange={(value) => {
                          const updated = [...gymExercises];
                          updated[index].exerciseName = value;
                          setGymExercises(updated);
                        }}
                        exerciseHistory={exerciseHistory}
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          placeholder="Sets"
                          value={exercise.sets}
                          onChange={(e) => {
                            const updated = [...gymExercises];
                            updated[index].sets = e.target.value;
                            setGymExercises(updated);
                          }}
                          className="bg-gray-700 border-pink-500/30 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={exercise.reps}
                          onChange={(e) => {
                            const updated = [...gymExercises];
                            updated[index].reps = e.target.value;
                            setGymExercises(updated);
                          }}
                          className="bg-gray-700 border-pink-500/30 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Weight (kg)"
                          value={exercise.weight}
                          onChange={(e) => {
                            const updated = [...gymExercises];
                            updated[index].weight = e.target.value;
                            setGymExercises(updated);
                          }}
                          className="bg-gray-700 border-pink-500/30 text-white"
                        />
                      </div>

                      {gymExercises.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveGymExercise(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddGymExercise}
                    className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                <div>
                  <Label className="text-gray-300">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="bg-gray-800 border-pink-500/30 text-white"
                  />
                </div>

                <Button
                  onClick={handleSubmitGym}
                  disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-bold"
                >
                  {trainingMutation.isPending ? "Logging..." : "Log Gym Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* RUNNING TAB */}
          <TabsContent value="running" className="space-y-6">
            <Card className="bg-gray-900 border border-cyan-500/30 p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">Log Running Session</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-800 border-cyan-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Effort Level (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={effortLevel}
                    onChange={(e) => setEffortLevel(e.target.value)}
                    className="bg-gray-800 border-cyan-500/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={runningData.distance}
                      onChange={(e) =>
                        setRunningData({ ...runningData, distance: e.target.value })
                      }
                      className="bg-gray-800 border-cyan-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Time (minutes)</Label>
                    <Input
                      type="number"
                      value={runningData.time}
                      onChange={(e) =>
                        setRunningData({ ...runningData, time: e.target.value })
                      }
                      className="bg-gray-800 border-cyan-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Sprint Distance (m)</Label>
                    <Input
                      type="number"
                      value={runningData.sprintDistance}
                      onChange={(e) =>
                        setRunningData({ ...runningData, sprintDistance: e.target.value })
                      }
                      className="bg-gray-800 border-cyan-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Number of Sprints</Label>
                    <Input
                      type="number"
                      value={runningData.numberOfSprints}
                      onChange={(e) =>
                        setRunningData({ ...runningData, numberOfSprints: e.target.value })
                      }
                      className="bg-gray-800 border-cyan-500/30 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Best Sprint Time (seconds)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={runningData.bestSprintTime}
                    onChange={(e) =>
                      setRunningData({ ...runningData, bestSprintTime: e.target.value })
                    }
                    className="bg-gray-800 border-cyan-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="bg-gray-800 border-cyan-500/30 text-white"
                  />
                </div>

                <Button
                  onClick={handleSubmitRunning}
                  disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold"
                >
                  {trainingMutation.isPending ? "Logging..." : "Log Running Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* CONDITIONING TAB */}
          <TabsContent value="conditioning" className="space-y-6">
            <Card className="bg-gray-900 border border-purple-500/30 p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-6">Log Conditioning</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Effort Level (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={effortLevel}
                    onChange={(e) => setEffortLevel(e.target.value)}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Exercises</Label>
                  {conditioningExercises.map((exercise, index) => (
                    <div key={index} className="space-y-2 mb-4 p-4 bg-gray-800 rounded border border-purple-500/20">
                      <ConditioningExerciseDropdown
                        value={exercise.exerciseType}
                        onChange={(value) => {
                          const updated = [...conditioningExercises];
                          updated[index].exerciseType = value;
                          setConditioningExercises(updated);
                        }}
                        exercises={["pushups", "burpees", "planks", "mountain climbers", "jumping jacks", "box jumps", "dips", "pull-ups", "squats", "lunges", "sit-ups", "plank holds"]}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={exercise.reps}
                          onChange={(e) => {
                            const updated = [...conditioningExercises];
                            updated[index].reps = e.target.value;
                            setConditioningExercises(updated);
                          }}
                          className="bg-gray-700 border-purple-500/30 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Time (seconds)"
                          value={exercise.time}
                          onChange={(e) => {
                            const updated = [...conditioningExercises];
                            updated[index].time = e.target.value;
                            setConditioningExercises(updated);
                          }}
                          className="bg-gray-700 border-purple-500/30 text-white"
                        />
                      </div>

                      {conditioningExercises.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveConditioningExercise(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddConditioningExercise}
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                <div>
                  <Label className="text-gray-300">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>

                <Button
                  onClick={handleSubmitConditioning}
                  disabled={trainingMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
                >
                  {trainingMutation.isPending ? "Logging..." : "Log Conditioning Session"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* FILTERS & EXPORT */}
        <Card className="bg-gray-900 border border-gray-700 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-300 mb-6">Recent Sessions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-gray-400">Filter by Type</Label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded"
              >
                <option value="all">All Types</option>
                <option value="gym">Gym</option>
                <option value="running">Running</option>
                <option value="conditioning">Conditioning</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-400">Start Date</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-400">End Date</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <Button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-bold mb-6"
          >
            📥 Export to CSV
          </Button>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <p className="text-gray-400">No training sessions found</p>
            ) : (
              filteredSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="bg-gray-800 border border-gray-700 p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-300">
                      <strong>{new Date(session.date).toLocaleDateString()}</strong> -{" "}
                      <span className="text-cyan-400 capitalize">{session.type}</span>
                    </p>
                    <p className="text-gray-500 text-sm">Effort: {session.effortLevel}/10</p>
                    {session.notes && <p className="text-gray-400 text-sm">{session.notes}</p>}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(session.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  {deleteConfirm === session.id && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <Card className="bg-gray-900 border border-red-500 p-6">
                        <p className="text-white mb-4">Delete this session?</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              deleteTraining.mutate({ id: session.id })
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm(null)}
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
