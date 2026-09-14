import { and, eq, isNull } from "drizzle-orm";
import type { AppDb } from "@/db/types";
import {
  chatMessages,
  customers,
  expenseReceipts,
  jobAssignments,
  jobs,
  timeEntries,
  users,
  voiceCalls,
} from "@/db/schema";
import { portraitUrl } from "@/lib/avatars";
import { DEMO_PASSWORD } from "@/lib/domain";
import { hashPassword } from "@/lib/password";

export async function seedDemoData(db: AppDb) {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    await seedCoreDemo(db);
  }
  await seedCrewDemo(db);
  await seedDeskModules(db);
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
      name: "Kim Rhodes",
      email: "kim@rhodes.example",
      phone: "501-555-2001",
      address: "410 Spring St, Hot Springs, AR",
      notes: "Dogs in the backyard. Park on the street.",
      createdByUserId: dispatcherId,
    },
    {
      id: harborId,
      name: "Cedar Glade Church",
      email: "office@cedarglade.example",
      phone: "501-555-2002",
      address: "88 Central Ave, Hot Springs, AR",
      notes: "Side door by the fellowship hall.",
      createdByUserId: dispatcherId,
    },
    {
      id: loftId,
      name: "Jordan Ellis",
      email: "jordan@ellis.example",
      phone: "501-555-2003",
      address: "1821 Central Ave, Hot Springs, AR",
      notes: "Storefront. After-hours key in the job notes.",
      createdByUserId: adminId,
    },
  ]);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const laterToday = new Date(Date.now() + 3 * 60 * 60 * 1000);

  await db.insert(jobs).values([
    {
      id: "job_dock_cooler",
      jobNumber: 1001,
      title: "House exterior and soffits",
      description: "Duration on siding, trim, and soffits. Accessible Beige.",
      status: "in_progress",
      priority: "high",
      customerId: northId,
      assignedToUserId: techId,
      scheduledAt: laterToday,
      location: "410 Spring St, Hot Springs, AR",
      trade: "Exterior",
      contractCents: 1840000,
      createdByUserId: dispatcherId,
    },
    {
      id: "job_clinic_hvac",
      jobNumber: 1002,
      title: "Sanctuary walls and trim",
      description: "Eggshell in the sanctuary. Tape the pews.",
      status: "assigned",
      priority: "medium",
      customerId: harborId,
      assignedToUserId: techId,
      scheduledAt: tomorrow,
      location: "88 Central Ave, Hot Springs, AR",
      trade: "Interior",
      contractCents: 420000,
      createdByUserId: dispatcherId,
    },
    {
      id: "job_showroom_lights",
      jobNumber: 1003,
      title: "Storefront cabinets",
      description: "Refinish the front cabinets before Friday open.",
      status: "queued",
      priority: "urgent",
      customerId: loftId,
      assignedToUserId: null,
      scheduledAt: tomorrow,
      location: "1821 Central Ave, Hot Springs, AR",
      trade: "Cabinets",
      contractCents: 960000,
      createdByUserId: dispatcherId,
    },
    {
      id: "job_gate_reader",
      jobNumber: 1004,
      title: "Kitchen cabinets — waiting on stain",
      description: "Stain sample not approved. Do not spray until Kim signs off.",
      status: "blocked",
      priority: "high",
      customerId: northId,
      assignedToUserId: techId,
      scheduledAt: now,
      location: "410 Spring St, Hot Springs, AR",
      trade: "Cabinets",
      contractCents: 275000,
      createdByUserId: adminId,
    },
    {
      id: "job_completed_pump",
      jobNumber: 1005,
      title: "Nursery repaint",
      description: "Two coats. Customer signed off.",
      status: "completed",
      priority: "medium",
      customerId: harborId,
      assignedToUserId: techId,
      scheduledAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: "88 Central Ave, Hot Springs, AR",
      trade: "Interior",
      contractCents: 610000,
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

async function seedDeskModules(db: AppDb) {
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.id, "user_admin")).limit(1);
  if (!admin) return;

  const hamiltonId = "cust_hamilton";
  const oaklawnId = "cust_oaklawn";
  const [hamilton] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, hamiltonId)).limit(1);
  if (!hamilton) {
    await db.insert(customers).values([
      {
        id: hamiltonId,
        name: "Lake Hamilton Residence",
        email: "pat@hamilton.example",
        phone: "501-555-0144",
        address: "112 Lookout Point, Hot Springs, AR",
        notes: "Lakefront. Boat dock access from the lower path.",
        createdByUserId: "user_dispatcher",
      },
      {
        id: oaklawnId,
        name: "Oaklawn Clubhouse",
        email: "facilities@oaklawn.example",
        phone: "501-555-0188",
        address: "2705 Central Ave, Hot Springs, AR",
        notes: "After-hours badge at the west entrance.",
        createdByUserId: "user_admin",
      },
    ]);
  }

  const [estimateSent] = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.id, "job_hamilton_paint")).limit(1);
  if (!estimateSent) {
    const later = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    await db.insert(jobs).values([
      {
        id: "job_hamilton_paint",
        jobNumber: 1006,
        title: "Lakefront exterior and soffits",
        description: "Duration on siding, trim, and soffits. Color: Accessible Beige.",
        status: "estimate_sent",
        priority: "medium",
        customerId: hamiltonId,
        assignedToUserId: null,
        scheduledAt: later,
        location: "112 Lookout Point",
        trade: "Exterior paint",
        contractCents: 1285000,
        createdByUserId: "user_dispatcher",
      },
      {
        id: "job_oaklawn_club",
        jobNumber: 1007,
        title: "Clubhouse interior refresh",
        description: "Ceilings, corridors, and the winner's circle lounge.",
        status: "estimate_approved",
        priority: "high",
        customerId: oaklawnId,
        assignedToUserId: null,
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        location: "Oaklawn Clubhouse",
        trade: "Interior paint",
        contractCents: 2460000,
        createdByUserId: "user_dispatcher",
      },
    ]);
  }

  const [receipt] = await db
    .select({ id: expenseReceipts.id })
    .from(expenseReceipts)
    .where(eq(expenseReceipts.id, "exp_sherwin_dock"))
    .limit(1);
  if (!receipt) {
    await db.insert(expenseReceipts).values({
      id: "exp_sherwin_dock",
      jobId: "job_dock_cooler",
      vendor: "Sherwin-Williams",
      purchasedAt: new Date(),
      totalCents: 21487,
      taxCents: 1672,
      lineItems: [
        { name: "Duration Home Extra White 5 gal", amountCents: 16899 },
        { name: "ProClassic Interior Satin 1 gal", amountCents: 2916 },
      ],
      createdByUserId: "user_dana",
    });
  }

  const [call] = await db.select({ id: voiceCalls.id }).from(voiceCalls).where(eq(voiceCalls.id, "call_pat_hamilton")).limit(1);
  if (!call) {
    await db.insert(voiceCalls).values([
      {
        id: "call_pat_hamilton",
        fromPhone: "5015550144",
        callerName: "Pat Hamilton",
        transcript:
          "Hi, this is Pat Hamilton at 112 Lookout Point in Hot Springs. I need the exterior painted, soffits too, hopefully this week. Call me at 501-555-0144.",
        extracted: {
          name: "Pat Hamilton",
          phone: "5015550144",
          service: "Exterior paint",
          address: "112 Lookout Point",
          timeline: "This week",
          urgency: "soon",
        },
        status: "new",
      },
      {
        id: "call_central_storefront",
        fromPhone: "5015550190",
        callerName: "Jordan Ellis",
        transcript:
          "This is Jordan Ellis. Our storefront on 1821 Central Ave needs cabinets refinished ASAP, we're opening Friday.",
        extracted: {
          name: "Jordan Ellis",
          phone: "5015550190",
          service: "Cabinet refinish",
          address: "1821 Central Ave",
          timeline: "ASAP",
          urgency: "urgent",
        },
        status: "new",
      },
    ]);
  }

  const [posted] = await db
    .select({ id: chatMessages.id })
    .from(chatMessages)
    .where(eq(chatMessages.id, "chat_dispatch_1"))
    .limit(1);
  if (!posted) {
    const now = Date.now();
    await db.insert(chatMessages).values([
      {
        id: "chat_announce_1",
        channel: "company-announcements",
        authorUserId: "user_admin",
        body: "Top Gun Painting — keep GPS on while you're clocked IN. Dead zones still cache in Chat.",
        createdAt: new Date(now - 80 * 60 * 1000),
      },
      {
        id: "chat_crews_1",
        channel: "hot-springs-crews",
        authorUserId: "user_dispatcher",
        body: "Dana and Riley are on Kim's house. Liv is off-shift, Oaklawn tomorrow.",
        createdAt: new Date(now - 50 * 60 * 1000),
      },
      {
        id: "chat_dispatch_1",
        channel: "office-dispatch",
        authorUserId: "user_dana",
        body: "Stopping at Sherwin on Central for Duration. Receipt goes on Kim's house.",
        createdAt: new Date(now - 18 * 60 * 1000),
      },
      {
        id: "chat_job_dock_1",
        channel: "job:job_dock_cooler",
        authorUserId: "user_tech",
        body: "South wall is rolling. Need Dana on the trim before we cut in.",
        createdAt: new Date(now - 12 * 60 * 1000),
      },
    ]);
  }

  await retargetDemoShop(db);
}

async function retargetDemoShop(db: AppDb) {
  await db
    .update(customers)
    .set({
      name: "Kim Rhodes",
      email: "kim@rhodes.example",
      phone: "501-555-2001",
      address: "410 Spring St, Hot Springs, AR",
      notes: "Dogs in the backyard. Park on the street.",
    })
    .where(eq(customers.id, "cust_northwind"));
  await db
    .update(customers)
    .set({
      name: "Cedar Glade Church",
      email: "office@cedarglade.example",
      phone: "501-555-2002",
      address: "88 Central Ave, Hot Springs, AR",
      notes: "Side door by the fellowship hall.",
    })
    .where(eq(customers.id, "cust_harbor"));
  await db
    .update(customers)
    .set({
      name: "Jordan Ellis",
      email: "jordan@ellis.example",
      phone: "501-555-2003",
      address: "1821 Central Ave, Hot Springs, AR",
      notes: "Storefront. After-hours key in the job notes.",
    })
    .where(eq(customers.id, "cust_loft"));

  await db
    .update(jobs)
    .set({
      title: "House exterior and soffits",
      description: "Duration on siding, trim, and soffits. Accessible Beige.",
      location: "410 Spring St, Hot Springs, AR",
      trade: "Exterior",
    })
    .where(eq(jobs.id, "job_dock_cooler"));
  await db
    .update(jobs)
    .set({
      title: "Sanctuary walls and trim",
      description: "Eggshell in the sanctuary. Tape the pews.",
      location: "88 Central Ave, Hot Springs, AR",
      trade: "Interior",
    })
    .where(eq(jobs.id, "job_clinic_hvac"));
  await db
    .update(jobs)
    .set({
      title: "Storefront cabinets",
      description: "Refinish the front cabinets before Friday open.",
      location: "1821 Central Ave, Hot Springs, AR",
      trade: "Cabinets",
    })
    .where(eq(jobs.id, "job_showroom_lights"));
  await db
    .update(jobs)
    .set({
      title: "Kitchen cabinets — waiting on stain",
      description: "Stain sample not approved. Do not spray until Kim signs off.",
      location: "410 Spring St, Hot Springs, AR",
      trade: "Cabinets",
    })
    .where(eq(jobs.id, "job_gate_reader"));
  await db
    .update(jobs)
    .set({
      title: "Nursery repaint",
      description: "Two coats. Customer signed off.",
      location: "88 Central Ave, Hot Springs, AR",
      trade: "Interior",
    })
    .where(eq(jobs.id, "job_completed_pump"));

  await db
    .update(chatMessages)
    .set({ body: "Dana and Riley are on Kim's house. Liv is off-shift, Oaklawn tomorrow." })
    .where(eq(chatMessages.id, "chat_crews_1"));
  await db
    .update(chatMessages)
    .set({ body: "Stopping at Sherwin on Central for Duration. Receipt goes on Kim's house." })
    .where(eq(chatMessages.id, "chat_dispatch_1"));
  await db
    .update(chatMessages)
    .set({ body: "South wall is rolling. Need Dana on the trim before we cut in." })
    .where(eq(chatMessages.id, "chat_job_dock_1"));
}
