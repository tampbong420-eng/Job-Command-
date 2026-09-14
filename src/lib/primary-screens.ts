export const PRIMARY_SCREEN_IDS = [
  "crew",
  "schedule",
  "customers",
  "money",
  "shop",
  "hours",
] as const;

export type PrimaryScreenId = (typeof PRIMARY_SCREEN_IDS)[number];

export const PAD_TONES = ["lime", "gold", "orange", "pending", "yellow", "ember"] as const;
export type PadTone = (typeof PAD_TONES)[number];

export type PrimaryScreen = {
  id: PrimaryScreenId;
  href: string;
  label: string;
  short: string;
  hint: string;
  ready: boolean;
  tone: PadTone;
  opens: string[];
  notHere: string[];
};

export const PAD_TONE_CLASS = {
  lime: {
    ready: "bg-boss text-ink ring-lime/50",
    wait: "bg-card text-muted-foreground ring-boss/20",
    mark: "text-boss",
    bar: "bg-boss",
  },
  gold: {
    ready: "bg-logo text-ink ring-logo/70",
    wait: "bg-card text-muted-foreground ring-logo/25",
    mark: "text-logo",
    bar: "bg-logo",
  },
  orange: {
    ready: "bg-employee text-ink ring-employee/70",
    wait: "bg-card text-muted-foreground ring-employee/25",
    mark: "text-employee",
    bar: "bg-employee",
  },
  pending: {
    ready: "bg-pending text-ink ring-pending/70",
    wait: "bg-card text-muted-foreground ring-pending/25",
    mark: "text-pending",
    bar: "bg-pending",
  },
  yellow: {
    ready: "bg-yellow text-ink ring-yellow/70",
    wait: "bg-card text-muted-foreground ring-yellow/25",
    mark: "text-yellow",
    bar: "bg-yellow",
  },
  ember: {
    ready: "bg-employee-deep text-white ring-employee/50",
    wait: "bg-card text-muted-foreground ring-employee-deep/30",
    mark: "text-employee",
    bar: "bg-employee-deep",
  },
} as const;

export const PRIMARY_SCREENS: PrimaryScreen[] = [
  {
    id: "crew",
    href: "/command/crew",
    label: "Active Jobs",
    short: "Jobs",
    hint: "On-site work, maps, and live crew",
    ready: true,
    tone: "lime",
    opens: [
      "Jobs that are assigned or in progress",
      "Owner name, street, maps, and Street View",
      "Talk or type the job scope",
      "Who is on the job, IN or OUT, call and text",
    ],
    notHere: [
      "Tomorrow's book lives in Schedule",
      "Punching in stays on the job card, not Hours",
    ],
  },
  {
    id: "schedule",
    href: "/command/schedule",
    label: "Schedule",
    short: "Book",
    hint: "Today, tomorrow, and who you send",
    ready: false,
    tone: "gold",
    opens: [
      "The book: today, this week, and what is still queued",
      "New job from a call or a signed estimate",
      "Who goes where (dispatch)",
      "Recurring maintenance when we add it",
    ],
    notHere: [
      "Live on-site work stays in Active Jobs",
      "Customer phone and history stay in Customers",
    ],
  },
  {
    id: "customers",
    href: "/command/customers",
    label: "Customers",
    short: "People",
    hint: "People, properties, and past jobs",
    ready: false,
    tone: "orange",
    opens: [
      "Add a customer",
      "Phone, address, gate codes, and notes",
      "Every job at that property",
      "Equipment at the site, later",
    ],
    notHere: [
      "Sending a bill lives in Money",
      "Putting them on tomorrow's book lives in Schedule",
    ],
  },
  {
    id: "money",
    href: "/command/money",
    label: "Money",
    short: "Pay",
    hint: "Estimates, invoices, and what they owe",
    ready: false,
    tone: "pending",
    opens: [
      "Write an estimate",
      "Turn approved work into an invoice",
      "Record a payment or a deposit",
      "Who still owes us, and what a job made",
    ],
    notHere: [
      "The price book of parts and labor lives in Shop",
      "Hours and overtime live in Hours",
    ],
  },
  {
    id: "shop",
    href: "/command/shop",
    label: "Shop",
    short: "Parts",
    hint: "Parts, price book, and trucks",
    ready: false,
    tone: "yellow",
    opens: [
      "Price book: what you charge for labor and parts",
      "What is on the trucks and in the shop",
      "Purchase orders",
      "Equipment serials, later",
    ],
    notHere: [
      "The customer-facing shop site is a different app",
      "Invoices live in Money",
    ],
  },
  {
    id: "hours",
    href: "/command/hours",
    label: "Hours",
    short: "Time",
    hint: "Time cards, overtime, and who is off",
    ready: false,
    tone: "ember",
    opens: [
      "Who is IN or OUT today",
      "Time cards and overtime",
      "Days off",
    ],
    notHere: [
      "Clock IN / OUT on a job stays in Active Jobs",
      "Hire or edit people: photo menu → Team",
      "Company logo: photo menu → Settings",
    ],
  },
];

export function screenForPath(pathname: string) {
  return PRIMARY_SCREENS.find((item) => item.href === pathname) ?? null;
}

export function screenNumber(screen: PrimaryScreen) {
  return String(PRIMARY_SCREENS.findIndex((item) => item.id === screen.id) + 1).padStart(2, "0");
}
