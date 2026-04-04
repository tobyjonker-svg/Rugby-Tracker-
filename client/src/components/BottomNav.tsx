import { Link } from "wouter";
import { Home, Dumbbell, Trophy, Target, BarChart3, User, Users } from "lucide-react";
import { useLocation } from "wouter";

export function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/training", icon: Dumbbell, label: "Training" },
    { path: "/matches", icon: Trophy, label: "Matches" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/coach", icon: Users, label: "Coach" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t hud-border md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
              isActive(path)
                ? "text-neon-pink neon-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={label}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
