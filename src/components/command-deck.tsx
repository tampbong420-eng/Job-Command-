"use client";

export function CommandDeck({
  kicker,
  title,
  hint,
  children,
}: {
  kicker?: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        {kicker ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">{kicker}</p>
        ) : null}
        <h1 className="text-[1.65rem] font-semibold tracking-tight">{title}</h1>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
