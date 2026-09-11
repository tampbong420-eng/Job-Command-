import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">That record is not on the board</h1>
      <Button asChild>
        <Link href="/command">Return to command</Link>
      </Button>
    </div>
  );
}
