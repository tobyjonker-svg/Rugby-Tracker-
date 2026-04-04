import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export function TopNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="sticky top-0 z-40 bg-background border-b hud-border">
      <div className="container flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold neon-glow">
            ⚡ RUGBY TRACKER
          </div>
          <div className="hidden md:block text-xs text-neon-cyan neon-glow-cyan">
            Train Harder. Play Smarter.
          </div>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="text-sm text-foreground">
                {user?.name}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="btn-neon">
                Login
              </Button>
            </a>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="p-2 text-neon-pink hover:text-neon-cyan transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="btn-neon text-sm">Login</Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
