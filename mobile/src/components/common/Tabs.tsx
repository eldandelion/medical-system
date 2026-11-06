import * as React from 'react';

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
  fitContent?: boolean;
  hideBorder?: boolean;
}

/**
 * Material Design 3 Secondary Tabs component.
 * Used for sub-section navigation within a content area (e.g. details panels).
 * Uses @material/web components for native MD3 behavior.
 */
export function SecondaryTabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  fitContent = false,
  hideBorder = false,
}: TabsProps) {
  const tabsRef = React.useRef<any>(null);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  React.useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.activeTabIndex = activeIndex >= 0 ? activeIndex : 0;
    }
  }, [activeIndex]);

  const borderClass = hideBorder
    ? ''
    : 'border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30';

  return (
    <div
      className={`sticky top-0 z-20 bg-[var(--md-sys-color-surface)] ${borderClass} shrink-0 details-tabs-list ${className}`}
    >
      <md-tabs
        ref={tabsRef}
        className={fitContent ? 'w-fit' : ''}
        style={fitContent ? { width: 'fit-content' } : undefined}
        onchange={(e: any) => {
          const index = e.target.activeTabIndex;
          if (index !== undefined && tabs[index]) {
            onTabChange(tabs[index].id);
          }
        }}
      >
        {tabs.map((tab, idx) => (
          <md-secondary-tab
            key={tab.id}
            active={idx === activeIndex ? true : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <md-icon slot="icon">{tab.icon}</md-icon>}
            {tab.label}
          </md-secondary-tab>
        ))}
      </md-tabs>
    </div>
  );
}

export const PrimaryTabs = SecondaryTabs;
