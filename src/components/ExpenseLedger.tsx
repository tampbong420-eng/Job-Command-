import { compressImage, parseReceiptText } from '@/lib/image';
import { EXPENSE_CATEGORIES } from '@/lib/format';
import { uid } from '@/lib/ids';
import { money } from '@/lib/money';
import type { Employee, Expense } from '@/types';
import { useMemo, useState } from 'react';

const inputClass =
  'w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm font-medium focus:border-amber-500 outline-none';

export function ExpenseLedger({
  expenses,
  employees,
  onSave,
  onRemove,
  onNotice,
}: {
  expenses: Expense[];
  employees: Employee[];
  onSave: (expense: Expense) => void;
  onRemove: (id: string) => void;
  onNotice: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<Expense>(() => emptyExpense());
  const [busy, setBusy] = useState(false);
  const monthTotal = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      let vendor = draft.vendor;
      let amount = draft.amount;
      let ocrText = '';
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const result = await worker.recognize(file);
        await worker.terminate();
        ocrText = result.data.text;
        const parsed = parseReceiptText(ocrText);
        vendor = parsed.vendor ?? vendor;
        amount = parsed.amount ?? amount;
        onNotice('Receipt scanned');
      } catch {
        onNotice('Image attached — enter vendor and amount');
      }
      setDraft((prev) => ({ ...prev, receiptDataUrl: dataUrl, vendor, amount, ocrText }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">
          Receipt scanner
        </h2>
        <label className="block border border-dashed border-neutral-700 rounded-2xl p-6 text-center cursor-pointer hover:border-amber-500">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <p className="font-black text-sm">Snap or upload a receipt</p>
          <p className="text-xs text-neutral-500 mt-1">
            {busy ? 'Reading ticket…' : 'On-device OCR fills vendor and total when it can.'}
          </p>
        </label>
        {draft.receiptDataUrl && (
          <img src={draft.receiptDataUrl} alt="Receipt preview" className="rounded-xl max-h-48 mx-auto" />
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-bold text-neutral-400">
            Vendor
            <input
              className={`${inputClass} mt-1`}
              value={draft.vendor}
              onChange={(event) => setDraft({ ...draft, vendor: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-neutral-400">
            Amount
            <input
              type="number"
              className={`${inputClass} mt-1`}
              value={draft.amount || ''}
              onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })}
            />
          </label>
          <label className="text-xs font-bold text-neutral-400">
            Category
            <select
              className={`${inputClass} mt-1`}
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-neutral-400">
            Crew
            <select
              className={`${inputClass} mt-1`}
              value={draft.employeeId ?? ''}
              onChange={(event) => setDraft({ ...draft, employeeId: event.target.value || null })}
            >
              <option value="">Office</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          disabled={!draft.vendor || !draft.amount}
          onClick={() => {
            onSave(draft);
            setDraft(emptyExpense());
            onNotice('Expense posted to ledger');
          }}
          className="bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg disabled:opacity-40"
        >
          Post expense
        </button>
      </section>

      <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-500">Ledger</h2>
          <span className="text-sm font-black text-white">{money(monthTotal)}</span>
        </div>
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-3 bg-neutral-950 border border-neutral-800 rounded-xl p-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{expense.vendor}</p>
                <p className="text-xs text-neutral-500">
                  {expense.category} · {expense.date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-black text-sm">{money(expense.amount)}</p>
                <button
                  type="button"
                  className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-white"
                  onClick={() => onRemove(expense.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function emptyExpense(): Expense {
  return {
    id: uid('exp'),
    vendor: '',
    amount: 0,
    category: 'Materials',
    date: new Date().toISOString().slice(0, 10),
    receiptDataUrl: null,
    employeeId: null,
    notes: '',
    ocrText: '',
  };
}
