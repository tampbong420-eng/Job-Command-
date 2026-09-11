import { inviteToken, uid } from '@/lib/ids';
import type { AppState, Employee, Job } from '@/types';

const now = () => new Date().toISOString();

function employee(
  name: string,
  role: string,
  lat: number,
  lng: number,
  status: Employee['status'],
  speed: number,
  battery: number,
): Employee {
  return {
    id: uid('emp'),
    name,
    role,
    phone: '813-555-' + String(1000 + Math.floor(Math.random() * 8000)),
    lat,
    lng,
    speed,
    battery,
    heading: Math.floor(Math.random() * 360),
    status,
    inviteToken: inviteToken(),
    lastPing: now(),
  };
}

function job(
  customerName: string,
  customerPhone: string,
  address: string,
  lat: number,
  lng: number,
  status: Job['status'],
  assignedEmployeeId: string | null,
  notes: string,
  items: Job['items'],
): Job {
  return {
    id: uid('job'),
    customerName,
    customerPhone,
    address,
    lat,
    lng,
    status,
    assignedEmployeeId,
    notes,
    items,
    markupPct: 18,
    taxPct: 7.5,
    createdAt: now(),
  };
}

export function demoState(): AppState {
  const marcus = employee('Marcus Hale', 'Lead Tech', 27.9506, -82.4572, 'enroute', 28, 86);
  const rina = employee('Rina Patel', 'Installer', 27.9758, -82.5369, 'onjob', 0, 64);
  const devon = employee('Devon Ruiz', 'Apprentice', 28.012, -82.492, 'available', 12, 91);
  const kayla = employee('Kayla Nguyen', 'Service', 27.921, -82.439, 'available', 19, 73);

  return {
    company: {
      companyName: 'Apex Gulf Mechanical',
      businessPhone: '(813) 555-0140',
      trade: 'HVAC · Plumbing · Electrical',
      serviceArea: 'Tampa Bay, FL',
      receptionistOn: true,
      lineArmed: false,
      plan: 'crew',
      greeting:
        'Thanks for calling Apex Gulf Mechanical. I can book a service window, take a dispatch note, or connect you with a live tech.',
      afterHours:
        'We are closed for the night. I can still log an emergency leak or no-cool call and wake the on-call tech.',
    },
    employees: [marcus, rina, devon, kayla],
    jobs: [
      job(
        'Elena Voss',
        '813-555-2210',
        '1208 N Franklin St, Tampa, FL',
        27.9554,
        -82.4594,
        'in_progress',
        rina.id,
        'No-cool call. Condenser running, weak airflow upstairs.',
        [
          {
            id: uid('li'),
            kind: 'labor',
            description: 'Diagnostic + capacitor swap',
            qty: 1.5,
            unit: 'hr',
            rate: 145,
          },
          {
            id: uid('li'),
            kind: 'material',
            description: '45/5 dual run capacitor',
            qty: 1,
            unit: 'ea',
            rate: 38,
          },
        ],
      ),
      job(
        'Harbor Lofts HOA',
        '813-555-7781',
        '401 Channelside Dr, Tampa, FL',
        27.942,
        -82.446,
        'estimate',
        marcus.id,
        'Replace two 4-ton split systems on the west stack.',
        [
          {
            id: uid('li'),
            kind: 'labor',
            description: 'Changeout crew (2 techs)',
            qty: 16,
            unit: 'hr',
            rate: 128,
          },
          {
            id: uid('li'),
            kind: 'material',
            description: '4-ton 16 SEER2 condenser + coil',
            qty: 2,
            unit: 'ea',
            rate: 2850,
          },
        ],
      ),
      job(
        'Chris Bell',
        '727-555-0199',
        '88 Park St N, St. Petersburg, FL',
        27.771,
        -82.64,
        'lead',
        null,
        'Water heater leaking at the pan. Wants same-day if possible.',
        [
          {
            id: uid('li'),
            kind: 'labor',
            description: 'Water heater replacement',
            qty: 3,
            unit: 'hr',
            rate: 145,
          },
          {
            id: uid('li'),
            kind: 'material',
            description: '50 gal gas WH',
            qty: 1,
            unit: 'ea',
            rate: 980,
          },
        ],
      ),
      job(
        'North Bay Dental',
        '813-555-4402',
        '2502 W Kennedy Blvd, Tampa, FL',
        27.9447,
        -82.4849,
        'scheduled',
        devon.id,
        'Quarterly PM + filter change before Friday opening.',
        [
          {
            id: uid('li'),
            kind: 'labor',
            description: 'Preventive maintenance',
            qty: 2,
            unit: 'hr',
            rate: 125,
          },
          {
            id: uid('li'),
            kind: 'material',
            description: 'MERV-13 filters',
            qty: 6,
            unit: 'ea',
            rate: 22,
          },
        ],
      ),
      job(
        'Maya Ortiz',
        '813-555-9094',
        '610 S Howard Ave, Tampa, FL',
        27.937,
        -82.4827,
        'complete',
        kayla.id,
        'Garbage disposal jam. Completed this morning.',
        [
          {
            id: uid('li'),
            kind: 'labor',
            description: 'Service call',
            qty: 1,
            unit: 'hr',
            rate: 129,
          },
          {
            id: uid('li'),
            kind: 'material',
            description: 'Reset + hex key',
            qty: 1,
            unit: 'ea',
            rate: 0,
          },
        ],
      ),
    ],
    expenses: [
      {
        id: uid('exp'),
        vendor: 'Ferguson HVAC',
        amount: 186.4,
        category: 'Materials',
        date: new Date().toISOString().slice(0, 10),
        receiptDataUrl: null,
        employeeId: rina.id,
        notes: 'Capacitor + contactor',
        ocrText: '',
      },
      {
        id: uid('exp'),
        vendor: 'RaceTrac #412',
        amount: 64.18,
        category: 'Fuel',
        date: new Date().toISOString().slice(0, 10),
        receiptDataUrl: null,
        employeeId: marcus.id,
        notes: 'Van 2 fill-up',
        ocrText: '',
      },
    ],
    calls: [
      {
        id: uid('call'),
        at: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
        direction: 'inbound',
        summary: 'Elena Voss — no cool upstairs, booked as emergency window.',
        durationSec: 94,
      },
    ],
    vapiSettings: {
      publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY ?? '',
      assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID ?? '',
    },
  };
}
