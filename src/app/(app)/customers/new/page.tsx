import { redirect } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { requireUser } from "@/lib/auth";
import { canWriteCustomers } from "@/lib/domain";

export const metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  const user = await requireUser();
  if (!canWriteCustomers(user.role)) redirect("/customers");
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add customer</h1>
        <p className="text-sm text-muted-foreground">A site or account that receives work orders.</p>
      </div>
      <CustomerForm />
    </div>
  );
}
