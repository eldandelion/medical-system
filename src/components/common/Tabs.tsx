import * as React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface PrimaryTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

/**
 * Material Design 3 Primary Tabs component.
 * Uses @material/web components for native MD3 behavior.
 */
export function PrimaryTabs({ tabs, activeTab, onTabChange, className = "" }: PrimaryTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className={`sticky top-0 z-20 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 shrink-0 ${className}`}>
      <md-tabs 
        active-index={activeIndex >= 0 ? activeIndex : 0}
        onchange={(e: any) => {
          const index = e.target.activeTabIndex;
          if (index !== undefined && tabs[index]) {
            onTabChange(tabs[index].id);
          }
        }}
      >
        {tabs.map((tab) => (
          <md-primary-tab key={tab.id}>
            {tab.icon && <md-icon slot="icon">{tab.icon}</md-icon>}
            {tab.label}
          </md-primary-tab>
        ))}
      </md-tabs>
    </div>
  );
}
