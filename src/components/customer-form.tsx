"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { CustomerRow } from "@/db/schema";

export function CustomerForm({ customer }: { customer?: CustomerRow }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    try {
      const payload = {
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        address: String(formData.get("address") || ""),
        notes: String(formData.get("notes") || ""),
      };
      if (customer) {
        await api(`/api/customers/${customer.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Customer updated");
        router.push(`/customers/${customer.id}`);
      } else {
        const created = await api<{ customer: { id: string } }>("/api/customers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Customer added");
        router.push(`/customers/${created.customer.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save customer");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="grid max-w-2xl gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={customer?.name} required />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={customer?.notes ?? ""} rows={4} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : customer ? "Save customer" : "Add customer"}
      </Button>
    </form>
  );
}
