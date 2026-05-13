/**
 * Browser Push Notification Service
 * Handles requesting permissions and sending push notifications
 */

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  static async sendNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/sport-fitness-tracker-icon.png",
        badge: "/sport-fitness-tracker-badge.png",
        ...options,
      });
    }
  }

  static async sendTrainingReminder(trainingType: string): Promise<void> {
    await this.sendNotification("Time to Train! 💪", {
      body: `Ready for your ${trainingType} session?`,
      tag: "training-reminder",
      requireInteraction: true,
    });
  }

  static async sendGoalMilestone(goalTitle: string, progress: number): Promise<void> {
    await this.sendNotification("Goal Milestone Achieved! 🎯", {
      body: `${goalTitle} is now ${progress}% complete!`,
      tag: "goal-milestone",
    });
  }

  static async sendPersonalRecord(exerciseName: string, value: string): Promise<void> {
    await this.sendNotification("New Personal Record! 🏆", {
      body: `You just hit a new PB: ${exerciseName} - ${value}`,
      tag: "personal-record",
    });
  }

  static async sendMatchReminder(opponent: string, date: string): Promise<void> {
    await this.sendNotification("Upcoming Match! 🏉", {
      body: `Match vs ${opponent} on ${date}`,
      tag: "match-reminder",
      requireInteraction: true,
    });
  }
}
