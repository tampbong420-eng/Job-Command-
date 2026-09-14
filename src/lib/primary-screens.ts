import type { UserRole } from "@/lib/domain";

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

export type DeskItem = {
  label: string;
  bossOnly?: boolean;
};

export type DeskGroup = {
  title: string;
  items: DeskItem[];
};

export type PrimaryScreen = {
  id: PrimaryScreenId;
  href: string;
  label: string;
  short: string;
  hint: string;
  ready: boolean;
  tone: PadTone;
  groups: DeskGroup[];
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
    hint: "Who is working what, right now",
    ready: true,
    tone: "lime",
    groups: [
      {
        title: "The job",
        items: [
          { label: "Maps, Street View, Go" },
          { label: "Talk or type the scope" },
          { label: "Photos in the job chat" },
        ],
      },
      {
        title: "Who is on it",
        items: [
          { label: "Crew on this job" },
          { label: "Clock IN / OUT on the job" },
          { label: "Call, text, broadcast" },
        ],
      },
    ],
    notHere: [
      "Tomorrow's book is Schedule",
      "Time cards and payroll are Hours",
    ],
  },
  {
    id: "schedule",
    href: "/command/schedule",
    label: "Schedule",
    short: "Book",
    hint: "The phone, the book, who you send",
    ready: false,
    tone: "gold",
    groups: [
      {
        title: "Phone",
        items: [
          { label: "AI answering", bossOnly: true },
          { label: "Calls waiting to book" },
        ],
      },
      {
        title: "The book",
        items: [
          { label: "Today, tomorrow, the week" },
          { label: "New job", bossOnly: true },
          { label: "Recurring visits from plans", bossOnly: true },
        ],
      },
      {
        title: "Assign",
        items: [
          { label: "Pick who goes", bossOnly: true },
          { label: "Who is already booked", bossOnly: true },
          { label: "My day" },
        ],
      },
    ],
    notHere: [
      "Live on-site work is Active Jobs",
      "AI greeting and hours: photo → Settings",
    ],
  },
  {
    id: "customers",
    href: "/command/customers",
    label: "Customers",
    short: "People",
    hint: "People, houses, and history",
    ready: false,
    tone: "orange",
    groups: [
      {
        title: "The house",
        items: [
          { label: "Add or find a person", bossOnly: true },
          { label: "Phone, address, gate, notes" },
          { label: "Equipment at the property" },
          { label: "Past jobs" },
          { label: "Which plan they are on", bossOnly: true },
        ],
      },
    ],
    notHere: [
      "Crew opens the house from the job card",
      "Bills and memberships are Money",
      "Putting them on the book is Schedule",
    ],
  },
  {
    id: "money",
    href: "/command/money",
    label: "Money",
    short: "Pay",
    hint: "Estimates, invoices, and plans",
    ready: false,
    tone: "pending",
    groups: [
      {
        title: "Sell",
        items: [
          { label: "Estimates", bossOnly: true },
          { label: "Memberships and subscriptions", bossOnly: true },
        ],
      },
      {
        title: "Get paid",
        items: [
          { label: "Invoices", bossOnly: true },
          { label: "Take a payment", bossOnly: true },
          { label: "Who owes us", bossOnly: true },
        ],
      },
      {
        title: "The score",
        items: [
          { label: "What a job made", bossOnly: true },
        ],
      },
    ],
    notHere: [
      "Price book is Shop",
      "Payroll is Hours",
      "Crew does not get this box",
    ],
  },
  {
    id: "shop",
    href: "/command/shop",
    label: "Shop",
    short: "Parts",
    hint: "Parts, trucks, and the price book",
    ready: false,
    tone: "yellow",
    groups: [
      {
        title: "Charge",
        items: [{ label: "Price book: labor and parts" }],
      },
      {
        title: "Stock",
        items: [
          { label: "What is on the trucks" },
          { label: "Warehouse" },
          { label: "Order parts", bossOnly: true },
        ],
      },
    ],
    notHere: [
      "Invoices are Money",
      "The public shop site is a different app",
    ],
  },
  {
    id: "hours",
    href: "/command/hours",
    label: "Hours",
    short: "Time",
    hint: "Time cards and payroll",
    ready: false,
    tone: "ember",
    groups: [
      {
        title: "Time",
        items: [
          { label: "Time cards" },
          { label: "Who is IN or OUT today" },
          { label: "Overtime" },
          { label: "Days off" },
        ],
      },
      {
        title: "Pay",
        items: [{ label: "Run payroll", bossOnly: true }],
      },
    ],
    notHere: [
      "Clock IN / OUT on a job is Active Jobs",
      "Hire people: photo → Team",
      "Pay rates: photo → Team",
    ],
  },
];

export const CREW_HOME_IDS: PrimaryScreenId[] = ["crew", "schedule", "shop", "hours"];

export const OFFICE_ITEMS: DeskItem[] = [
  { label: "Company logo", bossOnly: true },
  { label: "AI answering: hours and greeting", bossOnly: true },
  { label: "Tax and invoice footer", bossOnly: true },
  { label: "Your login" },
];

export function screensForRole(role: UserRole) {
  if (role === "technician") {
    return PRIMARY_SCREENS.filter((item) => CREW_HOME_IDS.includes(item.id));
  }
  return PRIMARY_SCREENS;
}

export function canOpenScreen(role: UserRole, id: PrimaryScreenId) {
  return screensForRole(role).some((item) => item.id === id);
}

export function screenForPath(pathname: string) {
  return PRIMARY_SCREENS.find((item) => item.href === pathname) ?? null;
}

export function screenNumber(screen: PrimaryScreen) {
  return String(PRIMARY_SCREENS.findIndex((item) => item.id === screen.id) + 1).padStart(2, "0");
}

export function groupsForRole(screen: PrimaryScreen, role: UserRole): DeskGroup[] {
  if (role !== "technician") return screen.groups;
  return screen.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.bossOnly),
    }))
    .filter((group) => group.items.length > 0);
}
