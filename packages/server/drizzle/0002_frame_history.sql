CREATE TABLE "frame_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"projectId" varchar NOT NULL,
	"frameId" varchar NOT NULL,
	"designCode" text NOT NULL,
	"label" varchar,
	"created_at" timestamp DEFAULT now()
);
---> statement-breakpoint
ALTER TABLE "frame_history" ADD CONSTRAINT "frame_history_projectId_projects_projectId_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("projectId") ON DELETE no action ON UPDATE no action;
---> statement-breakpoint
ALTER TABLE "frame_history" ADD CONSTRAINT "frame_history_frameId_frames_frameId_fk" FOREIGN KEY ("frameId") REFERENCES "public"."frames"("frameId") ON DELETE no action ON UPDATE no action;
