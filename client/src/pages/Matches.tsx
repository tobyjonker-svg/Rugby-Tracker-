import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Matches() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Match Stats
        </h1>
        <p className="text-muted-foreground">
          Track your rugby match performance and statistics
        </p>
      </div>

      <div className="flex gap-4">
        <Button className="btn-neon">
          <Plus size={18} className="mr-2" />
          Add Match
        </Button>
      </div>

      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Recent Matches</h2>
        <p className="text-muted-foreground">No matches logged yet. Add your first match!</p>
      </Card>
    </div>
  );
}
