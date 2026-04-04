import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Player Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your profile and view your training history
        </p>
      </div>

      <Card className="card-neon p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-neon-cyan mb-4">Profile Information</h2>
            <div className="space-y-2 text-foreground">
              <p><span className="text-muted-foreground">Name:</span> {user?.name || 'Not set'}</p>
              <p><span className="text-muted-foreground">Email:</span> {user?.email || 'Not set'}</p>
            </div>
          </div>

          <Button className="btn-neon">
            Edit Profile
          </Button>
        </div>
      </Card>

      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Training Summary</h2>
        <p className="text-muted-foreground">Your training history will appear here</p>
      </Card>
    </div>
  );
}
