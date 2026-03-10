"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { appBottomNavItems, appTrainingDrawerItems } from "./app-nav-data";

interface AppBottomNavProps {
  onFabClick: () => void;
}

export function AppBottomNav({ onFabClick }: AppBottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check if any training/CE route is active (for drawer tab highlight)
  const trainingRoutes = appTrainingDrawerItems.map((item) => item.href);
  const isTrainingActive = trainingRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {appBottomNavItems.map((item) => {
            if (item.isFab) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={onFabClick}
                  className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95"
                >
                  <item.icon className="h-6 w-6" />
                </button>
              );
            }

            if (item.isDrawer) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                    isTrainingActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isTrainingActive && "fill-primary/10")} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span className="truncate">{t(item.labelKey as any)}</span>
                </button>
              );
            }

            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/10")} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className="truncate">{t(item.labelKey as any)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Training drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <DrawerTitle>{t("AppNav.training" as any)}</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            <div className="flex flex-col gap-2 px-4 pb-8">
              {appTrainingDrawerItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent active:bg-accent",
                      isActive && "border-primary/30 bg-primary/5",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p className="text-sm font-medium">{t(item.labelKey as any)}</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p className="text-xs text-muted-foreground">
                        {t(item.descriptionKey as any)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
