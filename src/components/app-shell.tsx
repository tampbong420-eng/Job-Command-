"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Radio, Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PublicUser } from "@/lib/domain";
import { initials } from "@/lib/format";
import { api } from "@/lib/api";

export function AppShell({
  user,
  children,
}: {
  user: PublicUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const atHome = pathname === "/command";

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-svh bg-[#090a0d]">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-background shadow-[0_0_80px_rgba(0,0,0,0.55)]">
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-3 backdrop-blur"
          style={{ paddingTop: "max(0.7rem, env(safe-area-inset-top))" }}
        >
          <div className="flex min-w-0 items-center gap-1 py-2">
            {!atHome ? (
              <Link
                href="/command"
                aria-label="Home"
                className="mr-1 flex size-9 items-center justify-center rounded-full text-primary"
              >
                <ChevronLeft className="size-6" />
              </Link>
            ) : null}
            <Link href="/command" className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Radio className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none tracking-tight">JOB COMMAND</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
                  Field ops
                </p>
              </div>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/20 text-xs text-primary">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/team">
                  <Users className="size-4" />
                  Team
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void signOut()}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
