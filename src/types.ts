export type PlanId = 'starter' | 'crew' | 'command';

export type CompanyProfile = {
  companyName: string;
  businessPhone: string;
  trade: string;
  serviceArea: string;
  receptionistOn: boolean;
  lineArmed: boolean;
  plan: PlanId;
  greeting: string;
  afterHours: string;
};

export type EmployeeStatus = 'available' | 'enroute' | 'onjob' | 'offline';

export type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  heading: number;
  status: EmployeeStatus;
  inviteToken: string;
  lastPing: string;
  liveGps?: boolean;
};

export type JobStatus = 'lead' | 'estimate' | 'scheduled' | 'in_progress' | 'complete';

export type LineKind = 'labor' | 'material';

export type LineItem = {
  id: string;
  kind: LineKind;
  description: string;
  qty: number;
  unit: string;
  rate: number;
};

export type Job = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  lat: number;
  lng: number;
  status: JobStatus;
  assignedEmployeeId: string | null;
  notes: string;
  items: LineItem[];
  markupPct: number;
  taxPct: number;
  createdAt: string;
};

export type Expense = {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  date: string;
  receiptDataUrl: string | null;
  employeeId: string | null;
  notes: string;
  ocrText: string;
};

export type CallLogEntry = {
  id: string;
  at: string;
  direction: 'inbound' | 'test';
  summary: string;
  durationSec: number;
};

export type VapiSettings = {
  publicKey: string;
  assistantId: string;
};

export type AppState = {
  company: CompanyProfile;
  employees: Employee[];
  jobs: Job[];
  expenses: Expense[];
  calls: CallLogEntry[];
  vapiSettings: VapiSettings;
};

export type EstimateTotals = {
  labor: number;
  materials: number;
  subtotal: number;
  markup: number;
  tax: number;
  total: number;
};
