import { Suspense } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { getReadyDb, usesEphemeralDatabase } from "@/db";
import { countUsers } from "@/lib/services/users";
import { DEMO_PASSWORD } from "@/lib/domain";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const db = await getReadyDb();
  const total = await countUsers(db);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-center md:flex">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Radio className="size-4" />
            </span>
            <span className="font-semibold">Job Command</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in to the desk</h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Demo operators are ready on the local database. Production Neon starts empty so
            the first signup becomes admin.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use a teammate account or the seeded demo users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Suspense>
              <LoginForm allowSignup={total === 0} />
            </Suspense>
            {usesEphemeralDatabase() || total > 0 ? (
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Demo accounts</p>
                <p>admin@jobcommand.local</p>
                <p>dispatch@jobcommand.local</p>
                <p>tech@jobcommand.local</p>
                <p>viewer@jobcommand.local</p>
                <p className="mt-2 font-mono">Password: {DEMO_PASSWORD}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
