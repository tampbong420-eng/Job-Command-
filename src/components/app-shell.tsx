"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, LogOut, Settings, Users } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { PAD_TONE_CLASS, screenForPath } from "@/lib/primary-screens";
import { cn } from "@/lib/utils";

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
  const screen = screenForPath(pathname);
  const accent = PAD_TONE_CLASS[screen?.tone ?? "gold"];

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-svh bg-[#090a0d]">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-background shadow-[0_0_80px_rgba(0,0,0,0.55)]">
        <header
          className="sticky top-0 z-30 border-b border-border/80 bg-background/90 px-3 backdrop-blur"
          style={{ paddingTop: "max(0.7rem, env(safe-area-inset-top))" }}
        >
          <div className="flex items-center justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-1">
              {!atHome ? (
                <Link
                  href="/command"
                  aria-label="Home"
                  className="mr-1 flex size-9 items-center justify-center rounded-full text-primary"
                >
                  <ChevronLeft className="size-6" />
                </Link>
              ) : null}
              <BrandLockup />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="size-8">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    ) : null}
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
          </div>
          <div className={cn("-mx-3 h-0.5", accent.bar)} />
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
