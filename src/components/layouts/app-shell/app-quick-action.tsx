"use client";

import { useTranslations } from "next-intl";
import { IconFileDescription, IconSchool, IconUpload } from "@tabler/icons-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Link } from "@/i18n/navigation";

interface AppQuickActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions = [
  {
    key: "new-ce-entry",
    icon: IconFileDescription,
    labelKey: "AppNav.newCEEntry",
    descriptionKey: "AppNav.newCEEntryDesc",
    href: "/ce-entries/new",
  },
  {
    key: "new-registration",
    icon: IconSchool,
    labelKey: "AppNav.newRegistration",
    descriptionKey: "AppNav.newRegistrationDesc",
    href: "/registrations/new",
  },
  {
    key: "new-evidence",
    icon: IconUpload,
    labelKey: "AppNav.newEvidence",
    descriptionKey: "AppNav.newEvidenceDesc",
    href: "/evidences/new",
  },
];

export function AppQuickAction({ open, onOpenChange }: AppQuickActionProps) {
  const t = useTranslations();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("AppNav.quickActions")}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-4 pb-8">
          {quickActions.map((action) => (
            <Link
              key={action.key}
              href={action.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent active:bg-accent"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-sm font-medium">{t(action.labelKey as any)}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-xs text-muted-foreground">{t(action.descriptionKey as any)}</p>
              </div>
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
