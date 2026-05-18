CREATE TABLE "curriculum_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"subject" text NOT NULL,
	"depth" smallint NOT NULL,
	"label" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"course" text,
	"applied_grades" text,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "error_patterns" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"subject" text NOT NULL,
	"name" text NOT NULL,
	"root_cause" text NOT NULL,
	"frequency" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"conquered" integer DEFAULT 0 NOT NULL,
	"difficulty_min" real,
	"difficulty_max" real,
	CONSTRAINT "error_patterns_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "leitner_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"problem_sku" text NOT NULL,
	"subject" text NOT NULL,
	"summary" text NOT NULL,
	"error_pattern_id" text,
	"box" smallint NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp with time zone NOT NULL,
	"first_missed_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_result" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"source" text NOT NULL,
	"curriculum_node_id" text,
	"retention" real NOT NULL,
	"first_learned_at" timestamp with time zone NOT NULL,
	"next_review_at" timestamp with time zone NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"hint" text,
	"mnemonic" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"sku" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"unit" text NOT NULL,
	"difficulty" real NOT NULL,
	"discrimination" real,
	"guessing" real,
	"statement" text NOT NULL,
	"choices" jsonb NOT NULL,
	"answer_index" smallint NOT NULL,
	"hints" text[] DEFAULT '{}'::text[] NOT NULL,
	"short_explanation" text,
	"expected_sec" integer,
	"source_kind" text,
	"source_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solve_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sku" text NOT NULL,
	"result" text NOT NULL,
	"selected_index" smallint,
	"time_sec" integer NOT NULL,
	"hints_used" integer DEFAULT 0 NOT NULL,
	"theta_delta" real DEFAULT 0 NOT NULL,
	"is_bookmarked" boolean DEFAULT false NOT NULL,
	"attempted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theta_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"theta" real NOT NULL,
	"se" real NOT NULL,
	"expected_grade" smallint,
	"percentile" smallint,
	"delta_24h" real,
	"recorded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_curriculum_mastery" (
	"user_id" text NOT NULL,
	"node_id" text NOT NULL,
	"mastery" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_curriculum_mastery_user_id_node_id_pk" PRIMARY KEY("user_id","node_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"grade" text NOT NULL,
	"track" text NOT NULL,
	"school" text,
	"exam_date" date NOT NULL,
	"exam_label" text NOT NULL,
	"focus_subjects" text[] DEFAULT '{}'::text[] NOT NULL,
	"weekly_hours" integer NOT NULL,
	"preferred_study_time" text NOT NULL,
	"joined_at" timestamp with time zone NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wrong_attempt_diagnoses" (
	"attempt_id" text PRIMARY KEY NOT NULL,
	"wrong_reason_codes" text[] NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leitner_cards" ADD CONSTRAINT "leitner_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leitner_cards" ADD CONSTRAINT "leitner_cards_error_pattern_id_error_patterns_id_fk" FOREIGN KEY ("error_pattern_id") REFERENCES "public"."error_patterns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_curriculum_node_id_curriculum_nodes_id_fk" FOREIGN KEY ("curriculum_node_id") REFERENCES "public"."curriculum_nodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solve_attempts" ADD CONSTRAINT "solve_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solve_attempts" ADD CONSTRAINT "solve_attempts_sku_problems_sku_fk" FOREIGN KEY ("sku") REFERENCES "public"."problems"("sku") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theta_snapshots" ADD CONSTRAINT "theta_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_curriculum_mastery" ADD CONSTRAINT "user_curriculum_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_curriculum_mastery" ADD CONSTRAINT "user_curriculum_mastery_node_id_curriculum_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."curriculum_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wrong_attempt_diagnoses" ADD CONSTRAINT "wrong_attempt_diagnoses_attempt_id_solve_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."solve_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "curriculum_nodes_subject_depth_idx" ON "curriculum_nodes" USING btree ("subject","depth");--> statement-breakpoint
CREATE INDEX "curriculum_nodes_parent_idx" ON "curriculum_nodes" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "leitner_cards_user_next_review_idx" ON "leitner_cards" USING btree ("user_id","next_review_at");--> statement-breakpoint
CREATE INDEX "leitner_cards_user_box_idx" ON "leitner_cards" USING btree ("user_id","box");--> statement-breakpoint
CREATE INDEX "memory_items_user_next_review_idx" ON "memory_items" USING btree ("user_id","next_review_at");--> statement-breakpoint
CREATE INDEX "memory_items_user_source_idx" ON "memory_items" USING btree ("user_id","source");--> statement-breakpoint
CREATE INDEX "problems_subject_idx" ON "problems" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "solve_attempts_user_attempted_idx" ON "solve_attempts" USING btree ("user_id","attempted_at");--> statement-breakpoint
CREATE INDEX "solve_attempts_sku_idx" ON "solve_attempts" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "theta_snapshots_user_subject_recorded_idx" ON "theta_snapshots" USING btree ("user_id","subject","recorded_at");