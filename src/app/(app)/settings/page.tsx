import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadyDb, usesEphemeralDatabase } from "@/db";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/domain";
import { OFFICE_ITEMS } from "@/lib/primary-screens";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  await getReadyDb();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Workspace and account details.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name: </span>
              {user.name}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role: </span>
              {ROLE_LABELS[user.role]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {usesEphemeralDatabase() ? (
              process.env.VERCEL ? (
                <p>
                  Running on in-memory PGlite on this Vercel isolate (demo data resets on
                  cold start). Set <code>DATABASE_URL</code> to a Neon Postgres URL for
                  production persistence.
                </p>
              ) : (
                <p>
                  Running on local PGlite at <code>.data/job-command</code>. Set{" "}
                  <code>DATABASE_URL</code> to a Neon Postgres URL for production
                  persistence.
                </p>
              )
            ) : (
              <p>Connected to Neon via <code>DATABASE_URL</code>.</p>
            )}
            <p>
              Custom domains are attached on the Vercel project after the first production
              deploy: Project → Settings → Domains.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Office</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Not a home box. Lives under the photo so the six boxes stay the daily desk.
            </p>
            <ul className="space-y-1.5">
              {OFFICE_ITEMS.map((item) => (
                <li key={item.label}>{item.label}</li>
              ))}
            </ul>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Named. Not built yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
