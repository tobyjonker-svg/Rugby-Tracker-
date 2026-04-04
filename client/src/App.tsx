import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TopNav } from "./components/TopNav";
import { BottomNav } from "./components/BottomNav";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "./pages/Home";
import Training from "./pages/Training";
import Matches from "./pages/Matches";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import CoachPortal from "./pages/CoachPortal";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl font-bold neon-glow mb-4">⚡</div>
          <div className="text-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/training" component={isAuthenticated ? Training : Home} />
      <Route path="/matches" component={isAuthenticated ? Matches : Home} />
      <Route path="/goals" component={isAuthenticated ? Goals : Home} />
      <Route path="/analytics" component={isAuthenticated ? Analytics : Home} />
      <Route path="/profile" component={isAuthenticated ? Profile : Home} />
      <Route path="/coach" component={CoachPortal} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <TopNav />
            <main className="flex-1 pb-20 md:pb-0">
              <Router />
            </main>
            <BottomNav />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
