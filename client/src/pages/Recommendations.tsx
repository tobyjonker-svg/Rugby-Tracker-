import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Lightbulb, Zap, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { aiRecommendationService } from "@/services/aiRecommendationService";

export default function Recommendations() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<"low" | "medium" | "high">("medium");
  const [selectedDuration, setSelectedDuration] = useState(30);

  // Fetch training data
  const { data: trainingSessions } = trpc.training.list.useQuery({ limit: 100 });
  const { data: goals } = trpc.goals.list.useQuery({ limit: 100 });

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      // Mock analysis for now
      const mockAnalysis = {
        strengths: ["Consistent gym training", "Good running distance"],
        weaknesses: ["Low conditioning frequency", "Inconsistent intensity"],
        recommendations: [
          "Increase conditioning sessions to 2x per week",
          "Focus on explosive power training",
          "Add sprint intervals to running sessions",
        ],
        focusAreas: ["Power", "Endurance", "Agility"],
        estimatedProgressDays: 30,
      };
      setAnalysis(mockAnalysis);
      toast.success("Analysis loaded!");
    } catch (error) {
      toast.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const generateWorkout = async (focusArea: string) => {
    setLoading(true);
    try {
      const recommendation = await aiRecommendationService.generateWorkoutRecommendation(
        focusArea,
        selectedDuration,
        selectedIntensity
      );
      setRecommendations([...recommendations, recommendation]);
      toast.success("Workout generated!");
    } catch (error) {
      toast.error("Failed to generate workout");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Analysis Section */}
      {analysis && (
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
                Estimated time to see progress: {analysis.estimatedProgressDays} days
              </p>
            </div>
          </Card>
        </>
      )}

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
              {(["low", "medium", "high"] as const).map((intensity) => (
                <Button
                  key={intensity}
                  onClick={() => setSelectedIntensity(intensity)}
                  variant={selectedIntensity === intensity ? "default" : "outline"}
                  className={selectedIntensity === intensity ? "btn-neon" : ""}
                >
                  {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => generateWorkout("Custom")}
            disabled={loading}
            className="btn-neon w-full"
          >
            {loading ? "Generating..." : "Generate Workout"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
