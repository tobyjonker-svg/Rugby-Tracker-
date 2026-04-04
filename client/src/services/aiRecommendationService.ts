/**
 * AI Training Recommendations Service
 * Uses LLM to analyze training patterns and generate personalized recommendations
 */

export interface TrainingAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  focusAreas: string[];
  estimatedProgressDays: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  exercises: string[];
  duration: number;
  intensity: "low" | "medium" | "high";
  targetArea: string;
  reasoning: string;
  createdAt: Date;
}

class AIRecommendationService {
  async analyzeTrainingPattern(
    trainingSessions: any[],
    goals: any[],
    personalBests: Record<string, number>
  ): Promise<TrainingAnalysis> {
    // Format data for LLM analysis
    const trainingData = {
      totalSessions: trainingSessions.length,
      sessionTypes: this.getSessionTypeBreakdown(trainingSessions),
      averageIntensity: this.calculateAverageIntensity(trainingSessions),
      consistencyScore: this.calculateConsistency(trainingSessions),
      personalBests,
      goals: goals.map((g: any) => ({
        title: g.title,
        targetValue: g.targetValue,
        currentProgress: g.currentProgress,
        category: g.category,
      })),
    };

    // Return mock analysis for demo
    return {
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
  }

  async generateWorkoutRecommendation(
    focusArea: string,
    duration: number,
    intensity: "low" | "medium" | "high",
    availableEquipment: string[] = []
  ): Promise<Recommendation> {
    // Return mock recommendation for demo
    return {
      id: `rec-${Date.now()}`,
      title: `${focusArea} Workout - ${intensity} Intensity`,
      description: `A ${duration}-minute ${intensity} intensity workout focused on ${focusArea}`,
      exercises: [
        "Warm-up: 5 min light cardio",
        "Main: 3 sets of compound movements",
        "Accessory: 2 sets of isolation work",
        "Cool-down: 5 min stretching",
      ],
      duration,
      intensity,
      targetArea: focusArea,
      reasoning: "This workout targets your identified weak areas while building on your strengths.",
      createdAt: new Date(),
    };
  }

  async getGoalProgressInsights(goals: any[]): Promise<string[]> {
    // Return mock insights for demo
    return [
      "You are on track to achieve your goals",
      "Consider increasing training frequency",
      "Your consistency is improving week over week",
    ];
  }

  async suggestNextMilestone(
    currentGoal: any,
    pastAchievements: any[]
  ): Promise<string> {
    // Return mock suggestion for demo
    return "Aim for 10% improvement in your next training cycle!";
  }

  private getSessionTypeBreakdown(sessions: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {
      gym: 0,
      running: 0,
      conditioning: 0,
    };

    sessions.forEach((session: any) => {
      if (session.type in breakdown) {
        breakdown[session.type]++;
      }
    });

    return breakdown;
  }

  private calculateAverageIntensity(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum: number, s: any) => sum + (s.intensity || 5), 0);
    return Math.round(total / sessions.length);
  }

  private calculateConsistency(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

    const recentSessions = sessions.filter(
      (s: any) => new Date(s.date) > lastThirtyDays
    );

    // Calculate as percentage of ideal (4-5 sessions per week)
    const idealSessions = 20;
    return Math.min(100, Math.round((recentSessions.length / idealSessions) * 100));
  }
}

export const aiRecommendationService = new AIRecommendationService();
