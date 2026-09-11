import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { canWriteCustomers } from "@/lib/domain";
import { listCustomers } from "@/lib/services/customers";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const customers = await listCustomers(db);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Sites and accounts you dispatch to.</p>
        </div>
        {canWriteCustomers(user.role) ? (
          <Button asChild>
            <Link href="/customers/new">Add customer</Link>
          </Button>
        ) : null}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {customer.email || customer.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{customer.address || "—"}</td>
                  </tr>
                ))}
                {customers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={3}>
                      No customers yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
