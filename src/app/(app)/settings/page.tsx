import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadyDb, usesEphemeralDatabase } from "@/db";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/domain";

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
              <p>
                Running on local PGlite at <code>.data/job-command</code>. Set{" "}
                <code>DATABASE_URL</code> to a Neon Postgres URL for production persistence.
              </p>
            ) : (
              <p>Connected to Neon via <code>DATABASE_URL</code>.</p>
            )}
            <p>
              Custom domains are attached on the Vercel project after the first production
              deploy: Project → Settings → Domains.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
