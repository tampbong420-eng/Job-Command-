"use client";

import { fieldPin } from "@/lib/access";
import { initials } from "@/lib/format";
import type { CrewMember } from "@/lib/types";
import { useMemo, useState } from "react";

export default function EmployeeGate({
  crew,
  bossCode,
  onEmployee,
  onBoss,
  onCancel,
}: {
  crew: CrewMember[];
  bossCode: string;
  onEmployee: (id: string) => void;
  onBoss: () => void;
  onCancel?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [boss, setBoss] = useState("");
  const [error, setError] = useState<string | null>(null);
  const member = useMemo(
    () => crew.find((row) => row.id === picked) ?? null,
    [crew, picked],
  );

  function submitEmployee() {
    if (!member) {
      setError("Pick your name first.");
      return;
    }
    if (pin.replace(/\D/g, "") !== fieldPin(member)) {
      setError("PIN is the last 4 digits of your shop phone.");
      return;
    }
    onEmployee(member.id);
  }

  function submitBoss() {
    if (boss.replace(/\s+/g, "").toUpperCase() !== bossCode.replace(/\s+/g, "").toUpperCase()) {
      setError("Boss code does not match Settings → Account.");
      return;
    }
    onBoss();
  }

  return (
    <section className="page field-gate">
      <p className="section-kicker">Field login</p>
      <h1>
        Who is
        <br />
        <strong>on this phone?</strong>
      </h1>
      <p className="board-copy">
        Employees open their own clock, stops, and hours. Boss command stays
        locked behind the shop account code.
      </p>
      <div className="gate-list">
        {crew.map((row) => (
          <button
            key={row.id}
            type="button"
            className={`gate-card${picked === row.id ? " on" : ""}`}
            onClick={() => {
              setPicked(row.id);
              setPin("");
              setError(null);
            }}
          >
            <span className={`crew-photo duty-${row.status}`}>
              {row.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.photoUrl} alt="" />
              ) : (
                <span className="initials">{initials(row.name)}</span>
              )}
            </span>
            <span className="gate-copy">
              <b>{row.name}</b>
              <small>{row.role} · {row.phone}</small>
            </span>
          </button>
        ))}
      </div>
      {member && (
        <label className="settings-field">
          {member.name.split(" ")[0]}&apos;s 4-digit PIN
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Last 4 of phone"
          />
        </label>
      )}
      <button type="button" className="lock-button locked" onClick={submitEmployee}>
        <span className="button-icon" aria-hidden="true">
          ☺
        </span>
        <span>
          <small>Open field tools</small>
          <b>Sign in as employee</b>
        </span>
      </button>
      <article className="plate settings-card">
        <p className="card-label">Boss desk</p>
        <label className="settings-field">
          Shop account code
          <input
            value={boss}
            autoCapitalize="characters"
            onChange={(event) => setBoss(event.target.value)}
            placeholder="Account code from Settings"
          />
        </label>
        <button type="button" className="ghost-action" onClick={submitBoss}>
          Open boss command
        </button>
      </article>
      {error && <p className="gate-error">{error}</p>}
      {onCancel && (
        <button type="button" className="text-back" onClick={onCancel}>
          ← Back to the desk
        </button>
      )}
    </section>
  );
}
