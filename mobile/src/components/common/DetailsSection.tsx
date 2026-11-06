import * as React from 'react';

export function DetailsSection({
  title,
  children,
  icon,
  className = '',
}: {
  title?: string;
  children: React.ReactNode;
  icon?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 pt-0 mt-6 first:border-0 first:pt-0 first:mt-0 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3">
          {icon && (
            <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">
              {icon}
            </span>
          )}
          <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)]">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}
