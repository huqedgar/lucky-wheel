"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AppCommandMenu } from "./app-command-menu";

type AppSearchContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppSearchContext = createContext<AppSearchContextType | null>(null);

type AppSearchProviderProps = {
  children: React.ReactNode;
};

export function AppSearchProvider({ children }: AppSearchProviderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AppSearchContext value={{ open, setOpen }}>
      {children}
      <AppCommandMenu />
    </AppSearchContext>
  );
}

export const useAppSearch = () => {
  const ctx = useContext(AppSearchContext);
  if (!ctx) {
    throw new Error("useAppSearch must be used within AppSearchProvider");
  }
  return ctx;
};
