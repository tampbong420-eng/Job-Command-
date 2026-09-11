import type { Employee } from '@/types';
import { useMemo, useState } from 'react';

export function InviteSheet({
  employee,
  token,
  companyName,
  onClose,
  onNotice,
}: {
  employee: Employee;
  token: string;
  companyName: string;
  onClose: () => void;
  onNotice: (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = useMemo(() => `${window.location.origin}/crew/${token}`, [token]);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
  const sms = `sms:${employee.phone}?body=${encodeURIComponent(`You're invited to the ${companyName} field portal: ${url}`)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    onNotice('Invite link copied');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">
            Crew onboarding
          </p>
          <h3 className="text-lg font-black">{employee.name}</h3>
          <p className="text-sm text-neutral-400">{employee.role}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white text-sm font-bold"
        >
          Close
        </button>
      </div>
      <img
        src={qr}
        alt="Field portal QR code"
        className="mx-auto rounded-xl border border-neutral-800 bg-white p-2"
        width={180}
        height={180}
      />
      <p className="text-xs break-all text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
        {url}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider px-3 py-2.5 rounded-lg"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <a
          href={sms}
          className="bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-3 py-2.5 rounded-lg text-center"
        >
          Text tech
        </a>
      </div>
    </div>
  );
}
