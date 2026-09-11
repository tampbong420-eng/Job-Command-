import { demoState } from '@/lib/demoData';
import { inviteToken, uid } from '@/lib/ids';
import { supabase } from '@/lib/supabase';
import type {
  AppState,
  CallLogEntry,
  CompanyProfile,
  Employee,
  Expense,
  Job,
  VapiSettings,
} from '@/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'job-command:v4';

function loadLocal(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed?.company || !Array.isArray(parsed.employees)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveLocal(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota errors on large receipt images should not crash dispatch.
  }
}

type StoreApi = {
  state: AppState;
  replace: (next: AppState) => void;
  patchCompany: (partial: Partial<CompanyProfile>) => void;
  saveCompany: () => Promise<void>;
  upsertEmployee: (employee: Employee) => void;
  patchEmployee: (id: string, partial: Partial<Employee>) => void;
  addEmployee: (name: string, role: string) => Employee;
  upsertJob: (job: Job) => void;
  patchJob: (id: string, partial: Partial<Job>) => void;
  addJob: () => Job;
  upsertExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  addCall: (entry: Omit<CallLogEntry, 'id' | 'at'> & { at?: string }) => void;
  patchVapi: (partial: Partial<VapiSettings>) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const initial = loadLocal() ?? demoState();
    saveLocal(initial);
    return initial;
  });
  const stateRef = useRef(state);
  const remoteTimer = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const replace = useCallback((next: AppState) => {
    setState(next);
    saveLocal(next);
  }, []);

  const commit = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        saveLocal(next);
        return next;
      });
    },
    [],
  );

  const scheduleRemote = useCallback(() => {
    if (!supabase) return;
    if (remoteTimer.current) window.clearTimeout(remoteTimer.current);
    remoteTimer.current = window.setTimeout(() => {
      void pushRemote(stateRef.current);
    }, 800);
  }, []);

  const patchCompany = useCallback(
    (partial: Partial<CompanyProfile>) => {
      commit((prev) => ({ ...prev, company: { ...prev.company, ...partial } }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const saveCompany = useCallback(async () => {
    saveLocal(stateRef.current);
    await pushRemote(stateRef.current);
  }, []);

  const upsertEmployee = useCallback(
    (employee: Employee) => {
      commit((prev) => ({
        ...prev,
        employees: prev.employees.some((item) => item.id === employee.id)
          ? prev.employees.map((item) => (item.id === employee.id ? employee : item))
          : [...prev.employees, employee],
      }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const patchEmployee = useCallback(
    (id: string, partial: Partial<Employee>) => {
      commit((prev) => ({
        ...prev,
        employees: prev.employees.map((item) => (item.id === id ? { ...item, ...partial } : item)),
      }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const addEmployee = useCallback(
    (name: string, role: string) => {
      const created: Employee = {
        id: uid('emp'),
        name,
        role,
        phone: '',
        lat: 27.9506 + (Math.random() - 0.5) * 0.04,
        lng: -82.4572 + (Math.random() - 0.5) * 0.04,
        speed: 0,
        battery: 100,
        heading: 0,
        status: 'offline',
        inviteToken: inviteToken(),
        lastPing: new Date().toISOString(),
      };
      upsertEmployee(created);
      return created;
    },
    [upsertEmployee],
  );

  const upsertJob = useCallback(
    (job: Job) => {
      commit((prev) => ({
        ...prev,
        jobs: prev.jobs.some((item) => item.id === job.id)
          ? prev.jobs.map((item) => (item.id === job.id ? job : item))
          : [job, ...prev.jobs],
      }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const patchJob = useCallback(
    (id: string, partial: Partial<Job>) => {
      commit((prev) => ({
        ...prev,
        jobs: prev.jobs.map((item) => (item.id === id ? { ...item, ...partial } : item)),
      }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const addJob = useCallback(() => {
    const created: Job = {
      id: uid('job'),
      customerName: 'New customer',
      customerPhone: '',
      address: '',
      lat: 27.9506,
      lng: -82.4572,
      status: 'lead',
      assignedEmployeeId: null,
      notes: '',
      items: [
        {
          id: uid('li'),
          kind: 'labor',
          description: 'Service call',
          qty: 1,
          unit: 'hr',
          rate: 129,
        },
      ],
      markupPct: 18,
      taxPct: 7.5,
      createdAt: new Date().toISOString(),
    };
    upsertJob(created);
    return created;
  }, [upsertJob]);

  const upsertExpense = useCallback(
    (expense: Expense) => {
      commit((prev) => ({
        ...prev,
        expenses: prev.expenses.some((item) => item.id === expense.id)
          ? prev.expenses.map((item) => (item.id === expense.id ? expense : item))
          : [expense, ...prev.expenses],
      }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const removeExpense = useCallback(
    (id: string) => {
      commit((prev) => ({ ...prev, expenses: prev.expenses.filter((item) => item.id !== id) }));
      scheduleRemote();
    },
    [commit, scheduleRemote],
  );

  const addCall = useCallback(
    (entry: Omit<CallLogEntry, 'id' | 'at'> & { at?: string }) => {
      commit((prev) => ({
        ...prev,
        calls: [
          {
            id: uid('call'),
            at: entry.at ?? new Date().toISOString(),
            direction: entry.direction,
            summary: entry.summary,
            durationSec: entry.durationSec,
          },
          ...prev.calls,
        ].slice(0, 40),
      }));
    },
    [commit],
  );

  const patchVapi = useCallback(
    (partial: Partial<VapiSettings>) => {
      commit((prev) => ({ ...prev, vapiSettings: { ...prev.vapiSettings, ...partial } }));
    },
    [commit],
  );

  const resetDemo = useCallback(() => {
    const next = demoState();
    replace(next);
    scheduleRemote();
  }, [replace, scheduleRemote]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue) as AppState;
        setState(next);
      } catch {
        // ignore malformed cross-tab payloads
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((prev) => {
        const next: AppState = {
          ...prev,
          employees: prev.employees.map((emp) => {
            if (emp.liveGps) return emp;
            if (emp.status === 'offline' || emp.status === 'onjob') {
              return { ...emp, speed: emp.status === 'onjob' ? 0 : emp.speed };
            }
            const heading = (emp.heading + (Math.random() - 0.45) * 28) % 360;
            const drift = 0.00035 + Math.random() * 0.00045;
            const rad = (heading * Math.PI) / 180;
            return {
              ...emp,
              heading,
              lat: emp.lat + Math.cos(rad) * drift,
              lng: emp.lng + Math.sin(rad) * drift,
              speed: Math.round(12 + Math.random() * 32),
              battery: Math.max(8, emp.battery - (Math.random() < 0.12 ? 1 : 0)),
              lastPing: new Date().toISOString(),
            };
          }),
        };
        saveLocal(next);
        return next;
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let cancelled = false;

    void (async () => {
      const remote = await pullRemote();
      if (!cancelled && remote) {
        const merged = mergeRemote(stateRef.current, remote);
        setState(merged);
        saveLocal(merged);
      }
    })();

    const channel = client
      .channel('job-command-fleet')
      .on('broadcast', { event: 'telemetry' }, (payload) => {
        const emp = payload.payload as Employee | undefined;
        if (!emp?.id) return;
        setState((prev) => ({
          ...prev,
          employees: prev.employees.map((item) => (item.id === emp.id ? { ...item, ...emp } : item)),
        }));
      })
      .subscribe();

    return () => {
      cancelled = true;
      void client.removeChannel(channel);
    };
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      state,
      replace,
      patchCompany,
      saveCompany,
      upsertEmployee,
      patchEmployee,
      addEmployee,
      upsertJob,
      patchJob,
      addJob,
      upsertExpense,
      removeExpense,
      addCall,
      patchVapi,
      resetDemo,
    }),
    [
      state,
      replace,
      patchCompany,
      saveCompany,
      upsertEmployee,
      patchEmployee,
      addEmployee,
      upsertJob,
      patchJob,
      addJob,
      upsertExpense,
      removeExpense,
      addCall,
      patchVapi,
      resetDemo,
    ],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

async function pushRemote(state: AppState) {
  if (!supabase) return;
  await Promise.all([
    supabase.from('companies').upsert({
      id: 'default',
      payload: state.company,
    }),
    supabase.from('employees').upsert(
      state.employees.map((employee) => ({ id: employee.id, payload: employee })),
    ),
    supabase.from('jobs').upsert(state.jobs.map((job) => ({ id: job.id, payload: job }))),
    supabase.from('expenses').upsert(
      state.expenses.map((expense) => ({ id: expense.id, payload: expense })),
    ),
  ]);
}

async function pullRemote(): Promise<Partial<AppState> | null> {
  if (!supabase) return null;
  const [company, employees, jobs, expenses] = await Promise.all([
    supabase.from('companies').select('payload').eq('id', 'default').maybeSingle(),
    supabase.from('employees').select('payload'),
    supabase.from('jobs').select('payload'),
    supabase.from('expenses').select('payload'),
  ]);
  if (company.error && employees.error) return null;
  return {
    company: company.data?.payload as CompanyProfile | undefined,
    employees: (employees.data ?? []).map((row) => row.payload as Employee),
    jobs: (jobs.data ?? []).map((row) => row.payload as Job),
    expenses: (expenses.data ?? []).map((row) => row.payload as Expense),
  };
}

function mergeRemote(local: AppState, remote: Partial<AppState>): AppState {
  return {
    ...local,
    company: remote.company ?? local.company,
    employees: remote.employees?.length ? remote.employees : local.employees,
    jobs: remote.jobs?.length ? remote.jobs : local.jobs,
    expenses: remote.expenses?.length ? remote.expenses : local.expenses,
  };
}
