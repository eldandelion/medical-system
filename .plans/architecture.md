# Architecture: Referral Details View Header Layout & DetailsPanel Refactoring

## 1. Overview & Objectives
Refine the `DetailsPanel` and `ReferralDetailsView` layout based on locked requirements:
1. **Subtitle Row Layout**:
   - In `DetailsPanel` top bar, underneath the Student Name, the subtitle is a horizontal flex container holding:
     - Student Number (`effectiveSubtitle`)
     - Pill-shaped Risk Factor Indicator (`effectiveBadge`) placed directly beside the Student Number in this subtitle row.
   - Remove the separate trailing badge column that was previously placed after the title/subtitle flex container.
   - FullScreenView mirrors the same compound subtitle row (`[Student Number] [Risk Factor Pill]`).
2. **Removal of Collapsible Header & Scroll-Collapse Mechanism**:
   - Remove `useScrollCollapse`, `CollapsibleHeader`, and scroll-based title-swapping (`setTitleOverride` on scroll).
   - In `ScrollableDetailsLayout`, tabs remain sticky (`sticky top-0 z-20`) and content scrolls beneath cleanly without scroll-collapse animations or title-swapping side effects.
3. **Parent Pages Subtitle Binding**:
   - Standardize the `subtitle` prop passed to `<DetailsPanel>` in the 5 parent pages (`DoctorPage.tsx`, `HeadCouncillorPage.tsx`, `TeacherPage.tsx`, `TrialAdminPage.tsx`, `AdminPage.tsx`).
   - For referrals and students, prioritize `selectedItem?.studentNumber || selectedItem?.studentId` over `selectedItem?.major`, preventing college from ever appearing in the header.

---

## 2. Component Design & Contracts

### 2.1. `DetailsPanel.tsx`
- **Header Layout Structure**:
```tsx
<div className="flex items-center justify-between px-4 py-3 shrink-0 gap-2 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-20">
  <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
    {effectiveAvatar ? (
      <div className="shrink-0 flex items-center justify-center">
        {effectiveAvatar}
      </div>
    ) : (
      <div className="flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined shrink-0" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
    )}
    <div className="flex flex-col min-w-0 truncate">
      <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] truncate leading-tight">
        {effectiveTitle}
      </span>
      {(effectiveSubtitle || effectiveBadge) && (
        <div className="flex items-center gap-2 min-w-0 mt-0.5">
          {effectiveSubtitle && (
            <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight font-mono">
              {effectiveSubtitle}
            </span>
          )}
          {effectiveBadge && (
            <div className="shrink-0 flex items-center">
              {effectiveBadge}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  <div className="flex items-center gap-0.5 shrink-0">
    <button onClick={() => onExpand ? onExpand() : setIsExpanded(true)} className="..." title="全屏" aria-label="全屏">
      <span className="material-symbols-outlined text-[20px]">open_in_full</span>
    </button>
    <button onClick={onClose} className="..." title="关闭" aria-label="关闭">
      <span className="material-symbols-outlined text-[20px]">close</span>
    </button>
  </div>
</div>
```
- **Remove Scroll Collapse**:
  - Delete `useScrollCollapse` and `CollapsibleHeader`.
  - Simplify `ScrollableDetailsLayout` to a clean container with sticky tabs:
```tsx
export function ScrollableDetailsLayout({
  header,
  tabs,
  footer,
  children,
  className = '',
}: ScrollableDetailsLayoutProps) {
  return (
    <div className={`flex flex-col h-full bg-[var(--md-sys-color-surface)] relative overflow-hidden ${className}`}>
      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden relative">
        {header && (
          <div className="p-6 pb-4 flex flex-col gap-5 shrink-0">
            {header}
          </div>
        )}
        {tabs && (
          <div className="sticky top-0 z-20 bg-[var(--md-sys-color-surface)]">
            {tabs}
          </div>
        )}
        <div className="flex-1 p-6 pb-8 min-h-[80vh]">
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
}
```

### 2.2. Parent Pages Subtitle Binding
In `DoctorPage.tsx`, `HeadCouncillorPage.tsx`, `TeacherPage.tsx`, `TrialAdminPage.tsx`:
```tsx
subtitle={
  selectedItem?.studentNumber ||
  (selectedItem?.studentId ? String(selectedItem.studentId) : '') ||
  (selectedItem?.employeeId ? selectedItem?.department : '') ||
  (selectedItem?.type ? REFERRAL_TYPE_LABELS[selectedItem.type] || selectedItem.type : '') ||
  selectedItem?.major ||
  selectedItem?.department ||
  ''
}
```
In `AdminPage.tsx`:
```tsx
subtitle={
  activePage === AdminTabs.USERS
    ? (selectedItem?.role === 'STUDENT'
        ? selectedItem?.employeeOrStudentId || selectedItem?.studentNumber || selectedItem?.studentId || ''
        : selectedItem?.email || selectedItem?.departmentOrCollege || '')
    : (activePage === AdminTabs.STUDENTS || activePage === AdminTabs.ASSESSMENTS)
    ? selectedItem?.studentNumber || selectedItem?.studentId || selectedItem?.major || ''
    : selectedItem?.studentNumber || selectedItem?.studentId || selectedItem?.studentName || ''
}
```

### 2.3. `ReferralDetailsView.tsx`
Ensure `headerOverride` registers:
- `avatar`: circular first-letter avatar
- `title`: `referral.studentName`
- `subtitle`: `studentNumber`
- `badge`: pill-shaped risk factor indicator (`RISK_LEVEL_STYLES[referral.riskLevel]`)
- Unmount cleanup: `setHeaderOverride?.(null)`
