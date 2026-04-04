import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Goals() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Personal Goals
        </h1>
        <p className="text-muted-foreground">
          Set and track your training and performance goals
        </p>
      </div>

      <div className="flex gap-4">
        <Button className="btn-neon">
          <Plus size={18} className="mr-2" />
          Create Goal
        </Button>
      </div>

      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Active Goals</h2>
        <p className="text-muted-foreground">No goals yet. Create your first goal!</p>
      </Card>
    </div>
  );
}
