import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Lets a tab screen take the whole screen for a modal-ish mode.
 *
 * Bulk selection on Orders replaces the header with its own bar but used to
 * leave the tab bar and the raised Add button live underneath it: tapping
 * Products mid-selection silently threw the selection away, Add started a new
 * order from inside one, and the FAB overlapped the bulk action bar. A mode that
 * owns the header should own the footer too.
 */

type TabChromeValue = {
  tabBarHidden: boolean;
  /**
   * Hide or restore the tab bar. Callers should use {@link useHideTabBar}
   * instead, which restores the bar automatically when the screen unmounts.
   */
  setTabBarHidden: (hidden: boolean) => void;
};

const TabChromeContext = createContext<TabChromeValue | null>(null);

export function TabChromeProvider({ children }: { children: React.ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const value = useMemo(() => ({ tabBarHidden, setTabBarHidden }), [tabBarHidden]);
  return <TabChromeContext.Provider value={value}>{children}</TabChromeContext.Provider>;
}

export function useTabChrome(): TabChromeValue {
  // Detail screens outside the tab group have no tab bar to hide, so the hook is
  // a no-op there rather than an error.
  return useContext(TabChromeContext) ?? { tabBarHidden: false, setTabBarHidden: () => {} };
}

/**
 * Hides the tab bar for as long as `hidden` is true, and puts it back if the
 * screen goes away while still in that mode.
 */
export function useHideTabBar(hidden: boolean) {
  const { setTabBarHidden } = useTabChrome();
  useEffect(() => {
    setTabBarHidden(hidden);
    return () => setTabBarHidden(false);
  }, [hidden, setTabBarHidden]);
}
