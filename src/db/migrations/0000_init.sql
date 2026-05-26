CREATE TABLE "ballots" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"voter_id" text NOT NULL,
	"credits_spent" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"credits_per_voter" integer DEFAULT 100 NOT NULL,
	"admin_token" text NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"visibility" text DEFAULT 'unlisted' NOT NULL,
	"voter_mode" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closes_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "voter_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"token" text NOT NULL,
	"label" text,
	"consumed_at" timestamp with time zone,
	"ballot_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voter_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"ballot_id" text NOT NULL,
	"voter_id" text NOT NULL,
	"option_id" text NOT NULL,
	"num_votes" integer NOT NULL,
	"credits_spent" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ballots" ADD CONSTRAINT "ballots_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voter_tokens" ADD CONSTRAINT "voter_tokens_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_ballot_id_ballots_id_fk" FOREIGN KEY ("ballot_id") REFERENCES "public"."ballots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ballots_poll_voter_idx" ON "ballots" USING btree ("poll_id","voter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "options_poll_position_idx" ON "options" USING btree ("poll_id","position");--> statement-breakpoint
CREATE INDEX "polls_visibility_idx" ON "polls" USING btree ("visibility","created_at");--> statement-breakpoint
CREATE INDEX "voter_tokens_poll_idx" ON "voter_tokens" USING btree ("poll_id");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_ballot_option_idx" ON "votes" USING btree ("ballot_id","option_id");