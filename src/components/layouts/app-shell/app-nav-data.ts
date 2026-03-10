import {
  IconBell,
  IconCertificate,
  IconClipboardList,
  IconFileDescription,
  IconHistory,
  IconHome,
  IconLicense,
  IconPlus,
  IconSchool,
  IconUpload,
  IconUser,
  type TablerIcon,
} from "@tabler/icons-react";

// =============================================================================
// TYPES
// =============================================================================

export interface AppNavItem {
  key: string;
  icon: TablerIcon;
  labelKey: string;
  href: string;
  /** If true, renders as FAB (floating action button) instead of regular tab */
  isFab?: boolean;
  /** If true, opens a drawer with sub-items instead of navigating */
  isDrawer?: boolean;
}

export interface AppQuickAction {
  key: string;
  icon: TablerIcon;
  labelKey: string;
  href: string;
}

// =============================================================================
// BOTTOM NAV DATA
// =============================================================================

export const appBottomNavItems: AppNavItem[] = [
  {
    key: "home",
    icon: IconHome,
    labelKey: "AppNav.home",
    href: "/",
  },
  {
    key: "training",
    icon: IconSchool,
    labelKey: "AppNav.training",
    href: "/my-training",
    isDrawer: true,
  },
  {
    key: "create",
    icon: IconPlus,
    labelKey: "AppNav.create",
    href: "#",
    isFab: true,
  },
  {
    key: "notifications",
    icon: IconBell,
    labelKey: "AppNav.notifications",
    href: "/notifications",
  },
  {
    key: "profile",
    icon: IconUser,
    labelKey: "AppNav.profile",
    href: "/profile",
  },
];

// =============================================================================
// TRAINING DRAWER DATA — shown when tapping "Đào Tạo" in bottom nav
// =============================================================================

export interface AppTrainingDrawerItem {
  key: string;
  labelKey: string;
  descriptionKey: string;
  href: string;
  icon: TablerIcon;
}

export const appTrainingDrawerItems: AppTrainingDrawerItem[] = [
  {
    key: "courses",
    labelKey: "AppNav.courses",
    descriptionKey: "AppNav.coursesDesc",
    href: "/courses",
    icon: IconSchool,
  },
  {
    key: "my-training",
    labelKey: "AppNav.myTraining",
    descriptionKey: "AppNav.myTrainingDesc",
    href: "/my-training",
    icon: IconCertificate,
  },
  {
    key: "training-history",
    labelKey: "AppNav.trainingHistory",
    descriptionKey: "AppNav.trainingHistoryDesc",
    href: "/my-training/history",
    icon: IconHistory,
  },
  {
    key: "registrations",
    labelKey: "AppNav.registrations",
    descriptionKey: "AppNav.registrationsDesc",
    href: "/registrations",
    icon: IconClipboardList,
  },
  {
    key: "ce-entries",
    labelKey: "AppNav.ceEntries",
    descriptionKey: "AppNav.ceEntriesDesc",
    href: "/ce-entries",
    icon: IconFileDescription,
  },
  {
    key: "evidences",
    labelKey: "AppNav.evidences",
    descriptionKey: "AppNav.evidencesDesc",
    href: "/evidences",
    icon: IconUpload,
  },
  {
    key: "certificates",
    labelKey: "AppNav.certificates",
    descriptionKey: "AppNav.certificatesDesc",
    href: "/certificates",
    icon: IconLicense,
  },
];

// =============================================================================
// DESKTOP NAV DATA — NavigationMenu with Trigger+Content dropdowns
// =============================================================================

export interface AppDesktopNavLink {
  kind: "link";
  key: string;
  labelKey: string;
  href: string;
}

export interface AppDesktopNavGroupItem {
  key: string;
  labelKey: string;
  descriptionKey: string;
  href: string;
  icon: TablerIcon;
}

export interface AppDesktopNavGroup {
  kind: "group";
  key: string;
  labelKey: string;
  items: AppDesktopNavGroupItem[];
}

export type AppDesktopNavEntry = AppDesktopNavLink | AppDesktopNavGroup;

export const appDesktopNavEntries: AppDesktopNavEntry[] = [
  // Dropdown: Dao Tao
  {
    kind: "group",
    key: "training",
    labelKey: "AppNav.training",
    items: [
      {
        key: "courses",
        labelKey: "AppNav.courses",
        descriptionKey: "AppNav.coursesDesc",
        href: "/courses",
        icon: IconSchool,
      },
      {
        key: "my-training",
        labelKey: "AppNav.myTraining",
        descriptionKey: "AppNav.myTrainingDesc",
        href: "/my-training",
        icon: IconCertificate,
      },
      {
        key: "training-history",
        labelKey: "AppNav.trainingHistory",
        descriptionKey: "AppNav.trainingHistoryDesc",
        href: "/my-training/history",
        icon: IconHistory,
      },
      {
        key: "registrations",
        labelKey: "AppNav.registrations",
        descriptionKey: "AppNav.registrationsDesc",
        href: "/registrations",
        icon: IconClipboardList,
      },
    ],
  },

  // Dropdown: GDLT
  {
    kind: "group",
    key: "ce",
    labelKey: "AppNav.ceGroup",
    items: [
      {
        key: "ce-entries",
        labelKey: "AppNav.ceEntries",
        descriptionKey: "AppNav.ceEntriesDesc",
        href: "/ce-entries",
        icon: IconFileDescription,
      },
      {
        key: "evidences",
        labelKey: "AppNav.evidences",
        descriptionKey: "AppNav.evidencesDesc",
        href: "/evidences",
        icon: IconUpload,
      },
      {
        key: "certificates",
        labelKey: "AppNav.certificates",
        descriptionKey: "AppNav.certificatesDesc",
        href: "/certificates",
        icon: IconLicense,
      },
    ],
  },
];

// =============================================================================
// COMMAND SEARCH DATA — flat list for search
// =============================================================================

export interface AppCommandItem {
  key: string;
  labelKey: string;
  href: string;
  icon: TablerIcon;
  group: string;
}

export const appCommandItems: AppCommandItem[] = [
  // Navigation
  {
    key: "home",
    labelKey: "AppNav.home",
    href: "/",
    icon: IconHome,
    group: "AppNav.navigationGroup",
  },
  {
    key: "profile",
    labelKey: "AppNav.profile",
    href: "/profile",
    icon: IconUser,
    group: "AppNav.navigationGroup",
  },
  {
    key: "notifications",
    labelKey: "AppNav.notifications",
    href: "/notifications",
    icon: IconBell,
    group: "AppNav.navigationGroup",
  },

  // Training
  {
    key: "courses",
    labelKey: "AppNav.courses",
    href: "/courses",
    icon: IconSchool,
    group: "AppNav.training",
  },
  {
    key: "my-training",
    labelKey: "AppNav.myTraining",
    href: "/my-training",
    icon: IconCertificate,
    group: "AppNav.training",
  },
  {
    key: "training-history",
    labelKey: "AppNav.trainingHistory",
    href: "/my-training/history",
    icon: IconHistory,
    group: "AppNav.training",
  },
  {
    key: "registrations",
    labelKey: "AppNav.registrations",
    href: "/registrations",
    icon: IconClipboardList,
    group: "AppNav.training",
  },

  // CE / Evidences
  {
    key: "ce-entries",
    labelKey: "AppNav.ceEntries",
    href: "/ce-entries",
    icon: IconFileDescription,
    group: "AppNav.ceGroup",
  },
  {
    key: "evidences",
    labelKey: "AppNav.evidences",
    href: "/evidences",
    icon: IconUpload,
    group: "AppNav.ceGroup",
  },
  {
    key: "certificates",
    labelKey: "AppNav.certificates",
    href: "/certificates",
    icon: IconLicense,
    group: "AppNav.ceGroup",
  },

  // Quick create
  {
    key: "new-ce-entry",
    labelKey: "AppNav.newCEEntry",
    href: "/ce-entries/new",
    icon: IconFileDescription,
    group: "AppNav.createGroup",
  },
  {
    key: "new-registration",
    labelKey: "AppNav.newRegistration",
    href: "/registrations/new",
    icon: IconClipboardList,
    group: "AppNav.createGroup",
  },
  {
    key: "new-evidence",
    labelKey: "AppNav.newEvidence",
    href: "/evidences/new",
    icon: IconUpload,
    group: "AppNav.createGroup",
  },
];

// Unique group keys for iteration
export const appCommandGroups = [
  "AppNav.navigationGroup",
  "AppNav.training",
  "AppNav.ceGroup",
  "AppNav.createGroup",
] as const;

// =============================================================================
// QUICK ACTION DATA (FAB drawer)
// =============================================================================

export const appQuickActions: AppQuickAction[] = [
  {
    key: "new-ce-entry",
    icon: IconFileDescription,
    labelKey: "AppNav.newCEEntry",
    href: "/ce-entries/new",
  },
  {
    key: "new-registration",
    icon: IconSchool,
    labelKey: "AppNav.newRegistration",
    href: "/registrations/new",
  },
  {
    key: "new-evidence",
    icon: IconUpload,
    labelKey: "AppNav.newEvidence",
    href: "/evidences/new",
  },
];
