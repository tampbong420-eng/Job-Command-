import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/signup-form";
import { getReadyDb } from "@/db";
import { countUsers } from "@/lib/services/users";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create admin" };

export default async function SignupPage() {
  const db = await getReadyDb();
  const total = await countUsers(db);
  if (total > 0) redirect("/login");

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create the first admin</CardTitle>
          <CardDescription>
            This workspace has no users yet. The first account becomes administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground">
            Already provisioned?{" "}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
