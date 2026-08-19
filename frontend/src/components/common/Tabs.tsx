import * as React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * Material Design 3 Secondary Tabs component.
 * Used for sub-section navigation within a content area (e.g. details panels).
 * Per M3 spec, secondary tabs are correct here — primary tabs are reserved for
 * top-level page navigation.
 * Uses @material/web components for native MD3 behavior.
 */
export function SecondaryTabs({ tabs, activeTab, onTabChange, className = "" }: TabsProps) {
  const tabsRef = React.useRef<any>(null);
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  React.useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.activeTabIndex = activeIndex >= 0 ? activeIndex : 0;
    }
  }, [activeIndex]);

  return (
    <div className={`sticky top-0 z-20 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 shrink-0 ${LAYOUT_CONSTANTS.TABS_LIST_CLASS} ${className}`}>
      {/* @ts-ignore */}
      <md-tabs
        ref={tabsRef}
        onchange={(e: any) => {
          const index = e.target.activeTabIndex;
          if (index !== undefined && tabs[index]) {
            onTabChange(tabs[index].id);
          }
        }}
      >
        {tabs.map((tab, idx) => (
          /* @ts-ignore */
          <md-secondary-tab key={tab.id} active={idx === activeIndex ? true : undefined}>
            {/* @ts-ignore */}
            {tab.icon && <md-icon slot="icon">{tab.icon}</md-icon>}
            {tab.label}
          {/* @ts-ignore */}
          </md-secondary-tab>
        ))}
      {/* @ts-ignore */}
      </md-tabs>
    </div>
  );
}

/** @deprecated Use SecondaryTabs instead. */
export const PrimaryTabs = SecondaryTabs;
