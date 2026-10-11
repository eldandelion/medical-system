# Architecture & Analysis: Assessment Display Names, Status Color Alignment, and Recall Icon Button

## 1. Context & User Objectives
1. **Assessment Name Resolution in "指派历史" (`DispatchHistoryTab.tsx`)**:
   - In `DispatchHistoryTab.tsx`, the '量表名称' column previously rendered `item.assessmentName || '未知'`.
   - `item.assessmentName` contains the raw battery code/enum (e.g., `PHQ-9`, `PHQ_9`, `GAD-7`, `SLEEP_DISORDER`).
   - Fix: Resolve using `getAssessmentName(item.assessmentName)` with catalog title fallback to display the actual localized assessment name (e.g., `情绪状况评估 (PHQ-9)`).
2. **Status Color Alignment between Main List and Details Panel (`AssessmentHistoryTab.tsx`)**:
   - In `DispatchHistoryTab.tsx` (main list), `COMPLETED` is green (`bg-green-500`) and `PENDING` is orange (`bg-orange-500`).
   - In `AssessmentHistoryTab.tsx` (details panel), `COMPLETED` was purple (`bg-[var(--md-sys-color-primary-container)]`) and other statuses were pink/purple.
   - Fix: Align `AssessmentHistoryTab.tsx` status colors to:
     - `COMPLETED`: `bg-green-500`
     - `PENDING` / `IN_PROGRESS`: `bg-orange-500`
     - `EXPIRED`: `bg-red-500`
     - `REVOKED`: `bg-gray-400`
3. **Recall / Revoke Icon Button in 测评记录 (`AssessmentHistoryTab.tsx`)**:
   - Replace the text pill button (`撤销`) with an MD3 icon button featuring the `undo` backward curving arrow symbol.
   - When pending, show a small spinner or disabled state, and include accessible `title="撤销"` / `aria-label="撤销"`.

## 2. Component Design & Changes

### `DispatchHistoryTab.tsx`
- Import `getAssessmentName` from `../../constants/assessmentDictionary`.
- Fetch or access assessment catalog via `useAssessmentCatalogManagement` (or use `getAssessmentName` dictionary lookup directly).
- Render `getAssessmentName(item.assessmentName)` in the column title.

### `AssessmentHistoryTab.tsx`
- Update `getStatusDisplay`:
  ```tsx
  case 'COMPLETED': return { label: '已完成', dotColor: 'bg-green-500' };
  case 'PENDING': return { label: '待测评', dotColor: 'bg-orange-500' };
  case 'IN_PROGRESS': return { label: '进行中', dotColor: 'bg-orange-500' };
  case 'EXPIRED': return { label: '已过期', dotColor: 'bg-red-500' };
  case 'REVOKED': return { label: '已撤销', dotColor: 'bg-gray-400' };
  ```
- Replace text button with `undo` icon button:
  ```tsx
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handleRevoke(item.id);
    }}
    disabled={revokeMutation.isPending}
    title="撤销"
    aria-label="撤销"
    className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] hover:text-[var(--md-sys-color-on-error-container)] transition-colors disabled:opacity-50 cursor-pointer"
  >
    <span className="material-symbols-outlined text-[18px] leading-none select-none" aria-hidden="true">
      undo
    </span>
  </button>
  ```

## 3. Test Coverage Strategy
- Update `DispatchHistoryTab.test.tsx` to assert that `item.assessmentName` is resolved to localized names (e.g. `PHQ_9` -> `情绪状况评估 (PHQ-9)`).
- Update `AssessmentHistoryTab.test.tsx` to verify:
  - Status dot colors match green/orange/red/gray.
  - Revoke button is an icon button containing the `undo` icon and accessible `aria-label="撤销"`.
