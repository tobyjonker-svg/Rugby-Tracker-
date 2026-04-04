import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Dumbbell, Trophy, Target, BarChart3, Zap, Bell, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationService } from "@/services/notificationService";
import { SocialShareService } from "@/services/socialShareService";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-2xl">
          <div className="text-6xl font-bold neon-glow animate-pulse">
            ⚡ RUGBY TRACKER
          </div>
          <div className="text-2xl text-neon-cyan neon-glow-cyan font-bold">
            Train Harder. Play Smarter. Track Everything.
          </div>
          <p className="text-lg text-muted-foreground">
            Your personal rugby performance companion. Log workouts, track match stats, set goals, and monitor your progress with real-time analytics.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          <Card className="card-neon p-4 flex items-start gap-3">
            <Dumbbell className="text-neon-pink flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-foreground">Training Logs</h3>
              <p className="text-sm text-muted-foreground">Track gym, running, and conditioning sessions</p>
            </div>
          </Card>

          <Card className="card-neon p-4 flex items-start gap-3">
            <Trophy className="text-neon-cyan flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-foreground">Match Stats</h3>
              <p className="text-sm text-muted-foreground">Log detailed game performance data</p>
            </div>
          </Card>

          <Card className="card-neon p-4 flex items-start gap-3">
            <Target className="text-neon-purple flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-foreground">Goal Tracking</h3>
              <p className="text-sm text-muted-foreground">Set and monitor personal objectives</p>
            </div>
          </Card>

          <Card className="card-neon p-4 flex items-start gap-3">
            <BarChart3 className="text-neon-pink flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-foreground">Analytics</h3>
              <p className="text-sm text-muted-foreground">Visualize trends and personal bests</p>
            </div>
          </Card>
        </div>

        {/* CTA Button */}
        <a href={getLoginUrl()} className="w-full max-w-xs">
          <Button className="btn-neon w-full text-lg py-6">
            <Zap size={20} className="mr-2" />
            Get Started Now
          </Button>
        </a>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Secure authentication powered by Manus</p>
        </div>
      </div>
    );
  }

  // Dashboard for authenticated users
  return (
    <div className="container py-6 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-neon-pink neon-glow">
          Welcome back, {user?.name}! ⚡
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to crush your training goals?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-box">
          <div className="stat-box-label">This Week</div>
          <div className="stat-box-value">5</div>
          <div className="text-xs text-muted-foreground">Workouts</div>
        </Card>

        <Card className="stat-box">
          <div className="stat-box-label">Total Distance</div>
          <div className="stat-box-value">7.5</div>
          <div className="text-xs text-muted-foreground">km</div>
        </Card>

        <Card className="stat-box">
          <div className="stat-box-label">Push-ups</div>
          <div className="stat-box-value">45</div>
          <div className="text-xs text-muted-foreground">PB</div>
        </Card>

        <Card className="stat-box">
          <div className="stat-box-label">Recent Match</div>
          <div className="stat-box-value text-neon-cyan">WIN</div>
          <div className="text-xs text-muted-foreground">28-21</div>
        </Card>
      </div>

      {/* Notification & Sharing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={async () => {
            const granted = await NotificationService.requestPermission();
            if (granted) {
              toast.success("Notifications enabled!");
              await NotificationService.sendTrainingReminder("gym workout");
            } else {
              toast.error("Notification permission denied");
            }
          }}
          className="btn-neon flex items-center gap-2"
        >
          <Bell size={18} />
          Enable Notifications
        </Button>
        <Button
          onClick={() => {
            SocialShareService.shareTrainingAchievement("Push-ups", "45 reps", "gym");
          }}
          className="btn-neon flex items-center gap-2"
        >
          <Share2 size={18} />
          Share Achievement
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/training">
          <Card className="card-neon p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">💪</div>
              <div>
                <h3 className="font-bold text-foreground">Log Training</h3>
                <p className="text-sm text-muted-foreground">Add a new workout session</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="card-neon p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏉</div>
              <div>
                <h3 className="font-bold text-foreground">Add Match</h3>
                <p className="text-sm text-muted-foreground">Record match statistics</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/goals">
          <Card className="card-neon p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h3 className="font-bold text-foreground">Set Goals</h3>
                <p className="text-sm text-muted-foreground">Create new personal goals</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="card-neon p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div>
                <h3 className="font-bold text-foreground">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Check your progress</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="card-neon p-6">
        <h2 className="text-2xl font-bold text-neon-cyan mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <div>
              <p className="font-semibold text-foreground">Gym Session - Upper Body</p>
              <p className="text-sm text-muted-foreground">1 day ago • 60 min</p>
            </div>
            <div className="text-neon-pink font-bold">8/10</div>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <div>
              <p className="font-semibold text-foreground">Running - 7.5 km</p>
              <p className="text-sm text-muted-foreground">2 days ago • 45 min</p>
            </div>
            <div className="text-neon-cyan font-bold">7/10</div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">Match vs Central High</p>
              <p className="text-sm text-muted-foreground">7 days ago • WIN 28-21</p>
            </div>
            <div className="text-neon-cyan font-bold">12 tackles</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
