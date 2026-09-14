"use client";

import Link from "next/link";
import { TeamManager } from "@/components/team-manager";
import { Button } from "@/components/ui/button";
import { COMPANY_BILLING, COMPANY_TERMS } from "@/lib/company";
import {
  ROLE_LABELS,
  canAccessBilling,
  canConfigureAi,
  canManageTeam,
  type PublicUser,
} from "@/lib/domain";
import type { WorkspaceBrand } from "@/lib/brand";

export function CompanyHub({
  brand,
  user,
  teammates,
}: {
  brand: WorkspaceBrand;
  user: PublicUser;
  teammates: PublicUser[];
}) {
  const billing = canAccessBilling(user.role);
  const office = canConfigureAi(user.role) || user.role === "dispatcher";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card px-4 py-5 ring-1 ring-boss/25">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-boss">Shop</p>
        <p className="mt-2 text-[1.45rem] font-semibold leading-tight">{brand.companyName}</p>
        <p className="mt-1 text-sm text-muted-foreground">{brand.companyCity}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Job Command mark stays on the left. Drop the shop logo here when you have it.
        </p>
      </div>

      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your seat</p>
        <p className="mt-2 text-lg font-semibold">{ROLE_LABELS[user.role]}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.role === "technician"
            ? "Clock, maps, photos, job chat. No pricing, billing, or AI config."
            : user.role === "admin"
              ? "Full desk — money, people, AI phone, and billing."
              : user.role === "dispatcher"
                ? "Jobs, phone, fleet, and chat. Billing stays with the owner."
                : "Read-only on the board."}
        </p>
      </div>

      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Subscription</p>
            <p className="mt-2 text-lg font-semibold">{COMPANY_BILLING.plan}</p>
            <p className="text-sm text-muted-foreground">
              {COMPANY_BILLING.amountLabel} · {COMPANY_BILLING.seats} seats
            </p>
          </div>
          <span className="rounded-full bg-boss/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-boss">
            {COMPANY_BILLING.status}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Failed card: {COMPANY_BILLING.graceDays}-day grace, then office and AI dispatch lock. Crew clock and
          job photos stay up.
        </p>
        {!billing ? (
          <p className="mt-2 text-xs text-muted-foreground">Only an administrator can change billing.</p>
        ) : null}
      </div>

      {canManageTeam(user.role) ? (
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">People</p>
          <TeamManager users={teammates} canManage />
        </div>
      ) : (
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="font-medium">Crew on this shop</p>
          <ul className="mt-2 space-y-2 text-sm">
            {teammates.map((person) => (
              <li key={person.id} className="flex justify-between gap-2">
                <span>{person.name}</span>
                <span className="text-muted-foreground">{ROLE_LABELS[person.role]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {office ? (
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <a href="/api/company/export">Export JSON</a>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href="/api/company/export?format=csv">Export CSV</a>
          </Button>
        </div>
      ) : null}

      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">House rules</p>
        <ul className="mt-3 space-y-2 text-sm leading-snug text-muted-foreground">
          {COMPANY_TERMS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3">
          <Link href="/settings" className="text-sm text-boss underline-offset-2 hover:underline">
            Your login settings
          </Link>
        </p>
      </div>
    </div>
  );
}
