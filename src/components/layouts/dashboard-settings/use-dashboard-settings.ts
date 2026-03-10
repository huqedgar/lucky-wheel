import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardSettings {
  sidebarVariant: "sidebar" | "floating" | "inset";
  showRail: boolean;
  stickyHeader: boolean;
  setSidebarVariant: (v: DashboardSettings["sidebarVariant"]) => void;
  setShowRail: (v: boolean) => void;
  setStickyHeader: (v: boolean) => void;
}

export const useDashboardSettings = create<DashboardSettings>()(
  persist(
    (set) => ({
      sidebarVariant: "sidebar",
      showRail: true,
      stickyHeader: true,
      setSidebarVariant: (sidebarVariant) => set({ sidebarVariant }),
      setShowRail: (showRail) => set({ showRail }),
      setStickyHeader: (stickyHeader) => set({ stickyHeader }),
    }),
    { name: "dashboard-settings" },
  ),
);
