import { Suspense } from "react";
import { BrandLockup } from "@/components/brand-lockup";
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
    <div className="flex min-h-svh items-center justify-center bg-[#090a0d] px-4 py-8">
      <div className="w-full max-w-[430px]">
        <div className="mb-5">
          <BrandLockup href="/login" />
        </div>
        <Card className="ring-1 ring-primary/20">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Same gold-and-charcoal shop. Open the six-box home.</CardDescription>
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
