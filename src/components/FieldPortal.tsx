import { compressImage } from '@/lib/image';
import { estimateTotals, money } from '@/lib/money';
import { useEmployees } from '@/lib/employees';
import { useCustomers } from '@/lib/customers';
import { useCompany } from '@/lib/company';
import { useExpenses } from '@/lib/expenses';
import { publishTelemetry } from '@/lib/telemetry';
import { uid } from '@/lib/ids';
import type { Employee, Expense, Job } from '@/types';
import { useEffect, useMemo, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { useParams } from 'react-router-dom';

export function FieldPortal() {
  const { token } = useParams();
  const { profile } = useCompany();
  const { employees, patchEmployee } = useEmployees();
  const { jobs } = useCustomers();
  const { upsertExpense } = useExpenses();
  const employee = employees.find((item) => item.inviteToken === token);
  const [notice, setNotice] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  const assigned = useMemo(
    () => jobs.filter((job) => job.assignedEmployeeId === employee?.id && job.status !== 'complete'),
    [jobs, employee?.id],
  );

  useEffect(() => {
    const ref = watchRef;
    return () => {
      const id = ref.current;
      if (id != null) navigator.geolocation.clearWatch(id);
    };
  }, [watchRef]);

  if (!employee) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <p className="text-amber-500 font-black tracking-widest">JOB COMMAND</p>
          <h1 className="text-2xl font-black">Invite not found</h1>
          <p className="text-neutral-400">Ask the office to send a fresh field portal link.</p>
        </div>
      </div>
    );
  }

  return (
    <FieldDesk
      employee={employee}
      companyName={profile.companyName}
      jobs={assigned}
      notice={notice}
      setNotice={setNotice}
      patchEmployee={patchEmployee}
      upsertExpense={upsertExpense}
      watchRef={watchRef}
    />
  );
}

function FieldDesk({
  employee,
  companyName,
  jobs,
  notice,
  setNotice,
  patchEmployee,
  upsertExpense,
  watchRef,
}: {
  employee: Employee;
  companyName: string;
  jobs: Job[];
  notice: string | null;
  setNotice: Dispatch<SetStateAction<string | null>>;
  patchEmployee: (id: string, partial: Partial<Employee>) => void;
  upsertExpense: (expense: Expense) => void;
  watchRef: RefObject<number | null>;
}) {
  function ping(partial: Partial<Employee>) {
    const next: Employee = {
      ...employee,
      ...partial,
      lastPing: new Date().toISOString(),
      liveGps: true,
    };
    patchEmployee(employee.id, next);
    void publishTelemetry(next);
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setNotice('Location is not available on this device');
      return;
    }
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        ping({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: Math.max(0, Math.round(((pos.coords.speed ?? 0) * 2.237) * 10) / 10),
          heading: pos.coords.heading ?? employee.heading,
          battery: employee.battery,
          status: employee.status === 'offline' ? 'available' : employee.status,
        });
        setNotice('Live GPS is sharing with dispatch');
      },
      () => setNotice('Allow location to appear on the command map'),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  }

  async function addReceipt(file: File | undefined) {
    if (!file) return;
    const receiptDataUrl = await compressImage(file);
    upsertExpense({
      id: uid('exp'),
      vendor: 'Field receipt',
      amount: 0,
      category: 'Materials',
      date: new Date().toISOString().slice(0, 10),
      receiptDataUrl,
      employeeId: employee.id,
      notes: 'Uploaded from field portal',
      ocrText: '',
    });
    setNotice('Receipt sent to the office ledger');
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 max-w-lg mx-auto space-y-4">
      {notice && (
        <p className="bg-amber-500 text-neutral-950 font-black text-sm px-4 py-3 rounded-xl">{notice}</p>
      )}
      <header className="pt-2">
        <p className="text-[10px] font-black tracking-widest text-amber-500">FIELD PORTAL</p>
        <h1 className="text-2xl font-black">{employee.name}</h1>
        <p className="text-sm text-neutral-400">
          {companyName} · {employee.role}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Speed" value={`${employee.speed} MPH`} />
        <Stat label="Battery" value={`${employee.battery}%`} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={shareLocation}
          className="bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider px-3 py-3 rounded-xl"
        >
          Share GPS
        </button>
        <button
          type="button"
          onClick={() => ping({ status: 'offline', speed: 0 })}
          className="bg-neutral-800 font-black text-xs uppercase tracking-wider px-3 py-3 rounded-xl"
        >
          Clock out
        </button>
        <button
          type="button"
          onClick={() => ping({ status: 'enroute' })}
          className="bg-neutral-800 font-black text-xs uppercase tracking-wider px-3 py-3 rounded-xl"
        >
          En route
        </button>
        <button
          type="button"
          onClick={() => ping({ status: 'onjob', speed: 0 })}
          className="bg-neutral-800 font-black text-xs uppercase tracking-wider px-3 py-3 rounded-xl"
        >
          On job
        </button>
      </div>

      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-amber-500">Assigned jobs</h2>
        {jobs.length === 0 && <p className="text-sm text-neutral-500">No open jobs on your board.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="bg-neutral-950 rounded-xl p-3 border border-neutral-800">
            <p className="font-bold">{job.customerName}</p>
            <p className="text-sm text-neutral-400">{job.address}</p>
            <p className="text-xs text-amber-400 font-bold mt-1">{money(estimateTotals(job).total)}</p>
            <p className="text-sm text-neutral-500 mt-2">{job.notes}</p>
          </div>
        ))}
      </section>

      <label className="block bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => void addReceipt(event.target.files?.[0])}
        />
        <span className="font-black text-sm">Upload receipt</span>
        <p className="text-xs text-neutral-500 mt-1">Photos land on the office expense ledger.</p>
      </label>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-black">{label}</p>
      <p className="font-black text-lg">{value}</p>
    </div>
  );
}
