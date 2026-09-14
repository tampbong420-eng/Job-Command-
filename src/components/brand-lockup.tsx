"use client";

import Image from "next/image";
import Link from "next/link";
import { getWorkspaceBrand } from "@/lib/brand";

export function BrandLockup({ href = "/command" }: { href?: string }) {
  const brand = getWorkspaceBrand();

  return (
    <Link href={href} className="flex min-w-0 items-center gap-2">
      <Image
        src={brand.productLogo}
        alt="Job Command"
        width={140}
        height={100}
        priority
        className="h-10 w-auto max-w-[9.5rem] rounded-md object-contain object-left"
      />
      {brand.companyLogo ? (
        <Image
          src={brand.companyLogo}
          alt="Company logo"
          width={36}
          height={36}
          className="size-9 rounded-md object-contain ring-1 ring-white/10"
        />
      ) : null}
    </Link>
  );
}
