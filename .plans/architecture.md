# Architecture: Referral Details View Header Layout Modernization

## 1. Overview & Objectives
Refactor the Referral Details View layout to move the student header information (circular avatar placeholder, student name, student number subtitle, pill-shaped risk indicator) into the very top header of `DetailsPanel` (side panel mode) and `FullScreenView` (expanded mode), on the same line as the expand and close action buttons.
- Eliminate the previous inner header in `ReferralDetailsView` (which had a large 64px avatar, student name, college, and risk factor inside `ScrollableDetailsLayout`).
- College is completely removed from the header.
- Student number becomes a subtitle directly below the student name (same color and font styling).
- Pill-shaped risk factor indicator is placed right after the title & subtitle block in the side panel header, and in the subtitle section in FullScreenView.
- The profile/description icon in the top left corner of the details view is replaced with the circular avatar placeholder.
- Other consumers of `DetailsPanel` (e.g. `StudentDetailsView`, `StaffDetailsView`, `UserDetailsView`) remain 100% backward-compatible.

---

## 2. Component Design & Contracts

### 2.1. `DetailsContext.tsx`
Add strongly-typed `DetailsHeaderOverride` and update `DetailsContextType`:
```typescript
export interface DetailsHeaderOverride {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface DetailsTabItem {
  id: string;
  label: string;
  icon: string;
}

export interface DetailsContextType {
  isFullScreen: boolean;
  titleOverride?: string | null;
  setTitleOverride?: (title: string | null) => void;
  tabsOverride?: DetailsTabItem[] | null;
  setTabsOverride?: (tabs: DetailsTabItem[] | null) => void;
  headerOverride?: DetailsHeaderOverride | null;
  setHeaderOverride?: (header: DetailsHeaderOverride | null) => void;
}
```

### 2.2. `DetailsPanel.tsx`
1. Manage `headerOverride` state in `DetailsPanel`:
   ```typescript
   const [headerOverride, setHeaderOverride] = React.useState<DetailsHeaderOverride | null>(null);
   ```
2. Derive effective slots:
   ```typescript
   const effectiveAvatar = headerOverride?.avatar ?? headerAvatar;
   const effectiveTitle = headerOverride?.title ?? (titleOverride || title);
   const effectiveSubtitle = headerOverride?.subtitle ?? subtitle;
   const effectiveBadge = headerOverride?.badge;
   ```
3. Top Header Bar Layout:
   ```tsx
   <div className="flex items-center justify-between px-4 py-3 shrink-0 gap-2 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-20">
     <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
       {/* Left Visual: Avatar or Default Icon */}
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

       {/* Title + Subtitle */}
       <div className="flex flex-col min-w-0 truncate">
         <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] truncate leading-tight">
           {effectiveTitle}
         </span>
         {effectiveSubtitle && (
           <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight mt-0.5">
             {effectiveSubtitle}
           </span>
         )}
       </div>

       {/* Trailing Badge: Risk Indicator */}
       {effectiveBadge && (
         <div className="shrink-0 flex items-center">
           {effectiveBadge}
         </div>
       )}
     </div>

     {/* Expand & Close Controls */}
     <div className="flex items-center gap-0.5 shrink-0">
       <button onClick={() => onExpand ? onExpand() : setIsExpanded(true)} className="...">
         <span className="material-symbols-outlined text-[20px]">open_in_full</span>
       </button>
       <button onClick={onClose} className="...">
         <span className="material-symbols-outlined text-[20px]">close</span>
       </button>
     </div>
   </div>
   ```

4. Pass resolved elements to `FullScreenView`:
   ```tsx
   <FullScreenView
     isOpen={isExpanded}
     onClose={() => setIsExpanded(false)}
     title={headerOverride?.title ? (typeof headerOverride.title === 'string' ? headerOverride.title : title) : title}
     subtitle={
       headerOverride ? (
         <div className="flex items-center gap-2">
           <span>{headerOverride.subtitle}</span>
           {headerOverride.badge}
         </div>
       ) : subtitle
     }
     avatar={effectiveAvatar}
     tabs={tabsOverride || tabs}
     activeTab={activeTab}
     onTabChange={onTabChange}
   >
     ...
   </FullScreenView>
   ```

5. In `ScrollableDetailsLayout`:
   Add `disableTitleOverride?: boolean` prop so scrolling does not overwrite `titleOverride` when the custom top header is active.

### 2.3. `FullScreenView.tsx`
Allow `subtitle?: React.ReactNode` so it can cleanly render the compound subtitle containing student number and risk pill.

### 2.4. `ReferralDetailsView.tsx`
1. Remove `header` prop from `ScrollableDetailsLayout` in both loading state and loaded state (`ReferralDetailsPresenter`).
2. Pass `disableTitleOverride={true}` to `ScrollableDetailsLayout`.
3. In `ReferralDetailsView` / `ReferralDetailsPresenter`, register `headerOverride` in `useEffect`:
   - Avatar: `w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium`
   - Title: `referral.studentName`
   - Subtitle: `studentNumber` (from `referral.studentNumber` or `referralDetails.studentDemographics?.studentId || 'N/A'`)
   - Badge: Risk indicator pill with `RISK_LEVEL_STYLES[referral.riskLevel]` and `RISK_LEVEL_LABELS[referral.riskLevel]`.
   - Cleanup on unmount (`setHeaderOverride(null)`).
