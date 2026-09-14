import { describe, expect, it } from "vitest";
import { createDatabase } from "@/db";
import { DEMO_PASSWORD } from "@/lib/domain";
import { AppError, ForbiddenError } from "@/lib/errors";
import { createCustomer } from "@/lib/services/customers";
import { getDashboard } from "@/lib/services/dashboard";
import { addJobNote, createJob, listJobs, updateJob, writeJobScope } from "@/lib/services/jobs";
import {
  authenticateUser,
  createTeammate,
  registerFirstAdmin,
} from "@/lib/services/users";

async function freshDb(seedDemo = true) {
  return createDatabase({ inMemory: true, seedDemo });
}

describe("Job Command core workflows", () => {
  it("seeds demo operators and authenticates the admin", async () => {
    const { db } = await freshDb();
    const admin = await authenticateUser(db, "admin@jobcommand.local", DEMO_PASSWORD);
    expect(admin.role).toBe("admin");
    expect(admin.email).toBe("admin@jobcommand.local");
  });

  it("rejects a second public signup once users exist", async () => {
    const { db } = await freshDb();
    await expect(
      registerFirstAdmin(db, {
        name: "Intruder",
        email: "other@example.com",
        password: "Password#1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("creates the first admin when the workspace is empty", async () => {
    const { db } = await freshDb(false);
    const admin = await registerFirstAdmin(db, {
      name: "Founder",
      email: "founder@example.com",
      password: "Password#1",
    });
    expect(admin.role).toBe("admin");
  });

  it("lets a dispatcher create and assign a job, then blocks invalid transitions", async () => {
    const { db } = await freshDb();
    const dispatcher = await authenticateUser(
      db,
      "dispatch@jobcommand.local",
      DEMO_PASSWORD,
    );
    const customer = await createCustomer(db, dispatcher, {
      name: "Acme Cold Storage",
      email: "ops@acme.example",
      phone: "555-0199",
      address: "1 Icehouse Rd",
    });
    const job = await createJob(db, dispatcher, {
      title: "Calibrate freezer sensors",
      description: "Check zone 4 probes",
      customerId: customer.id,
      priority: "high",
      assignedToUserId: "user_tech",
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      location: "Zone 4",
    });
    expect(job.status).toBe("assigned");
    expect(job.assigneeName).toBe("Riley Okonkwo");

    await expect(
      updateJob(db, dispatcher, job.id, { status: "completed" }),
    ).rejects.toBeInstanceOf(AppError);

    const inProgress = await updateJob(db, dispatcher, job.id, { status: "in_progress" });
    expect(inProgress.status).toBe("in_progress");
    const completed = await updateJob(db, dispatcher, job.id, { status: "completed" });
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toBeTruthy();
  });

  it("lets dispatch send a lead through estimate before scheduling", async () => {
    const { db } = await freshDb();
    const dispatcher = await authenticateUser(
      db,
      "dispatch@jobcommand.local",
      DEMO_PASSWORD,
    );
    const jobs = await listJobs(db, dispatcher);
    const lead = jobs.find((item) => item.jobNumber === 1003);
    expect(lead?.status).toBe("queued");
    const sent = await updateJob(db, dispatcher, lead!.id, { status: "estimate_sent" });
    expect(sent.status).toBe("estimate_sent");
    const approved = await updateJob(db, dispatcher, lead!.id, { status: "estimate_approved" });
    expect(approved.status).toBe("estimate_approved");
  });

  it("scopes technicians to assigned jobs only", async () => {
    const { db } = await freshDb();
    const tech = await authenticateUser(db, "tech@jobcommand.local", DEMO_PASSWORD);
    const jobs = await listJobs(db, tech);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((job) => job.assignedToUserId === tech.id)).toBe(true);

    const unassigned = jobs.find((job) => job.jobNumber === 1003);
    expect(unassigned).toBeUndefined();
  });

  it("lets a technician add a note on an assigned job", async () => {
    const { db } = await freshDb();
    const tech = await authenticateUser(db, "tech@jobcommand.local", DEMO_PASSWORD);
    const jobs = await listJobs(db, tech);
    const job = jobs.find((item) => item.status === "in_progress");
    expect(job).toBeTruthy();
    const note = await addJobNote(db, tech, job!.id, "Compressor isolated, waiting on part.");
    expect(note.body).toContain("Compressor");
  });

  it("writes a crew scope from typed notes", async () => {
    const { db } = await freshDb();
    const admin = await authenticateUser(db, "admin@jobcommand.local", DEMO_PASSWORD);
    const jobs = await listJobs(db, admin);
    const job = jobs.find((item) => item.jobNumber === 1001);
    expect(job).toBeTruthy();
    const scope = await writeJobScope(
      db,
      admin,
      job!.id,
      "swap the compressor and log the refrigerant charge",
    );
    expect(scope).toMatch(/compressor/i);
    expect(scope.endsWith(".")).toBe(true);
  });

  it("lists staffed active jobs with crew clocks and tracking", async () => {
    const { db } = await freshDb();
    const admin = await authenticateUser(db, "admin@jobcommand.local", DEMO_PASSWORD);
    const { listActiveCrewJobs } = await import("@/lib/services/crew");
    const crewJobs = await listActiveCrewJobs(db, admin);
    expect(crewJobs.length).toBeGreaterThan(0);
    const dock = crewJobs.find((job) => job.jobNumber === 1001);
    expect(dock).toBeTruthy();
    expect(dock?.customerName).toBe("Northwind Logistics");
    expect(dock?.customerAddress).toContain("Dockside");
    expect(dock?.destination).toContain("Dockside");
    expect(dock?.crew.map((member) => member.name)).toEqual(
      expect.arrayContaining(["Riley Okonkwo", "Dana Cole"]),
    );
    const dana = dock?.crew.find((member) => member.name === "Dana Cole");
    expect(dana?.shift.clockedIn).toBe(true);
    expect(dana?.shift.overtimeWarning).toBe(true);
    expect(dana?.phone).toBe("555-0104");
    const livJob = crewJobs.find((job) => job.crew.some((member) => member.name === "Liv Park"));
    const liv = livJob?.crew.find((member) => member.name === "Liv Park");
    expect(liv?.shift.clockedIn).toBe(false);
  });

  it("returns dashboard metrics for the command board", async () => {
    const { db } = await freshDb();
    const admin = await authenticateUser(db, "admin@jobcommand.local", DEMO_PASSWORD);
    const dashboard = await getDashboard(db, admin);
    expect(dashboard.metrics.open).toBeGreaterThan(0);
    expect(dashboard.columns.in_progress.length).toBeGreaterThan(0);
    expect(dashboard.columns.estimate_sent.length).toBeGreaterThan(0);
    expect(dashboard.columns.estimate_approved.length).toBeGreaterThan(0);
    expect(dashboard.columns.queued.length).toBeGreaterThan(0);
    expect(dashboard.focus).toBeTruthy();
    expect(dashboard.overdueJobs).toBeDefined();
  });

  it("uses in-memory PGlite when Vercel has no DATABASE_URL", async () => {
    const previousVercel = process.env.VERCEL;
    const previousUrl = process.env.DATABASE_URL;
    process.env.VERCEL = "1";
    delete process.env.DATABASE_URL;
    try {
      const { shouldUseInMemoryPglite } = await import("@/db");
      expect(shouldUseInMemoryPglite()).toBe(true);
      const { driver } = await createDatabase();
      expect(driver).toBe("pglite");
    } finally {
      if (previousVercel === undefined) {
        delete process.env.VERCEL;
      } else {
        process.env.VERCEL = previousVercel;
      }
      if (previousUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousUrl;
      }
    }
  });

  it("prevents dispatchers from creating admin teammates", async () => {
    const { db } = await freshDb();
    const dispatcher = await authenticateUser(
      db,
      "dispatch@jobcommand.local",
      DEMO_PASSWORD,
    );
    await expect(
      createTeammate(db, dispatcher, {
        name: "New Admin",
        email: "newadmin@example.com",
        password: "Password#1",
        role: "admin",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
