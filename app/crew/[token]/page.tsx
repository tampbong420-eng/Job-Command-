"use client";

import FieldPortal from "@/components/FieldPortal";
import { use } from "react";

export default function CrewJoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  return <FieldPortal token={token} />;
}
