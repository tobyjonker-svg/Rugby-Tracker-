import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("fitness");
  const [targetNumber, setTargetNumber] = useState("");
  const [deadline, setDeadline] = useState("");

  const goalsMutation = trpc.goals.create.useMutation();
  const goalsList = trpc.goals.list.useQuery({ limit: 50 });
  const updateProgressMutation = trpc.goals.update.useMutation();

  const handleSubmit = async () => {
    if (!title || !targetNumber) {
      toast.error("Please fill in title and target number");
      return;
    }

    try {
      await goalsMutation.mutateAsync({
        title,
        category: category as any,
        targetNumber: parseFloat(targetNumber),
        deadline: deadline ? new Date(deadline) : undefined,
      });

      toast.success("Goal created successfully!");
      setShowForm(false);
      setTitle("");
      setCategory("fitness");
      setTargetNumber("");
      setDeadline("");
      goalsList.refetch();
    } catch (error) {
      toast.error("Failed to create goal");
    }
  };

  const handleUpdateProgress = async (goalId: number, newProgress: number) => {
    try {
      await updateProgressMutation.mutateAsync({
        id: goalId,
        currentValue: newProgress,
      });
      toast.success("Goal progress updated!");
      goalsList.refetch();
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const activeGoals =
    goalsList.data?.filter((g) => g.status === "active") || [];
  const completedGoals =
    goalsList.data?.filter((g) => g.status === "completed") || [];

  return (
    <div className="container py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Personal Goals
        </h1>
        <p className="text-muted-foreground">
          Set and track your training and performance goals
        </p>
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="btn-neon">
          <Plus size={18} className="mr-2" />
          Create Goal
        </Button>
      )}

      {showForm && (
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-6">Create New Goal</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Goal Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Do 50 push-ups without stopping"
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-input border border-border text-foreground rounded px-3 py-2"
                >
                  <option value="fitness">Fitness</option>
                  <option value="match_performance">Match Performance</option>
                  <option value="training">Training</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div>
                <Label className="text-foreground">Target Number *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="e.g., 50"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Deadline</Label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="btn-neon flex-1"
                disabled={goalsMutation.isPending}
              >
                {goalsMutation.isPending ? "Creating..." : "Create Goal"}
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

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-neon-cyan">Active Goals</h2>
        {goalsList.isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const current = Number(goal.currentProgress || 0);
              const target = Number(goal.targetNumber || 1);
              const percentage = getProgressPercentage(current, target);

              return (
                <Card key={goal.id} className="card-neon p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Target size={20} className="text-neon-pink" />
                          <h3 className="font-bold text-foreground">
                            {goal.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {goal.category.replace("_", " ")}
                          {goal.deadline &&
                            ` • Due ${new Date(goal.deadline).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neon-cyan">
                          {current} / {target}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(percentage)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-neon">
                      <div
                        className="progress-neon-fill transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Update Progress */}
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="New progress"
                        className="bg-input border-border text-foreground text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = parseFloat(
                              (e.target as HTMLInputElement).value
                            );
                            if (!isNaN(value)) {
                              handleUpdateProgress(goal.id, value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="btn-neon text-sm"
                        onClick={(e) => {
                          const input = (
                            e.currentTarget.previousElementSibling as HTMLInputElement
                          );
                          const value = parseFloat(input.value);
                          if (!isNaN(value)) {
                            handleUpdateProgress(goal.id, value);
                            input.value = "";
                          }
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="card-neon p-6">
            <p className="text-muted-foreground">
              No active goals yet. Create one to get started!
            </p>
          </Card>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neon-cyan">Completed Goals</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="card-neon p-4 opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground line-through">
                      {goal.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed • {goal.currentProgress} / {goal.targetNumber}
                    </p>
                  </div>
                  <div className="text-neon-cyan font-bold text-lg">✓</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
