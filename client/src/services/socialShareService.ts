/**
 * Social Sharing Service
 * Handles sharing training achievements and stats to social media
 */

export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export class SocialShareService {
  static getTwitterShareUrl(text: string, url?: string): string {
    const encodedText = encodeURIComponent(text);
    const urlParam = url ? `&url=${encodeURIComponent(url)}` : "";
    return `https://twitter.com/intent/tweet?text=${encodedText}${urlParam}&hashtags=rugby,training,fitness`;
  }

  static getInstagramShareUrl(): string {
    // Instagram doesn't support direct sharing via URL, so we return a message
    return "instagram://";
  }

  static shareTrainingAchievement(
    exerciseName: string,
    value: string,
    type: "gym" | "running" | "conditioning"
  ): void {
    const emoji = type === "gym" ? "💪" : type === "running" ? "🏃" : "⚡";
    const text = `Just completed ${exerciseName}: ${value}! ${emoji} #RugbyTraining #FitnessGoals`;
    const url = window.location.href;
    const twitterUrl = this.getTwitterShareUrl(text, url);
    window.open(twitterUrl, "_blank", "width=550,height=420");
  }

  static shareMatchStats(
    opponent: string,
    result: string,
    stats: Record<string, number>
  ): void {
    const resultEmoji = result === "win" ? "🏆" : result === "loss" ? "💪" : "🤝";
    const topStat = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)[0];
    const statText = topStat ? `${topStat[0]}: ${topStat[1]}` : "";
    const text = `Match vs ${opponent}: ${result.toUpperCase()} ${resultEmoji}\n${statText}\n#Rugby #Performance`;
    const url = window.location.href;
    const twitterUrl = this.getTwitterShareUrl(text, url);
    window.open(twitterUrl, "_blank", "width=550,height=420");
  }

  static shareGoalProgress(goalTitle: string, progress: number): void {
    const progressBar = this.getProgressBar(progress);
    const text = `Working towards: ${goalTitle}\nProgress: ${progress}%\n${progressBar}\n#GoalSetting #Rugby`;
    const url = window.location.href;
    const twitterUrl = this.getTwitterShareUrl(text, url);
    window.open(twitterUrl, "_blank", "width=550,height=420");
  }

  static sharePersonalRecord(exerciseName: string, value: string): void {
    const text = `🏆 NEW PERSONAL RECORD 🏆\n${exerciseName}: ${value}\n#PersonalBest #Rugby #Training`;
    const url = window.location.href;
    const twitterUrl = this.getTwitterShareUrl(text, url);
    window.open(twitterUrl, "_blank", "width=550,height=420");
  }

  private static getProgressBar(progress: number): string {
    const filled = Math.round(progress / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  static canShare(): boolean {
    return "share" in navigator;
  }

  static async nativeShare(data: ShareData): Promise<void> {
    if (this.canShare()) {
      try {
        await navigator.share(data);
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    }
  }
}
