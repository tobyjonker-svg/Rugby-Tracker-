import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const weeklyTraining = trpc.analytics.weeklyTraining.useQuery();
  const totalDistance = trpc.analytics.totalDistanceThisWeek.useQuery();

  // Sample data for charts
  const trainingFrequencyData = [
    { day: "Mon", sessions: 2 },
    { day: "Tue", sessions: 1 },
    { day: "Wed", sessions: 2 },
    { day: "Thu", sessions: 1 },
    { day: "Fri", sessions: 2 },
    { day: "Sat", sessions: 1 },
    { day: "Sun", sessions: 0 },
  ];

  const distanceTrendData = [
    { week: "Week 1", distance: 15.2 },
    { week: "Week 2", distance: 18.5 },
    { week: "Week 3", distance: 16.8 },
    { week: "Week 4", distance: 22.1 },
  ];

  const performanceData = [
    { name: "Tackles", value: 85 },
    { name: "Tries", value: 12 },
    { name: "Assists", value: 8 },
    { name: "Conversions", value: 15 },
  ];

  const effortDistribution = [
    { name: "High (8-10)", value: 35 },
    { name: "Medium (5-7)", value: 50 },
    { name: "Low (1-4)", value: 15 },
  ];

  const COLORS = ["#ff006e", "#00f5ff", "#b537f2", "#ffd60a"];

  return (
    <div className="container py-6 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neon-pink neon-glow">
          Performance Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your progress with detailed statistics and trends
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-box">
          <div className="stat-box-label">This Week</div>
          <div className="stat-box-value">9</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </Card>

        <Card className="stat-box">
          <div className="stat-box-label">Total Distance</div>
          <div className="stat-box-value">22.1</div>
          <div className="text-xs text-muted-foreground">km</div>
        </Card>

        <Card className="stat-box">
          <div className="stat-box-label">Avg Effort</div>
          <div className="stat-box-value">6.8</div>
          <div className="text-xs text-muted-foreground">/10</div>
        </Card>

        <Card className="stat-box">
          <div className="stat-box-label">Matches</div>
          <div className="stat-box-value text-neon-cyan">4</div>
          <div className="text-xs text-muted-foreground">3W 1L</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Training Frequency */}
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Weekly Training Frequency
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trainingFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #ff006e",
                }}
              />
              <Bar dataKey="sessions" fill="#ff006e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distance Trend */}
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Running Distance Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={distanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #00f5ff",
                }}
              />
              <Line
                type="monotone"
                dataKey="distance"
                stroke="#00f5ff"
                strokeWidth={2}
                dot={{ fill: "#00f5ff", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Stats */}
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Performance Stats (Last 4 Matches)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #b537f2",
                }}
              />
              <Bar dataKey="value" fill="#b537f2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Effort Distribution */}
        <Card className="card-neon p-6">
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Effort Level Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={effortDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #ff006e",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Personal Bests */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Personal Bests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-muted-foreground text-sm">Push-ups (single set)</p>
            <p className="text-3xl font-bold text-neon-pink">45</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-muted-foreground text-sm">Running Distance</p>
            <p className="text-3xl font-bold text-neon-cyan">10.2 km</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-muted-foreground text-sm">Bench Press</p>
            <p className="text-3xl font-bold text-neon-purple">100 kg</p>
          </div>
          <div className="p-4 bg-background rounded border border-border">
            <p className="text-muted-foreground text-sm">Tackles (single match)</p>
            <p className="text-3xl font-bold text-neon-pink">18</p>
          </div>
        </div>
      </Card>

      {/* Goals Progress */}
      <Card className="card-neon p-6">
        <h2 className="text-xl font-bold text-neon-cyan mb-4">Goals Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-foreground">Do 50 push-ups without stopping</span>
              <span className="text-neon-pink font-bold">90%</span>
            </div>
            <div className="progress-neon">
              <div className="progress-neon-fill" style={{ width: "90%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-foreground">Run 25 km per week</span>
              <span className="text-neon-cyan font-bold">88%</span>
            </div>
            <div className="progress-neon">
              <div className="progress-neon-fill" style={{ width: "88%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-foreground">Average 8/10 effort in matches</span>
              <span className="text-neon-purple font-bold">75%</span>
            </div>
            <div className="progress-neon">
              <div className="progress-neon-fill" style={{ width: "75%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-foreground">20 tackles per match</span>
              <span className="text-neon-pink font-bold">100%</span>
            </div>
            <div className="progress-neon">
              <div className="progress-neon-fill" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
