import { Card } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your progress with detailed statistics and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Weekly Training</h2>
          <p className="text-muted-foreground">Chart coming soon...</p>
        </Card>

        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Personal Bests</h2>
          <p className="text-muted-foreground">No data yet</p>
        </Card>

        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Match Performance</h2>
          <p className="text-muted-foreground">Chart coming soon...</p>
        </Card>

        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">Goal Progress</h2>
          <p className="text-muted-foreground">No goals yet</p>
        </Card>
      </div>
    </div>
  );
}
