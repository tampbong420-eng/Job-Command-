"use client";

import { inviteTokenFor } from "@/lib/field";
import type { CrewMember } from "@/lib/types";
import { useMemo, useState } from "react";

export default function InviteSheet({
  member,
  onClose,
}: {
  member: CrewMember;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const token = inviteTokenFor(member);
  const href = useMemo(() => {
    if (typeof window === "undefined") return `/crew/${token}`;
    return `${window.location.origin}/crew/${token}`;
  }, [token]);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(href)}`;

  return (
    <div className="sheet-backdrop talk-backdrop" onClick={onClose}>
      <section
        className="property-sheet plate"
        role="dialog"
        aria-labelledby="invite-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="property-head">
          <p className="card-label">Crew invite</p>
          <button type="button" className="text-back" onClick={onClose}>
            Close
          </button>
        </div>
        <h2 id="invite-title">{member.name.split(" ")[0]}&apos;s phone</h2>
        <p className="board-copy">
          Text this link. Their phone opens Employee Command already locked to
          this roster card.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="invite-qr" src={qr} alt="" />
        <p className="talk-heard">{href}</p>
        <div className="talk-actions">
          <a className="ghost-action hours" href={`sms:${member.phone}?body=${encodeURIComponent(href)}`}>
            Text link
          </a>
          <button
            type="button"
            className="lock-button locked"
            onClick={async () => {
              await navigator.clipboard.writeText(href);
              setCopied(true);
            }}
          >
            <span>
              <small>Clipboard</small>
              <b>{copied ? "COPIED" : "COPY LINK"}</b>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
