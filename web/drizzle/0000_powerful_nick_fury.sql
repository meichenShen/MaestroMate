CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`session_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`email` text,
	`page` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_created_at` ON `feedback` (`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_session_time` ON `feedback` (`session_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `feedback_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_sessions_time` ON `feedback_sessions` (`created_at`);