# Architecture Plan: Assessment Records Rework (`AssessmentHistoryTab.tsx`)

## 1. Context & Problem Statement
Currently, `AssessmentHistoryTab.tsx` displays student assessment assignments using a generic `<DataTable>` component with a hardcoded `minWidth="620px"`.
- **Slide-Over Panel Constraint**: This tab is hosted inside `StudentDetailsView.tsx`, which renders within a side slide-over drawer (typical viewport width: 400px–500px).
- **Usability Defect**: The table introduces horizontal overflow and scrolling, hiding critical columns (`status`, `assignedBy`, `assignedAt`, and the `撤销` revoke action) offscreen.
- **Visual Inconsistency**: The rest of `StudentDetailsView` (such as "基本特征", "学籍信息", "联系方式") utilizes Material Design 3 segmented capsule cards via `GroupedInfoList` / `getGroupedItemCornerRadius`.

## 2. Requirements & Design Specifications

### 2.1 Visual Hierarchy & Capsule Geometry
- Replace `DataTable` with an inset grouped capsule list adhering to Material Design 3 specifications.
- **Container**: `<div className="flex flex-col gap-[2px] w-full" role="list">`
- **Capsule Row Geometry** using `getGroupedItemCornerRadius(index, total)` imported from `../common/GroupedInfoList`.
- **Row Styling**:
  - Background: `bg-[var(--md-sys-color-surface-container-low)]`
  - Dimensions & Spacing: `px-4 py-3.5 flex items-center gap-3.5 min-h-[56px] w-full overflow-hidden`

### 2.2 Row Anatomy & Slot Layout
1. **Leading Slot (Icon)**: `material-symbols-outlined text-[22px] text-[var(--md-sys-color-on-surface-variant)]` with `assignment`.
2. **Main Content Slot (Title + Subtitle)**:
   - Primary Title: `getAssessmentDisplayName(item.batteryCode)` in `text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate`.
   - Subtitle: `${item.assignedByName} · ${new Date(item.assignedAt).toLocaleDateString()}` in `text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate font-normal`.
3. **Trailing Slot (Status Badge + Revoke Action)**:
   - Status Badge: `<StatusBadge dotColorClass={statusInfo.dotColor} label={statusInfo.label} />`
   - Revoke Button: Rendered when `item.status === 'PENDING' && session?.role !== 'student'`.

### 2.3 Pagination & Empty State
- Empty state displayed with `bg-[var(--md-sys-color-surface-container-low)] rounded-[20px]`.
- Pagination buttons preserved when `totalPages > 1`.
