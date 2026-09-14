import Link from "next/link";
import { Shield, RadioTower, Waypoints } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <BrandLockup href="/" />
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link href="/command">Open board</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Launch</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-primary">
          Field operations OS
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Dispatch work. Watch the board. Close the job.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Job Command is the live desk for service teams. Dispatchers create and assign
          work orders. Technicians update status from the field. Everyone sees the same
          command board.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/login">Enter command</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Use demo accounts</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: RadioTower,
              title: "Roles that match the floor",
              body: "Admin, dispatcher, technician, and viewer permissions are enforced on every API and screen.",
            },
            {
              icon: Waypoints,
              title: "Status that cannot skip lanes",
              body: "Jobs move queued → assigned → in progress → blocked or complete. Invalid jumps are rejected.",
            },
            {
              icon: Shield,
              title: "Ready for Neon on Vercel",
              body: "Local PGlite for development, serverless Postgres in production, cookie sessions, and CRUD APIs.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
            >
              <item.icon className="mb-3 size-5 text-primary" />
              <h2 className="text-base font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
