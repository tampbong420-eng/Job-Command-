import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { JobEventType, JobPriority, JobStatus, UserRole } from "@/lib/domain";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<UserRole>().notNull().default("technician"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    notes: text("notes"),
    createdByUserId: text("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("customers_name_idx").on(table.name)],
);

export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    jobNumber: integer("job_number").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").$type<JobStatus>().notNull().default("queued"),
    priority: text("priority").$type<JobPriority>().notNull().default("medium"),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    assignedToUserId: text("assigned_to_user_id").references(() => users.id),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    location: text("location"),
    createdByUserId: text("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("jobs_status_idx").on(table.status),
    index("jobs_assignee_idx").on(table.assignedToUserId),
    index("jobs_customer_idx").on(table.customerId),
  ],
);

export const jobNotes = pgTable("job_notes", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  authorUserId: text("author_user_id").references(() => users.id),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobEvents = pgTable(
  "job_events",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => users.id),
    type: text("type").$type<JobEventType>().notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("job_events_job_idx").on(table.jobId)],
);

export const jobAssignments = pgTable(
  "job_assignments",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("job_assignments_job_idx").on(table.jobId),
    index("job_assignments_user_idx").on(table.userId),
  ],
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("time_entries_user_idx").on(table.userId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  assignedJobs: many(jobs),
  notes: many(jobNotes),
  assignments: many(jobAssignments),
  timeEntries: many(timeEntries),
}));

export const customersRelations = relations(customers, ({ many, one }) => ({
  jobs: many(jobs),
  createdBy: one(users, {
    fields: [customers.createdByUserId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  assignee: one(users, {
    fields: [jobs.assignedToUserId],
    references: [users.id],
    relationName: "assignee",
  }),
  createdBy: one(users, {
    fields: [jobs.createdByUserId],
    references: [users.id],
    relationName: "createdBy",
  }),
  notes: many(jobNotes),
  events: many(jobEvents),
  assignments: many(jobAssignments),
}));

export const jobNotesRelations = relations(jobNotes, ({ one }) => ({
  job: one(jobs, {
    fields: [jobNotes.jobId],
    references: [jobs.id],
  }),
  author: one(users, {
    fields: [jobNotes.authorUserId],
    references: [users.id],
  }),
}));

export const jobEventsRelations = relations(jobEvents, ({ one }) => ({
  job: one(jobs, {
    fields: [jobEvents.jobId],
    references: [jobs.id],
  }),
  actor: one(users, {
    fields: [jobEvents.actorUserId],
    references: [users.id],
  }),
}));

export const jobAssignmentsRelations = relations(jobAssignments, ({ one }) => ({
  job: one(jobs, {
    fields: [jobAssignments.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [jobAssignments.userId],
    references: [users.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [timeEntries.jobId],
    references: [jobs.id],
  }),
}));

export type UserRow = typeof users.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type JobNoteRow = typeof jobNotes.$inferSelect;
export type JobEventRow = typeof jobEvents.$inferSelect;
export type JobAssignmentRow = typeof jobAssignments.$inferSelect;
export type TimeEntryRow = typeof timeEntries.$inferSelect;
