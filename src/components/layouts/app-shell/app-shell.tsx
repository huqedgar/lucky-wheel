"use client";

import { useState } from "react";
import { AppBottomNav } from "./app-bottom-nav";
import { AppFooter } from "./app-footer";
import { AppHeader } from "./app-header";
import { AppQuickAction } from "./app-quick-action";
import { AppSearchProvider } from "./app-search-provider";

interface AppShellProps {
  children: React.ReactNode;
  userMenu?: React.ReactNode;
}

export function AppShell({ children, userMenu }: AppShellProps) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <AppSearchProvider>
      <div data-slot="layout" className="relative z-10 flex min-h-svh flex-col bg-background">
        <AppHeader userMenu={userMenu} />
        <main className="flex flex-1 flex-col pb-16 lg:pb-0">{children}</main>
        <AppFooter />
        <AppBottomNav onFabClick={() => setQuickActionOpen(true)} />
        <AppQuickAction open={quickActionOpen} onOpenChange={setQuickActionOpen} />
      </div>
    </AppSearchProvider>
  );
}
