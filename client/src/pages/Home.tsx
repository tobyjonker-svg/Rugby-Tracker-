import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Dumbbell, Trophy, Target, BarChart3, Zap, Bell, Share2, ArrowRight, CheckCircle, Users, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationService } from "@/services/notificationService";
import { SocialShareService } from "@/services/socialShareService";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 space-y-8 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-neon-pink rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-cyan rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          </div>

          <div className="text-center space-y-6 max-w-3xl relative z-10">
            <div className="inline-block px-4 py-2 bg-neon-pink/10 border border-neon-pink rounded-full">
              <span className="text-neon-pink font-bold text-sm">🏉 Elite Rugby Performance Platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black neon-glow">
              RUGBY TRACKER
            </h1>

            <p className="text-3xl md:text-4xl font-bold text-neon-cyan neon-glow-cyan">
              Train Harder. Play Smarter. Track Everything.
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your personal rugby performance companion. Log workouts, track match stats, set goals, and monitor your progress with real-time analytics. Designed for rugby players who are serious about improvement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="btn-neon px-8 py-6 text-lg font-bold group"
              >
                Start Training Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg font-bold border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-background/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-neon-pink neon-glow">
              Powerful Features
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Everything you need to track, analyze, and improve your rugby performance
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Dumbbell,
                  title: "Training Logs",
                  description: "Track gym, running, and conditioning sessions with detailed metrics",
                  color: "neon-pink"
                },
                {
                  icon: Trophy,
                  title: "Match Stats",
                  description: "Log comprehensive game performance data including tackles, tries, and more",
                  color: "neon-cyan"
                },
                {
                  icon: Target,
                  title: "Goal Tracking",
                  description: "Set personal goals and monitor progress with visual indicators",
                  color: "neon-purple"
                },
                {
                  icon: BarChart3,
                  title: "Analytics",
                  description: "Real-time charts and insights into your training trends and performance",
                  color: "neon-pink"
                },
                {
                  icon: Zap,
                  title: "AI Recommendations",
                  description: "Get personalized workout suggestions based on your training patterns",
                  color: "neon-cyan"
                },
                {
                  icon: Smartphone,
                  title: "Mobile First",
                  description: "Optimized for on-the-go logging with offline support",
                  color: "neon-purple"
                }
              ].map((feature, idx) => (
                <Card key={idx} className="card-neon p-6 hover:shadow-lg hover:shadow-neon-pink/50 transition-all">
                  <feature.icon className={`text-${feature.color} mb-4`} size={32} />
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-neon-cyan neon-glow-cyan">
              Why Rugby Players Choose Us
            </h2>

            <div className="space-y-4">
              {[
                "Log training in seconds with smart exercise dropdowns",
                "Visualize your progress with interactive analytics charts",
                "Get AI-powered recommendations tailored to your goals",
                "Access your data offline and sync automatically",
                "Share achievements on social media",
                "Track 16+ match performance metrics"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border hover:border-neon-cyan/50 transition-colors">
                  <CheckCircle className="text-neon-pink flex-shrink-0" size={24} />
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4 bg-background/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-neon-purple">
              Trusted by Rugby Players Worldwide
            </h2>
            <p className="text-muted-foreground mb-12 text-lg">
              Join thousands of rugby players improving their game every day
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { stat: "5,000+", label: "Active Players" },
                { stat: "500K+", label: "Training Sessions Logged" },
                { stat: "98%", label: "User Satisfaction" }
              ].map((item, idx) => (
                <Card key={idx} className="card-neon p-6">
                  <div className="text-3xl font-bold text-neon-pink neon-glow mb-2">
                    {item.stat}
                  </div>
                  <p className="text-muted-foreground">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-neon-pink neon-glow">
              Ready to Transform Your Training?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the rugby community and start tracking your path to excellence
            </p>

            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="btn-neon px-12 py-8 text-xl font-bold group mx-auto block"
            >
              Get Started Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} />
            </Button>

            <p className="text-sm text-muted-foreground">
              No credit card required. Start tracking your performance today.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4 text-center text-muted-foreground">
          <p>© 2026 Rugby Tracker. Train Harder. Play Smarter.</p>
        </footer>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="container py-6 space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Welcome back, {user?.name}! ⚡
        </h1>
        <p className="text-muted-foreground">Ready to crush your training goals?</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-neon p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">This Week</p>
          <p className="text-3xl font-bold text-neon-pink neon-glow mt-2">5</p>
          <p className="text-xs text-muted-foreground mt-1">Workouts</p>
        </Card>
        <Card className="card-neon p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Distance</p>
          <p className="text-3xl font-bold text-neon-cyan neon-glow-cyan mt-2">7.5</p>
          <p className="text-xs text-muted-foreground mt-1">km</p>
        </Card>
        <Card className="card-neon p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Push-ups PB</p>
          <p className="text-3xl font-bold text-neon-purple mt-2">45</p>
          <p className="text-xs text-muted-foreground mt-1">PB</p>
        </Card>
        <Card className="card-neon p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Recent Match</p>
          <p className="text-3xl font-bold text-neon-pink neon-glow mt-2">WIN</p>
          <p className="text-xs text-muted-foreground mt-1">28-21</p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button asChild className="btn-neon h-auto py-4 flex flex-col items-center gap-2">
          <Link href="/training">
            <Dumbbell size={24} />
            <span>Log Training</span>
          </Link>
        </Button>
        <Button asChild className="btn-neon h-auto py-4 flex flex-col items-center gap-2">
          <Link href="/matches">
            <Trophy size={24} />
            <span>Add Match</span>
          </Link>
        </Button>
        <Button asChild className="btn-neon h-auto py-4 flex flex-col items-center gap-2">
          <Link href="/goals">
            <Target size={24} />
            <span>Set Goals</span>
          </Link>
        </Button>
        <Button asChild className="btn-neon h-auto py-4 flex flex-col items-center gap-2">
          <Link href="/analytics">
            <BarChart3 size={24} />
            <span>View Analytics</span>
          </Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => NotificationService.requestPermission()}
          className="btn-neon w-full"
        >
          <Bell size={18} className="mr-2" />
          Enable Notifications
        </Button>
        <Button
          onClick={() => SocialShareService.shareTrainingAchievement("Workout Session", "Completed!", "gym")}
          className="btn-neon w-full"
        >
          <Share2 size={18} className="mr-2" />
          Share Achievement
        </Button>
      </div>
    </div>
  );
}
