CREATE TABLE `conditioning_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainingSessionId` int NOT NULL,
	`exerciseType` enum('pushups','situps','pullups','squats','planks','burpees','lunges','shuttle_runs','custom') NOT NULL,
	`reps` int,
	`time` int,
	`notes` text,
	CONSTRAINT `conditioning_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('fitness','match_performance','training','personal') NOT NULL,
	`targetNumber` decimal(10,2),
	`currentProgress` decimal(10,2) DEFAULT '0',
	`deadline` timestamp,
	`status` enum('active','completed','abandoned') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gym_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainingSessionId` int NOT NULL,
	`exerciseName` varchar(255) NOT NULL,
	`sets` int,
	`reps` int,
	`weight` decimal(6,2),
	`notes` text,
	CONSTRAINT `gym_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `match_performance_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`tacklesMade` int,
	`tacklesMissed` int,
	`triesScored` int,
	`conversionsKicked` int,
	`penaltiesKicked` int,
	`dropGoals` int,
	`carries` int,
	`metresGained` int,
	`turnoversWon` int,
	`offloads` int,
	`passesCompleted` int,
	`knockOns` int,
	`penaltiesConceded` int,
	`lineBreaks` int,
	`assists` int,
	`kicksFromHand` int,
	CONSTRAINT `match_performance_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `match_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`opponent` varchar(255) NOT NULL,
	`competition` varchar(255),
	`venue` varchar(255),
	`homeAway` enum('home','away'),
	`position` varchar(100),
	`minutesPlayed` int,
	`finalScore` varchar(50),
	`result` enum('win','loss','draw'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `match_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_bests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` enum('pushups','distance','pace','weight','tries','tackles','custom') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`unit` varchar(50),
	`achievedDate` timestamp NOT NULL,
	`context` text,
	CONSTRAINT `personal_bests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `running_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainingSessionId` int NOT NULL,
	`distance` decimal(8,2),
	`time` int,
	`averagePace` decimal(6,2),
	`sprintDistance` decimal(8,2),
	`numberOfSprints` int,
	`bestSprintTime` int,
	CONSTRAINT `running_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`role` enum('player','coach','admin') DEFAULT 'player',
	CONSTRAINT `team_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`school` varchar(255),
	`coach` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`type` enum('gym','running','conditioning','rugby_practice','recovery','speed_work','skills_practice','other') NOT NULL,
	`duration` int,
	`effortLevel` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD `position` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `height` int;--> statement-breakpoint
ALTER TABLE `users` ADD `weight` int;--> statement-breakpoint
ALTER TABLE `users` ADD `dominantFoot` enum('left','right','both');--> statement-breakpoint
ALTER TABLE `users` ADD `team` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `seasonGoals` text;