-- Original ChatGPT Sites/Cloudflare D1 schema retained for teams that want
-- to build a D1 adapter instead of using the included PostgreSQL adapter.
CREATE TABLE `beta_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL,
	`contact_name` text NOT NULL,
	`region` text,
	`primary_tcg` text,
	`wanted_feature` text,
	`business_name` text,
	`website` text,
	`ecommerce_platform` text,
	`product_count` text,
	`business_type` text,
	`catalogue_method` text,
	`attends_events` text,
	`event_name` text,
	`event_location` text,
	`event_date` text,
	`vendor_count` text,
	`ticket_link` text,
	`event_vendor_mode` integer DEFAULT false NOT NULL,
	`message` text,
	`contact_consent` integer NOT NULL,
	`marketing_consent` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'website' NOT NULL,
	`created_at` integer NOT NULL
);

CREATE UNIQUE INDEX `beta_leads_role_email_unique`
  ON `beta_leads` (`role`, `email`);
