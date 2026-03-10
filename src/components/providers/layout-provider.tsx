"use client";

import * as React from "react";

type Layout = "fixed" | "full";

interface LayoutProviderProps {
  children: React.ReactNode;
  defaultLayout?: Layout;
  forcedLayout?: Layout;
  storageKey?: string;
  attribute?: string | string[];
  value?: Record<string, string>;
}

interface LayoutProviderState {
  layout: Layout;
  setLayout: (layout: Layout | ((prev: Layout) => Layout)) => void;
  forcedLayout?: Layout;
}

const isServer = typeof window === "undefined";
const LayoutContext = React.createContext<LayoutProviderState | undefined>(undefined);

const saveToLS = (storageKey: string, value: string) => {
  try {
    localStorage.setItem(storageKey, value);
  } catch {}
};

const useLayout = () => {
  const context = React.useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

/**
 * Inline script chạy trước hydration — đọc localStorage và apply class lên <html>
 * để tránh flash layout sai (giống cách next-themes xử lý dark mode).
 */
const LayoutScript = React.memo(function LayoutScript({
  storageKey,
  defaultLayout,
  forcedLayout,
  attribute,
  value,
}: {
  storageKey: string;
  defaultLayout: Layout;
  forcedLayout?: Layout;
  attribute: string | string[];
  value?: Record<string, string>;
}) {
  const scriptArgs = JSON.stringify([storageKey, defaultLayout, forcedLayout, attribute, value]);

  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var a=${scriptArgs},sk=a[0],dl=a[1],fl=a[2],at=a[3],vm=a[4];var l=fl;if(!l){try{var s=localStorage.getItem(sk);l=(s==="fixed"||s==="full")?s:dl}catch(e){l=dl}}var n=vm?vm[l]:"layout-"+l;var d=document.documentElement;var attrs=Array.isArray(at)?at:[at];var all=vm?Object.values(vm):["layout-fixed","layout-full"];attrs.forEach(function(attr){if(attr==="class"){d.classList.remove.apply(d.classList,all);if(n)d.classList.add(n)}else if(attr.indexOf("data-")===0){if(n)d.setAttribute(attr,n);else d.removeAttribute(attr)}})}catch(e){}})()`,
      }}
    />
  );
});

const Layout = ({
  forcedLayout,
  storageKey = "layout",
  defaultLayout = "full",
  attribute = "class",
  value,
  children,
}: LayoutProviderProps) => {
  const [layout, setLayoutState] = React.useState<Layout>(() => {
    if (isServer) return defaultLayout;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "fixed" || saved === "full") {
        return saved;
      }
      return defaultLayout;
    } catch {
      return defaultLayout;
    }
  });

  const attrs = React.useMemo(
    () => (!value ? ["layout-fixed", "layout-full"] : Object.values(value)),
    [value],
  );

  const applyLayout = React.useCallback(
    (layout: Layout) => {
      if (!layout) return;

      const name = value ? value[layout] : `layout-${layout}`;
      const d = document.documentElement;

      const handleAttribute = (attr: string) => {
        if (attr === "class") {
          d.classList.remove(...attrs);
          if (name) d.classList.add(name);
        } else if (attr.startsWith("data-")) {
          if (name) {
            d.setAttribute(attr, name);
          } else {
            d.removeAttribute(attr);
          }
        }
      };

      if (Array.isArray(attribute)) attribute.forEach(handleAttribute);
      else handleAttribute(attribute);
    },
    [attrs, attribute, value],
  );

  const setLayout = React.useCallback(
    (value: Layout | ((prev: Layout) => Layout)) => {
      if (typeof value === "function") {
        setLayoutState((prevLayout) => {
          const newLayout = value(prevLayout);
          saveToLS(storageKey, newLayout);
          return newLayout;
        });
      } else {
        setLayoutState(value);
        saveToLS(storageKey, value);
      }
    },
    [storageKey],
  );

  // localStorage event handling
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;

      if (!e.newValue) {
        setLayout(defaultLayout);
      } else if (e.newValue === "fixed" || e.newValue === "full") {
        setLayoutState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [setLayout, storageKey, defaultLayout]);

  // Apply layout khi state thay đổi (sau lần mount đầu, script đã xử lý)
  React.useEffect(() => {
    const currentLayout = forcedLayout ?? layout;
    applyLayout(currentLayout);
  }, [forcedLayout, layout, applyLayout]);

  const providerValue = React.useMemo(
    () => ({
      layout,
      setLayout,
      forcedLayout,
    }),
    [layout, setLayout, forcedLayout],
  );

  return (
    <LayoutContext.Provider value={providerValue}>
      <LayoutScript
        storageKey={storageKey}
        defaultLayout={defaultLayout}
        forcedLayout={forcedLayout}
        attribute={attribute}
        value={value}
      />
      {children}
    </LayoutContext.Provider>
  );
};

const LayoutProvider = (props: LayoutProviderProps) => {
  const context = React.useContext(LayoutContext);

  // Ignore nested context providers, just passthrough children
  if (context) return <>{props.children}</>;
  return <Layout {...props} />;
};

export { useLayout, LayoutProvider };
