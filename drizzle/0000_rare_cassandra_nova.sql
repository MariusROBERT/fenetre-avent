CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`description` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`rules_accepted_at` text NOT NULL,
	`rules_version` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "registrations_contact_required" CHECK("registrations"."email" IS NOT NULL OR "registrations"."phone" IS NOT NULL),
	CONSTRAINT "registrations_status_valid" CHECK("registrations"."status" IN ('pending', 'confirmed', 'cancelled'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_active_date_unique` ON `registrations` (`date`) WHERE "registrations"."status" <> 'cancelled';--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`priority` integer DEFAULT 1 NOT NULL
);
