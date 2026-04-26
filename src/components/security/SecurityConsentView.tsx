import * as React from 'react';

export function SecurityConsentView() {
  return (
    <div className="flex-1 flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] pt-20">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">security</span>
        <p className="text-lg font-medium opacity-50">安全与知情同意设置将显示在此处。</p>
      </div>
    </div>
  );
}
