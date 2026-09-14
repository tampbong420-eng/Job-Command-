import { and, eq, isNull } from "drizzle-orm";
import type { AppDb } from "@/db/types";
import { customers, jobAssignments, jobs, timeEntries, users } from "@/db/schema";
import { portraitUrl } from "@/lib/avatars";
import { DEMO_PASSWORD } from "@/lib/domain";
import { hashPassword } from "@/lib/password";

export async function seedDemoData(db: AppDb) {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    await seedCoreDemo(db);
  }
  await seedCrewDemo(db);
}

async function seedCoreDemo(db: AppDb) {

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const now = new Date();

  const adminId = "user_admin";
  const dispatcherId = "user_dispatcher";
  const techId = "user_tech";
  const danaId = "user_dana";
  const livId = "user_liv";
  const viewerId = "user_viewer";

  await db.insert(users).values([
    {
      id: adminId,
      email: "admin@jobcommand.local",
      name: "Avery Chen",
      passwordHash,
      role: "admin",
      phone: "555-0100",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: dispatcherId,
      email: "dispatch@jobcommand.local",
      name: "Morgan Hale",
      passwordHash,
      role: "dispatcher",
      phone: "555-0101",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: techId,
      email: "tech@jobcommand.local",
      name: "Riley Okonkwo",
      passwordHash,
      role: "technician",
      phone: "555-0102",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: danaId,
      email: "dana@jobcommand.local",
      name: "Dana Cole",
      passwordHash,
      role: "technician",
      phone: "555-0104",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: livId,
      email: "liv@jobcommand.local",
      name: "Liv Park",
      passwordHash,
      role: "technician",
      phone: "555-0105",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: viewerId,
      email: "viewer@jobcommand.local",
      name: "Sam Patel",
      passwordHash,
      role: "viewer",
      phone: "555-0103",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const northId = "cust_northwind";
  const harborId = "cust_harbor";
  const loftId = "cust_loft";

  await db.insert(customers).values([
    {
      id: northId,
      name: "Northwind Logistics",
      email: "ops@northwind.example",
      phone: "555-2001",
      address: "410 Dockside Ave, Oakland, CA",
      notes: "Preferred window 07:00–11:00. Badge required at gate.",
      createdByUserId: dispatcherId,
    },
    {
      id: harborId,
      name: "Harbor Medical Group",
      email: "facilities@harbor.example",
      phone: "555-2002",
      address: "88 Embarcadero, San Francisco, CA",
      notes: "HIPAA site. Sign in at security desk.",
      createdByUserId: dispatcherId,
    },
    {
      id: loftId,
      name: "Loft & Beam Interiors",
      email: "studio@loftbeam.example",
      phone: "555-2003",
      address: "19 Valencia St, San Francisco, CA",
      notes: "After-hours access code in job notes.",
      createdByUserId: adminId,
    },
  ]);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const laterToday = new Date(Date.now() + 3 * 60 * 60 * 1000);

  await db.insert(jobs).values([
    {
      id: "job_dock_cooler",
      jobNumber: 1001,
      title: "Replace dock cooler compressor",
      description: "Unit 3 is cycling off. Swap compressor and log refrigerant recovery.",
      status: "in_progress",
      priority: "high",
      customerId: northId,
      assignedToUserId: techId,
      scheduledAt: laterToday,
      location: "Dock 3 mechanical room",
      createdByUserId: dispatcherId,
    },
    {
      id: "job_clinic_hvac",
      jobNumber: 1002,
      title: "HVAC filter and intake inspection",
      description: "Quarterly PM for clinic wing B. Photograph filter condition.",
      status: "assigned",
      priority: "medium",
      customerId: harborId,
      assignedToUserId: techId,
      scheduledAt: tomorrow,
      location: "Wing B roof penthouse",
      createdByUserId: dispatcherId,
    },
    {
      id: "job_showroom_lights",
      jobNumber: 1003,
      title: "Showroom lighting retrofit",
      description: "Install 14 LED pendants. Confirm dimmer compatibility first.",
      status: "queued",
      priority: "urgent",
      customerId: loftId,
      assignedToUserId: null,
      scheduledAt: tomorrow,
      location: "Street-level showroom",
      createdByUserId: dispatcherId,
    },
    {
      id: "job_gate_reader",
      jobNumber: 1004,
      title: "Repair yard gate badge reader",
      description: "Intermittent denies. Check power supply and re-seat controller.",
      status: "blocked",
      priority: "high",
      customerId: northId,
      assignedToUserId: techId,
      scheduledAt: now,
      location: "North gate house",
      createdByUserId: adminId,
    },
    {
      id: "job_completed_pump",
      jobNumber: 1005,
      title: "Sump pump replacement",
      description: "Completed overnight. Customer signed off digitally.",
      status: "completed",
      priority: "medium",
      customerId: harborId,
      assignedToUserId: techId,
      scheduledAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: "Basement mechanical",
      createdByUserId: dispatcherId,
    },
  ]);

  const seeded = await db.select({ id: users.id }).from(users).where(eq(users.id, adminId));
  if (seeded.length === 0) {
    throw new Error("Demo seed failed");
  }
}

async function seedCrewDemo(db: AppDb) {
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.id, "user_admin")).limit(1);
  if (!admin) return;

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const now = new Date();
  const extraTechs = [
    {
      id: "user_dana",
      email: "dana@jobcommand.local",
      name: "Dana Cole",
      phone: "555-0104",
    },
    {
      id: "user_liv",
      email: "liv@jobcommand.local",
      name: "Liv Park",
      phone: "555-0105",
    },
  ];
  for (const tech of extraTechs) {
    const [found] = await db.select({ id: users.id }).from(users).where(eq(users.id, tech.id)).limit(1);
    if (found) continue;
    await db.insert(users).values({
      ...tech,
      passwordHash,
      role: "technician",
      createdAt: now,
      updatedAt: now,
    });
  }

  const roster: Array<[string, string[]]> = [
    ["job_dock_cooler", ["user_tech", "user_dana"]],
    ["job_clinic_hvac", ["user_tech", "user_liv"]],
    ["job_gate_reader", ["user_tech"]],
    ["job_completed_pump", ["user_tech"]],
  ];
  for (const [jobId, userIds] of roster) {
    const [job] = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) continue;
    for (const userId of userIds) {
      const [existing] = await db
        .select({ id: jobAssignments.id })
        .from(jobAssignments)
        .where(and(eq(jobAssignments.jobId, jobId), eq(jobAssignments.userId, userId)))
        .limit(1);
      if (existing) continue;
      await db.insert(jobAssignments).values({
        id: `assign_${jobId}_${userId}`,
        jobId,
        userId,
      });
    }
  }

  const clocks: Array<{ id: string; userId: string; jobId: string; hoursAgo: number }> = [
    { id: "clock_tech", userId: "user_tech", jobId: "job_dock_cooler", hoursAgo: 6.15 },
    { id: "clock_dana", userId: "user_dana", jobId: "job_dock_cooler", hoursAgo: 7.25 },
  ];
  for (const clock of clocks) {
    const [open] = await db
      .select({ id: timeEntries.id })
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, clock.userId), isNull(timeEntries.endedAt)))
      .limit(1);
    if (open) continue;
    await db.insert(timeEntries).values({
      id: clock.id,
      userId: clock.userId,
      jobId: clock.jobId,
      startedAt: new Date(Date.now() - clock.hoursAgo * 60 * 60 * 1000),
    });
  }

  await db
    .update(timeEntries)
    .set({ endedAt: new Date() })
    .where(and(eq(timeEntries.userId, "user_liv"), isNull(timeEntries.endedAt)));

  const portraits = await db.select({ id: users.id, name: users.name }).from(users);
  for (const person of portraits) {
    await db
      .update(users)
      .set({ avatarUrl: portraitUrl(person.id, person.name) })
      .where(eq(users.id, person.id));
  }
}
