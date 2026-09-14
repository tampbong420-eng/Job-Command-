import { NextScreenStub } from "@/components/next-screen-stub";

export const metadata = { title: "Shop books" };

export default function ShopScreenPage() {
  return (
    <NextScreenStub
      screen="shop"
      title="Shop books"
      copy="Estimates, invoices, and job costing plug into this slot next."
    />
  );
}
