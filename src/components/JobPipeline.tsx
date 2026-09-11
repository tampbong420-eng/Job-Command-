import { estimateTotals, money } from '@/lib/money';
import { JOB_STATUSES, STATUS_LABEL, cn } from '@/lib/format';
import { uid } from '@/lib/ids';
import type { Employee, Job, JobStatus, LineItem } from '@/types';
import { useState, type ReactNode } from 'react';

const inputClass =
  'w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm font-medium focus:border-amber-500 outline-none';

export function JobPipeline({
  jobs,
  employees,
  onAdd,
  onPatch,
}: {
  jobs: Job[];
  employees: Employee[];
  onAdd: () => Job;
  onPatch: (id: string, partial: Partial<Job>) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(jobs[0]?.id ?? null);
  const open = jobs.find((job) => job.id === openId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">
            Job pipeline & estimating
          </h2>
          <p className="text-sm text-neutral-400">Move work from lead to paid. Markup and tax are live.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const created = onAdd();
            setOpenId(created.id);
          }}
          className="bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
        >
          New job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {JOB_STATUSES.map((status) => (
          <div key={status} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-56">
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-3">
              {STATUS_LABEL[status]} · {jobs.filter((job) => job.status === status).length}
            </p>
            <div className="space-y-2">
              {jobs
                .filter((job) => job.status === status)
                .map((job) => {
                  const totals = estimateTotals(job);
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setOpenId(job.id)}
                      className={cn(
                        'w-full text-left bg-neutral-950 border rounded-xl p-3 hover:border-neutral-600',
                        openId === job.id ? 'border-amber-500' : 'border-neutral-800',
                      )}
                    >
                      <p className="font-bold text-sm">{job.customerName}</p>
                      <p className="text-xs text-neutral-500 truncate">{job.address || 'No address yet'}</p>
                      <p className="text-xs text-amber-400 font-bold mt-2">{money(totals.total)}</p>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <EstimateEditor
          job={open}
          employees={employees}
          onPatch={(partial) => onPatch(open.id, partial)}
        />
      )}
    </div>
  );
}

function EstimateEditor({
  job,
  employees,
  onPatch,
}: {
  job: Job;
  employees: Employee[];
  onPatch: (partial: Partial<Job>) => void;
}) {
  const totals = estimateTotals(job);

  function patchItem(id: string, partial: Partial<LineItem>) {
    onPatch({
      items: job.items.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="grid md:grid-cols-4 gap-3">
        <Field label="Customer">
          <input
            className={inputClass}
            value={job.customerName}
            onChange={(event) => onPatch({ customerName: event.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputClass}
            value={job.customerPhone}
            onChange={(event) => onPatch({ customerPhone: event.target.value })}
          />
        </Field>
        <Field label="Address">
          <input
            className={inputClass}
            value={job.address}
            onChange={(event) => onPatch({ address: event.target.value })}
          />
        </Field>
        <Field label="Assign crew">
          <select
            className={inputClass}
            value={job.assignedEmployeeId ?? ''}
            onChange={(event) => onPatch({ assignedEmployeeId: event.target.value || null })}
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        {JOB_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onPatch({ status: status as JobStatus })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider',
              job.status === status ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-300',
            )}
          >
            {STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="text-left py-2">Kind</th>
              <th className="text-left">Description</th>
              <th className="text-right">Qty</th>
              <th className="text-left">Unit</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {job.items.map((item) => (
              <tr key={item.id} className="border-t border-neutral-800">
                <td className="py-2 pr-2">
                  <select
                    className={inputClass}
                    value={item.kind}
                    onChange={(event) =>
                      patchItem(item.id, { kind: event.target.value as LineItem['kind'] })
                    }
                  >
                    <option value="labor">Labor</option>
                    <option value="material">Material</option>
                  </select>
                </td>
                <td className="pr-2">
                  <input
                    className={inputClass}
                    value={item.description}
                    onChange={(event) => patchItem(item.id, { description: event.target.value })}
                  />
                </td>
                <td className="pr-2 w-24">
                  <input
                    type="number"
                    className={`${inputClass} text-right`}
                    value={item.qty}
                    onChange={(event) => patchItem(item.id, { qty: Number(event.target.value) })}
                  />
                </td>
                <td className="pr-2 w-24">
                  <input
                    className={inputClass}
                    value={item.unit}
                    onChange={(event) => patchItem(item.id, { unit: event.target.value })}
                  />
                </td>
                <td className="pr-2 w-28">
                  <input
                    type="number"
                    className={`${inputClass} text-right`}
                    value={item.rate}
                    onChange={(event) => patchItem(item.id, { rate: Number(event.target.value) })}
                  />
                </td>
                <td className="text-right font-bold">{money(item.qty * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="text-xs font-black uppercase tracking-wider text-amber-400"
        onClick={() =>
          onPatch({
            items: [
              ...job.items,
              {
                id: uid('li'),
                kind: 'material',
                description: 'New line',
                qty: 1,
                unit: 'ea',
                rate: 0,
              },
            ],
          })
        }
      >
        + Line item
      </button>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Notes">
          <textarea
            className={inputClass}
            rows={3}
            value={job.notes}
            onChange={(event) => onPatch({ notes: event.target.value })}
          />
        </Field>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex gap-3">
            <label className="flex-1">
              Markup %
              <input
                type="number"
                className={`${inputClass} mt-1`}
                value={job.markupPct}
                onChange={(event) => onPatch({ markupPct: Number(event.target.value) })}
              />
            </label>
            <label className="flex-1">
              Tax %
              <input
                type="number"
                className={`${inputClass} mt-1`}
                value={job.taxPct}
                onChange={(event) => onPatch({ taxPct: Number(event.target.value) })}
              />
            </label>
          </div>
          <Row label="Labor" value={money(totals.labor)} />
          <Row label="Materials" value={money(totals.materials)} />
          <Row label="Markup" value={money(totals.markup)} />
          <Row label="Tax" value={money(totals.tax)} />
          <Row label="Total" value={money(totals.total)} strong />
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-neutral-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'font-black text-amber-400' : 'text-neutral-300'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
