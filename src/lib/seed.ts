import { eq } from "drizzle-orm";
import type { AppDb } from "@/db/types";
import { customers, jobs, users } from "@/db/schema";
import { DEMO_PASSWORD } from "@/lib/domain";
import { hashPassword } from "@/lib/password";

export async function seedDemoData(db: AppDb) {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) return;

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const now = new Date();

  const adminId = "user_admin";
  const dispatcherId = "user_dispatcher";
  const techId = "user_tech";
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
