CREATE TABLE `chat_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`session_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_requests_time` ON `chat_requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `chat_requests_session_time` ON `chat_requests` (`session_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_sessions_time` ON `chat_sessions` (`created_at`);