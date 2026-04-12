# 🏉 Rugby Tracker

**Train Harder. Play Smarter.**

A production-ready mobile-first web application for young rugby players to log fitness training, track match statistics, set performance goals, and monitor progress with AI-powered analytics and personalized recommendations.

**Live Demo**: https://rugbylog-6wexuk9b.manus.space

---

## ✨ Features

### Core Training & Performance Tracking
- **Training Logs**: Record gym workouts (exercises, sets, reps, weight), running sessions (distance, duration, pace), and conditioning drills with smart exercise dropdowns from training history
- **Match Statistics**: Track 16 performance metrics including tries, tackles, passes, conversions, penalties, and more
- **Personal Bests**: Automatically track and display personal records for key exercises and running distances
- **Goals Management**: Set SMART goals with progress tracking, completion status, and visual progress bars

### Analytics & Insights
- **Live Dashboard**: Real-time metrics showing workouts this week, total distance, personal bests, and recent match results
- **Advanced Analytics**: Interactive Recharts visualizations including training frequency trends, running distance analysis, performance distribution, and effort metrics
- **AI Recommendations**: Machine learning-powered training analysis that generates personalized workout suggestions based on actual training patterns and identifies strength/weakness areas
- **Coach Portal**: Read-only dashboard for coaches and parents to monitor player progress with performance metrics and consistency tracking

### User Experience
- **Cyberpunk Neon Aesthetic**: Custom-designed dark theme with neon pink (#ff006e), cyan (#00f5ff), and purple (#b537f2) accents
- **Mobile-First Design**: Responsive layout with bottom navigation on mobile and top navigation on desktop
- **Offline Support**: IndexedDB-based offline mode with automatic sync queue when connection is restored
- **Session Management**: Filter training history by type and date range, export data as CSV
- **Push Notifications**: Browser notifications for training reminders, goal milestones, and personal records
- **Social Sharing**: Share achievements on Twitter with pre-formatted templates
- **Profile Management**: Persistent user profile with age, position, height, weight, dominant foot, team, and season goals

### Authentication & Security
- **Manus OAuth**: Secure authentication with single sign-on integration
- **Session Persistence**: Secure cookie-based sessions across browser sessions
- **Protected Routes**: Role-based access control with public and protected endpoints

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Vite | Component-based UI with type safety |
| **Styling** | Custom CSS + Tailwind utilities | Cyberpunk neon theme with responsive design |
| **Backend** | Express.js, tRPC 11 | Type-safe API with end-to-end type inference |
| **Database** | SQLite, Drizzle ORM | Scalable schema with 11 tables |
| **Charts** | Recharts | Interactive data visualizations |
| **Routing** | Wouter | Lightweight client-side routing |
| **Offline** | IndexedDB | Local data persistence and sync queue |
| **Testing** | Vitest | Unit tests with 7 passing tests |
| **Auth** | Manus OAuth | Secure authentication |

---

## 📊 Database Schema

The application uses a scalable 11-table SQLite database:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with Manus OAuth integration |
| `profiles` | Extended user profile data (age, position, height, weight, etc.) |
| `training_sessions` | Gym, running, and conditioning workout logs |
| `exercises` | Exercise library with metadata |
| `matches` | Match statistics with 16 performance metrics |
| `goals` | User-defined performance goals with progress tracking |
| `personal_bests` | Cached personal record data for quick access |
| `coach_access` | Coach/parent permissions and player associations |
| `notifications` | Push notification history and preferences |
| `sync_queue` | Offline sync queue for pending changes |
| `ai_recommendations` | Cached AI training analysis results |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm (included with Node.js)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tobyjonker-svg/Rugby-Tracker-.git
   cd Rugby-Tracker-
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required variables (see [Environment Variables](#environment-variables) section)

4. **Initialize the database**
   ```bash
   pnpm run db:push
   ```

5. **Seed sample data (optional)**
   ```bash
   pnpm run db:seed
   ```

6. **Start the development server**
   ```bash
   pnpm run dev
   ```

   The app will be available at `http://localhost:3000`

---

## 🔧 Development

### Project Structure

```
rugby_tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, Training, Matches, Goals, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── services/      # Business logic (offline, notifications, AI)
│   │   ├── styles/        # CSS and theme configuration
│   │   └── App.tsx        # Main app component with routing
│   └── index.html         # HTML entry point
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── *.test.ts          # Unit tests
│   └── _core/             # Framework infrastructure (OAuth, context, etc.)
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── shared/                # Shared types and constants
└── package.json           # Dependencies and scripts
```

### Key Commands

```bash
# Development
pnpm run dev              # Start dev server with hot reload

# Testing
pnpm test                 # Run Vitest suite
pnpm test:watch          # Run tests in watch mode

# Database
pnpm run db:generate     # Generate migration SQL from schema changes
pnpm run db:push         # Apply pending migrations
pnpm run db:seed         # Seed sample data

# Building
pnpm run build           # Build for production
pnpm run preview         # Preview production build locally

# Code Quality
pnpm run lint            # Check code style
pnpm run format          # Format code with Prettier
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL=file:./dev.db

# Authentication (Manus OAuth)
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=your_jwt_secret_key

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

See `.env.example` for all available variables.

---

## 🧪 Testing

The project includes a comprehensive test suite using Vitest:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test server/rugby-tracker.test.ts
```

**Current Test Coverage**: 7 passing tests covering authentication, training logs, matches, goals, and profile management.

---

## 📱 Pages & Features

### Authenticated Pages

| Page | Route | Features |
|------|-------|----------|
| **Home** | `/` | Dashboard with live metrics, quick action cards, recent activity |
| **Training** | `/training` | Log gym/running/conditioning workouts, view history, filter, export CSV |
| **Matches** | `/matches` | Track match statistics, performance metrics, match history |
| **Goals** | `/goals` | Set goals, track progress, view completion status |
| **Analytics** | `/analytics` | Interactive charts, trends, performance insights |
| **Profile** | `/profile` | User profile settings, training summary, preferences |
| **Coach Portal** | `/coach` | Read-only dashboard for coaches/parents monitoring players |
| **Recommendations** | `/recommendations` | AI-powered training analysis and personalized suggestions |

### Public Pages

| Page | Route | Features |
|------|-------|----------|
| **Landing** | `/` (unauthenticated) | Hero section, feature showcase, sign-in CTA |

---

## 🎨 Design System

### Color Palette (Cyberpunk Neon)
- **Primary Accent**: Neon Pink `#ff006e`
- **Secondary Accent**: Cyan `#00f5ff`
- **Tertiary Accent**: Purple `#b537f2`
- **Background**: Deep Black `#0a0e27`
- **Text**: Light Gray `#e0e0e0`

### Typography
- **Headings**: Bold, uppercase with neon glow effect
- **Body**: Clean sans-serif for readability
- **Monospace**: Code and technical data

### Components
- Custom button styles with neon borders and hover effects
- Card-based layouts with subtle borders
- Progress bars with gradient fills
- Form inputs with focus states
- Loading spinners and skeletons

---

## 🔄 API Endpoints (tRPC)

All endpoints are type-safe through tRPC with end-to-end type inference:

### Training
- `training.createSession` - Log a new training session
- `training.listSessions` - Get training history with filters
- `training.deleteSession` - Delete a training session
- `training.exportCSV` - Export training data as CSV

### Matches
- `matches.createMatch` - Log a new match
- `matches.listMatches` - Get match history
- `matches.deleteMatch` - Delete a match

### Goals
- `goals.createGoal` - Create a new goal
- `goals.listGoals` - Get all goals with progress
- `goals.updateGoal` - Update goal progress
- `goals.deleteGoal` - Delete a goal

### Analytics
- `analytics.getTrainingStats` - Get training frequency and trends
- `analytics.getPerformanceStats` - Get performance metrics
- `analytics.getPersonalBests` - Get personal records

### Profile
- `profile.getProfile` - Get user profile data
- `profile.updateProfile` - Update profile information
- `profile.getTrainingSummary` - Get training statistics

### AI Recommendations
- `ai.analyzeTraining` - Analyze training patterns
- `ai.generateRecommendation` - Generate personalized workout
- `ai.getGoalInsights` - Get goal-specific insights
- `ai.suggestMilestone` - Suggest next milestone

### Coach Portal
- `coach.getPlayerStats` - Get player performance data
- `coach.listPlayers` - Get list of accessible players

---

## 🚀 Deployment

### Manus Hosting (Recommended)
The app is pre-configured for deployment on Manus:

1. **Create a checkpoint** via the Management UI
2. **Click Publish** in the Management UI
3. **Configure custom domain** (optional) in Settings → Domains

Your app will be live at `https://your-domain.manus.space`

### External Hosting
To deploy to other platforms (Vercel, Netlify, Railway, etc.):

1. **Build the project**
   ```bash
   pnpm run build
   ```

2. **Set environment variables** on your hosting platform

3. **Configure database** (ensure DATABASE_URL points to your production database)

4. **Deploy** according to your platform's documentation

---

## 🐛 Troubleshooting

### Database Issues
- **"Database locked"**: Ensure only one dev server is running
- **"Table not found"**: Run `pnpm run db:push` to apply migrations

### Authentication Issues
- **"OAuth callback failed"**: Verify VITE_APP_ID and OAUTH_SERVER_URL are correct
- **"Session expired"**: Clear browser cookies and log in again

### Build Issues
- **"TypeScript errors"**: Run `pnpm run type-check` to verify types
- **"Module not found"**: Run `pnpm install` to ensure all dependencies are installed

### Performance Issues
- **"Slow analytics queries"**: Check database indexes in `drizzle/schema.ts`
- **"Offline sync stuck"**: Clear IndexedDB via browser DevTools

---

## 📝 Contributing

To contribute improvements:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and add tests
3. Run `pnpm test` to verify tests pass
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push to your branch: `git push origin feature/your-feature`
6. Create a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👤 Author

**Toby Jonker** (tobyjonker@gmail.com)

Built with ❤️ using Manus

---

## 🤝 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact: tobyjonker@gmail.com
- Visit: https://help.manus.im

---

## 🎯 Roadmap

### Planned Features
- [ ] Team management and multi-player tracking
- [ ] Integration with wearable devices (Apple Watch, Garmin)
- [ ] Advanced performance analytics with ML predictions
- [ ] Video upload and analysis for technique review
- [ ] Social features (friend connections, leaderboards)
- [ ] Mobile app (iOS/Android native)
- [ ] Integration with coaching platforms

### Recent Improvements
- ✅ Cyberpunk neon UI redesign
- ✅ AI-powered training recommendations
- ✅ Offline mode with sync queue
- ✅ Push notifications
- ✅ Coach/parent portal
- ✅ CSV export functionality
- ✅ Live analytics dashboard

---

**Last Updated**: April 2026  
**Version**: 1.0.0 (Production Ready)
