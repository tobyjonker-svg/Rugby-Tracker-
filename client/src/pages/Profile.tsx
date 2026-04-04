import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { Camera, Save, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    position: "",
    height: "",
    weight: "",
    dominantFoot: "right" as "left" | "right" | "both",
    team: "",
    seasonGoals: "",
  });

  // Fetch profile data
  const { data: profileData } = trpc.profile.get.useQuery();
  const trainingList = trpc.training.list.useQuery({ limit: 100 });
  
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      // Refetch profile data
      trpc.useUtils().profile.get.invalidate();
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Initialize form data from user profile
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        age: (profileData as any).age ? String((profileData as any).age) : "",
        position: (profileData as any).position || "",
        height: (profileData as any).height ? String((profileData as any).height) : "",
        weight: (profileData as any).weight ? String((profileData as any).weight) : "",
        dominantFoot: ((profileData as any).dominantFoot || "right") as "left" | "right" | "both",
        team: (profileData as any).team || "",
        seasonGoals: (profileData as any).seasonGoals || "",
      });
    }
  }, [profileData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      position: formData.position,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      dominantFoot: formData.dominantFoot,
      team: formData.team,
      seasonGoals: formData.seasonGoals,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePhoto(null);
    setPhotoFile(null);
    // Reset form to current data
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        age: (profileData as any).age ? String((profileData as any).age) : "",
        position: (profileData as any).position || "",
        height: (profileData as any).height ? String((profileData as any).height) : "",
        weight: (profileData as any).weight ? String((profileData as any).weight) : "",
        dominantFoot: ((profileData as any).dominantFoot || "right") as "left" | "right" | "both",
        team: (profileData as any).team || "",
        seasonGoals: (profileData as any).seasonGoals || "",
      });
    }
  };

  // Calculate training stats
  const totalWorkouts = trainingList.data?.length || 0;
  const totalDistance = trainingList.data?.reduce((sum: number, session: any) => {
    if (session.type === "running" && session.runningData?.distance) {
      return sum + session.runningData.distance;
    }
    return sum;
  }, 0) || 0;

  const gymSessions = trainingList.data?.filter((s: any) => s.type === "gym").length || 0;
  const runningSessions = trainingList.data?.filter((s: any) => s.type === "running").length || 0;
  const conditioningSessions = trainingList.data?.filter((s: any) => s.type === "conditioning").length || 0;

  return (
    <div className="container py-6 space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Player Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your profile and view your training history
        </p>
      </div>

      {/* Profile Card */}
      <Card className="card-neon p-6">
        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full border-2 border-neon-cyan overflow-hidden bg-background flex items-center justify-center">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Camera size={32} />
                  <p className="text-xs mt-2">No photo</p>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="photo-upload" className="text-neon-cyan cursor-pointer">
                  Upload Photo
                </Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div>
            <h2 className="text-xl font-bold text-neon-cyan mb-4">Profile Information</h2>
            {!isEditing ? (
              <div className="space-y-2 text-foreground">
                <p><span className="text-muted-foreground">Name:</span> {formData.name || "Not set"}</p>
                <p><span className="text-muted-foreground">Email:</span> {formData.email || "Not set"}</p>
                <p><span className="text-muted-foreground">Position:</span> {formData.position || "Not set"}</p>
                <p><span className="text-muted-foreground">Age:</span> {formData.age || "Not set"}</p>
                <p><span className="text-muted-foreground">Height:</span> {formData.height ? `${formData.height} cm` : "Not set"}</p>
                <p><span className="text-muted-foreground">Weight:</span> {formData.weight ? `${formData.weight} kg` : "Not set"}</p>
                <p><span className="text-muted-foreground">Dominant Foot:</span> {formData.dominantFoot || "Not set"}</p>
                <p><span className="text-muted-foreground">Team:</span> {formData.team || "Not set"}</p>
                <p><span className="text-muted-foreground">Season Goals:</span> {formData.seasonGoals || "Not set"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Age</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Position</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Hooker, Fly-half"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Height (cm)</Label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Weight (kg)</Label>
                    <Input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Dominant Foot</Label>
                    <select
                      value={formData.dominantFoot}
                      onChange={(e) => setFormData({ ...formData, dominantFoot: e.target.value as "left" | "right" | "both" })}
                      className="w-full px-3 py-2 bg-input border border-border text-foreground rounded"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-foreground">Team</Label>
                    <Input
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      placeholder="Your team name"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-foreground">Season Goals</Label>
                    <textarea
                      value={formData.seasonGoals}
                      onChange={(e) => setFormData({ ...formData, seasonGoals: e.target.value })}
                      placeholder="What are your goals for this season?"
                      className="w-full px-3 py-2 bg-input border border-border text-foreground rounded min-h-24"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="btn-neon flex-1"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="btn-neon flex-1 flex items-center gap-2"
                >
                  <Save size={16} />
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Training Statistics */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Training Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground">Total Workouts</p>
            <p className="text-2xl font-bold text-neon-pink">{totalWorkouts}</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold text-neon-cyan">{totalDistance.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">km</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground">Gym Sessions</p>
            <p className="text-2xl font-bold text-neon-purple">{gymSessions}</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground">Running</p>
            <p className="text-2xl font-bold text-neon-cyan">{runningSessions}</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-xs text-muted-foreground">Conditioning</p>
            <p className="text-2xl font-bold text-neon-pink">{conditioningSessions}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
