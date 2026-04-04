import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { Lightbulb, Zap, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<"low" | "medium" | "high">("medium");
  const [selectedDuration, setSelectedDuration] = useState(30);

  // Fetch training data
  const { data: trainingSessions } = trpc.training.list.useQuery({ limit: 100 });
  const { data: goals } = trpc.goals.list.useQuery({ limit: 100 });

  // Analyze live training data
  const analysis = useMemo(() => {
    if (!trainingSessions || trainingSessions.length === 0) {
      return null;
    }

    // Calculate training frequency by type
    const gymCount = trainingSessions.filter((s: any) => s.type === "gym").length;
    const runningCount = trainingSessions.filter((s: any) => s.type === "running").length;
    const conditioningCount = trainingSessions.filter((s: any) => s.type === "conditioning").length;

    // Calculate average effort
    const avgEffort = trainingSessions.reduce((sum: number, s: any) => sum + (s.effortLevel || 0), 0) / trainingSessions.length;

    // Determine strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (gymCount >= 3) strengths.push("Consistent strength training");
    else weaknesses.push("Increase gym sessions for strength");

    if (runningCount >= 2) strengths.push("Regular running/cardio");
    else weaknesses.push("Add more running sessions");

    if (conditioningCount >= 2) strengths.push("Good conditioning work");
    else weaknesses.push("Increase conditioning frequency");

    if (avgEffort >= 7) strengths.push("High effort intensity");
    else weaknesses.push("Increase workout intensity");

    // Focus areas based on weaknesses
    const focusAreas: string[] = [];
    if (conditioningCount < 2) focusAreas.push("Conditioning");
    if (runningCount < 2) focusAreas.push("Endurance");
    if (gymCount < 3) focusAreas.push("Strength");

    // Recommendations
    const recommendations = [];
    if (conditioningCount < 2) recommendations.push("Add 2 conditioning sessions per week for explosive power");
    if (avgEffort < 7) recommendations.push("Increase workout intensity to push your limits");
    if (runningCount < 2) recommendations.push("Include 2-3 running sessions weekly for cardiovascular fitness");

    return {
      strengths: strengths.length > 0 ? strengths : ["Consistent training"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Continue maintaining current routine"],
      recommendations: recommendations.length > 0 ? recommendations : ["Maintain your current training routine"],
      focusAreas: focusAreas.length > 0 ? focusAreas : ["Strength", "Endurance", "Conditioning"],
      estimatedProgressDays: 30,
      sessionCount: trainingSessions.length,
      avgEffort: avgEffort.toFixed(1),
    };
  }, [trainingSessions]);

  const generateWorkout = async (focusArea: string) => {
    setLoading(true);
    try {
      const workout = {
        title: `${focusArea} Focus - ${selectedDuration}min ${selectedIntensity} Intensity`,
        description: `A ${selectedDuration}-minute ${selectedIntensity} intensity workout focused on ${focusArea.toLowerCase()}`,
        exercises: generateExercises(focusArea, selectedDuration, selectedIntensity),
        reasoning: `This workout targets ${focusArea.toLowerCase()} development based on your training patterns and goals.`,
      };
      setRecommendations([...recommendations, workout]);
      toast.success("Workout generated!");
    } catch (error) {
      toast.error("Failed to generate workout");
    } finally {
      setLoading(false);
    }
  };

  const generateExercises = (focusArea: string, duration: number, intensity: string) => {
    const baseExercises: Record<string, string[]> = {
      Strength: ["Squats", "Bench Press", "Deadlifts", "Pull-ups", "Rows"],
      Endurance: ["Running intervals", "Cycling", "Swimming", "Jump rope", "Burpees"],
      Conditioning: ["Push-ups", "Planks", "Mountain climbers", "Box jumps", "Sprints"],
      Power: ["Explosive push-ups", "Plyometric jumps", "Medicine ball throws", "Kettlebell swings", "Power cleans"],
      Agility: ["Ladder drills", "Cone drills", "Shuttle runs", "Side shuffles", "Direction changes"],
    };

    const exercises = baseExercises[focusArea] || baseExercises["Strength"];
    const count = Math.ceil((duration / 15) * 3);
    return exercises.slice(0, count);
  };

  if (!analysis) {
    return (
      <div className="container py-6 space-y-6 pb-20">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neon-pink neon-glow">
            AI Training Recommendations
          </h1>
          <p className="text-muted-foreground">
            Personalized workout suggestions based on your training patterns
          </p>
        </div>
        <Card className="card-neon p-6">
          <p className="text-muted-foreground">Start logging training sessions to get personalized recommendations!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          AI Training Recommendations
        </h1>
        <p className="text-muted-foreground">
          Personalized workout suggestions based on your {analysis.sessionCount} training sessions
        </p>
      </div>

      {/* Analysis Section */}
      <>
        {/* Strengths */}
        <Card className="card-neon p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-neon-cyan" size={24} />
            <h2 className="text-xl font-bold text-neon-cyan">Your Strengths</h2>
          </div>
          <div className="space-y-2">
            {analysis.strengths.map((strength: string, idx: number) => (
              <div key={idx} className="p-3 bg-background rounded border border-border">
                <p className="text-foreground">✓ {strength}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Areas for Improvement */}
        <Card className="card-neon p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-neon-purple" size={24} />
            <h2 className="text-xl font-bold text-neon-purple">Areas for Improvement</h2>
          </div>
          <div className="space-y-2">
            {analysis.weaknesses.map((weakness: string, idx: number) => (
              <div key={idx} className="p-3 bg-background rounded border border-border">
                <p className="text-foreground">• {weakness}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Focus Areas */}
        <Card className="card-neon p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-neon-pink" size={24} />
            <h2 className="text-xl font-bold text-neon-pink">Recommended Focus Areas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analysis.focusAreas.map((area: string, idx: number) => (
              <Button
                key={idx}
                onClick={() => generateWorkout(area)}
                disabled={loading}
                className="btn-neon h-auto py-4"
              >
                <div className="text-center">
                  <p className="font-bold">{area}</p>
                  <p className="text-xs mt-1">Generate Workout</p>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Key Recommendations */}
        <Card className="card-neon p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-neon-cyan" size={24} />
            <h2 className="text-xl font-bold text-neon-cyan">Key Recommendations</h2>
          </div>
          <div className="space-y-3">
            {analysis.recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="p-4 bg-background rounded border border-border">
                <p className="text-foreground">{rec}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-background rounded border border-border">
            <p className="text-sm text-muted-foreground">
              Average effort level: {analysis.avgEffort}/10 | Estimated time to see progress: {analysis.estimatedProgressDays} days
            </p>
          </div>
        </Card>
      </>

      {/* Generated Workouts */}
      {recommendations.length > 0 && (
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Generated Workouts</h2>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-background rounded border border-border space-y-3">
                <div>
                  <h3 className="font-bold text-foreground">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neon-cyan">Exercises:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    {rec.exercises.map((ex: string, i: number) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground italic">{rec.reasoning}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Workout Generator Controls */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Generate Custom Workout</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground">Duration (minutes)</label>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">{selectedDuration} minutes</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Intensity</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <Button
                  key={level}
                  onClick={() => setSelectedIntensity(level)}
                  variant={selectedIntensity === level ? "default" : "outline"}
                  className={selectedIntensity === level ? "btn-neon" : ""}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
