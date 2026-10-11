# Implementation Plan: Consolidate '量表名称' and '分发时间' in DispatchHistoryTab

## Overview
Consolidate the standalone '量表名称' (Assessment Name) and '分发时间' (Dispatch Time) columns in `DispatchHistoryTab.tsx` into a single consolidated column labeled '量表名称', rendering the assessment name as the primary title and the localized dispatch time (`formatDateToChinese`) as the subtitle.

## Requirements
1. Remove the standalone '分发时间' table column definition from `DispatchHistoryTab.tsx`.
2. Update the '量表名称' column definition to render:
   - Primary line: `item.assessmentName || '未知'` (styled with `text-[14px] text-[var(--md-sys-color-on-surface)] font-medium`).
   - Subtitle line: `item.dispatchedAt ? formatDateToChinese(item.dispatchedAt) : '-'` (styled with `text-[12px] text-[var(--md-sys-color-on-surface-variant)] opacity-70`).
3. Adjust column width distribution to maintain responsive balance (`studentName`: `w-[30%]`, `assessmentName`: `w-[45%]`, `status`: `w-[20%]`).
4. Maintain full backwards compatibility with row selection (`getRowId`, `onSelect`), search filters, and chip dropdowns.
5. Provide comprehensive regression tests in `DispatchHistoryTab.test.tsx` verifying column headers and cell subtitle rendering.

## Architecture & Component Changes
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`:
  - Consolidate columns array: remove standalone `dispatchedAt` column.
  - Update `assessmentName` column renderer to a multi-line vertical stack (`<div className="flex flex-col">`).
  - Optimize table column widths.
- `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`:
  - Add regression tests checking table column headers: confirms '学生', '量表名称', '状态' exist, and '分发时间' column header does not exist.
  - Add subtitle rendering test: verifies assessment name and formatted Chinese date (`YYYY年M月D日`) are rendered.
  - Add fallback rendering test: verifies '未知' and '-' fallback handling when fields are missing or undefined.

## Writable Files
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`
