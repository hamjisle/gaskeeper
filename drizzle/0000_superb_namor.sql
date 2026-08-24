CREATE TABLE `coop_actions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coop_sessions` (
	`code` text PRIMARY KEY NOT NULL,
	`connected` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `keeper_profiles` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`missions` integer DEFAULT 0 NOT NULL,
	`best_index` integer DEFAULT 0 NOT NULL,
	`badges` text DEFAULT '[]' NOT NULL,
	`sensor_level` integer DEFAULT 1 NOT NULL,
	`suit_tier` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mission_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`victory` integer NOT NULL,
	`score` integer NOT NULL,
	`time_used` integer NOT NULL,
	`hp` integer NOT NULL,
	`seals` integer NOT NULL,
	`defeated` integer NOT NULL,
	`knowledge` integer NOT NULL,
	`rescued` integer NOT NULL,
	`scenario_id` text NOT NULL,
	`difficulty` text NOT NULL,
	`safety_judgment` integer NOT NULL,
	`golden_time` integer NOT NULL,
	`rescue_score` integer NOT NULL,
	`knowledge_score` integer NOT NULL,
	`safety_index` integer NOT NULL,
	`wrong_choices` integer NOT NULL,
	`spark_hits` integer NOT NULL,
	`gas_exposure` integer NOT NULL,
	`pulse_count` integer NOT NULL,
	`last_mistake` text DEFAULT '' NOT NULL,
	`coop_actions` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
