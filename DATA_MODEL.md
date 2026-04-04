# Rugby Tracker - Data Model Design

## Core Entities

### Users Table
Extends the default user table with rugby-specific profile data.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| openId | varchar | Manus OAuth identifier |
| name | text | Player name |
| email | varchar | Email address |
| age | int | Player age |
| position | varchar | Preferred rugby position |
| height | int | Height in cm |
| weight | int | Weight in kg |
| dominantFoot | enum | 'left' \| 'right' |
| team | varchar | Current team (nullable for MVP) |
| profilePhotoUrl | text | Profile photo URL (S3) |
| seasonGoals | text | Season goals summary |
| createdAt | timestamp | Account creation |
| updatedAt | timestamp | Last update |

### Training Sessions Table
Logs all training activities with flexible exercise tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| userId | int | Foreign key to users |
| date | timestamp | Training date |
| type | enum | 'gym' \| 'running' \| 'conditioning' \| 'rugby_practice' \| 'recovery' \| 'speed_work' \| 'skills_practice' \| 'other' |
| duration | int | Duration in minutes |
| effortLevel | int | 1-10 scale |
| notes | text | Training notes |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

### Gym Logs Table
Detailed gym exercise tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| trainingSessionId | int | Foreign key to training_sessions |
| exerciseName | varchar | Exercise name |
| sets | int | Number of sets |
| reps | int | Reps per set |
| weight | decimal | Weight in kg |
| notes | text | Exercise notes |

### Running Logs Table
Running session metrics.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| trainingSessionId | int | Foreign key to training_sessions |
| distance | decimal | Distance in km |
| time | int | Time in minutes |
| averagePace | decimal | Pace in min/km (calculated) |
| sprintDistance | decimal | Sprint distance in km |
| numberOfSprints | int | Number of sprints |
| bestSprintTime | int | Best sprint time in seconds |

### Conditioning Logs Table
Bodyweight and conditioning exercise tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| trainingSessionId | int | Foreign key to training_sessions |
| exerciseType | enum | 'pushups' \| 'situps' \| 'pullups' \| 'squats' \| 'planks' \| 'burpees' \| 'lunges' \| 'shuttle_runs' \| 'custom' |
| reps | int | Reps completed |
| time | int | Time in seconds (for timed exercises) |
| notes | text | Exercise notes |

### Match Stats Table
Rugby match performance tracking.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| userId | int | Foreign key to users |
| date | timestamp | Match date |
| opponent | varchar | Opponent team name |
| competition | varchar | League/competition name |
| venue | varchar | Match venue |
| homeAway | enum | 'home' \| 'away' |
| position | varchar | Position played |
| minutesPlayed | int | Minutes on field |
| finalScore | varchar | Final score (e.g., "28-21") |
| result | enum | 'win' \| 'loss' \| 'draw' |
| notes | text | Match notes |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

### Match Performance Stats Table
Detailed individual performance metrics per match.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| matchId | int | Foreign key to match_stats |
| tacklesMade | int | Tackles made |
| tacklesMissed | int | Tackles missed |
| triesScored | int | Tries scored |
| conversionsKicked | int | Conversions kicked |
| penaltiesKicked | int | Penalties kicked |
| dropGoals | int | Drop goals |
| carries | int | Number of carries |
| metresGained | int | Metres gained |
| turnoversWon | int | Turnovers won |
| offloads | int | Offloads made |
| passesCompleted | int | Passes completed |
| knockOns | int | Knock-ons |
| penaltiesConceded | int | Penalties conceded |
| lineBreaks | int | Line breaks |
| assists | int | Assists |
| kicksFromHand | int | Kicks from hand |

### Goals Table
Personal goal tracking with progress monitoring.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| userId | int | Foreign key to users |
| title | varchar | Goal title |
| category | enum | 'fitness' \| 'match_performance' \| 'training' \| 'personal' |
| targetNumber | decimal | Target value |
| currentProgress | decimal | Current progress |
| deadline | timestamp | Goal deadline |
| status | enum | 'active' \| 'completed' \| 'abandoned' |
| createdAt | timestamp | Goal creation |
| updatedAt | timestamp | Last update |

### Personal Bests Table
Tracks user's personal records.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| userId | int | Foreign key to users |
| metricType | enum | 'pushups' \| 'distance' \| 'pace' \| 'weight' \| 'tries' \| 'tackles' \| 'custom' |
| value | decimal | PB value |
| unit | varchar | Unit of measurement |
| achievedDate | timestamp | Date achieved |
| context | text | Context (e.g., exercise name, match opponent) |

### Teams Table (Future)
For multi-user team support.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| name | varchar | Team name |
| school | varchar | School/organization |
| coach | varchar | Coach name |
| createdAt | timestamp | Team creation |

### Team Memberships Table (Future)
Links users to teams.

| Field | Type | Notes |
|-------|------|-------|
| id | int | Primary key |
| userId | int | Foreign key to users |
| teamId | int | Foreign key to teams |
| joinedAt | timestamp | Join date |
| role | enum | 'player' \| 'coach' \| 'admin' |

## Key Relationships

- **Users → Training Sessions**: One-to-many
- **Users → Match Stats**: One-to-many
- **Users → Goals**: One-to-many
- **Users → Personal Bests**: One-to-many
- **Training Sessions → Gym Logs**: One-to-many
- **Training Sessions → Running Logs**: One-to-one
- **Training Sessions → Conditioning Logs**: One-to-many
- **Match Stats → Match Performance Stats**: One-to-one
- **Users → Teams** (future): Many-to-many through Team Memberships

## Scalability Considerations

1. **Multi-user support**: All tables include userId foreign keys for easy team expansion
2. **Team structure**: Teams and TeamMemberships tables prepared for future implementation
3. **Flexible exercise tracking**: Separate tables for different training types allow custom metrics
4. **Performance optimization**: Indexed userId and date fields for fast queries
5. **Data aggregation**: Denormalized personal_bests for quick dashboard queries
