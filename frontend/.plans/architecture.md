# Architecture Plan: Assessment History Tab UI Fixes

## Overview
The goal is to fix UI bugs in the Assessment History tab, specifically addressing row selection state bubbling, adding a combined Assessment/Time column, localizing the status column, and removing hardcoded row background colors.

## 1. Backend Changes (Prerequisite for Requirement 2)
To display the Assessment Name and Dispatch Time when fetching records (especially when viewing 'ALL' dispatches), the `ParticipationRecordDto` needs to carry this information.

**File:** `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDispatchHistoryDtos.kt`
- Add `val assessmentName: String?` and `val dispatchedAt: LocalDateTime?` to `ParticipationRecordDto`.

**File:** `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentDispatchService.kt`
- Update the `getParticipationRecords` method to map `assignment.batteryCode.value` to `assessmentName` and `assignment.assignedAt` to `dispatchedAt`.

## 2. Frontend Type Definitions
**File:** `frontend/src/types/index.ts`
- Update `ParticipationRecordDto` to include:
  ```typescript
  assessmentName?: string;
  dispatchedAt?: string;
  ```

## 3. UI Component Modifications

### A. Bubble Row Selection State
**File:** `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- **Changes:**
  - Define `interface DispatchHistoryTabProps { onRowClick?: (student: Student) => void; }`.
  - Remove `selectedStudent` state and the nested `<DetailsPanel>` component.
  - Update `<DataTable onRowClick={(row) => ...}>` to construct the student object and call `onRowClick(student)`.

**File:** `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
- **Changes:**
  - Define `interface AssessmentCatalogManagementViewProps { onStudentSelect?: (student: any) => void; }`.
  - Pass the `onStudentSelect` prop down to `<DispatchHistoryTab onRowClick={onStudentSelect} />`.

**File:** `frontend/src/pages/AdminPage.tsx`
- **Changes:**
  - Pass `onStudentSelect={(stu) => setSelectedItem(stu)}` to `<AssessmentCatalogManagementView />`.
  - Update `getTabsForPage()` so that `case AdminTabs.ASSESSMENTS:` returns `STUDENT_DETAILS_TABS` if a student is selected.
  - Update the `MainContent`'s `sidePanel` to correctly configure the `<DetailsPanel>` title, subtitle, icon, and content for `activePage === AdminTabs.ASSESSMENTS`, rendering `<StudentDetailsView>`.

### B. Add Combined Column for Assessment Name & Time
**File:** `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- **Changes:**
  - Add a new column definition directly after "姓名":
    ```tsx
    {
      key: 'assessmentInfo',
      label: '量表与指派时间',
      width: 'w-[25%]',
      render: (item) => (
        <div className="flex flex-col py-1">
          <span className="font-semibold text-[14px] text-[var(--md-sys-color-on-surface)]">
            {item.assessmentName || '未知量表'}
          </span>
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-80 mt-0.5">
            {item.dispatchedAt ? new Date(item.dispatchedAt).toLocaleDateString() : '-'}
          </span>
        </div>
      )
    }
    ```

### C. Localize Status and Remove Hardcoded Row Background
**File:** `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- **Changes:**
  - Import `<StatusBadge>` and localization constants:
    ```typescript
    import { StatusBadge } from '../common/StatusBadge';
    import { STATUS_LABELS, STATUS_DOT_STYLES, RISK_LEVEL_LABELS, RISK_LEVEL_DOT_STYLES } from '../../config/styleConstants';
    ```
  - **Requirement 3:** Update `status` column render:
    ```tsx
    { 
      key: 'status', 
      label: '状态', 
      render: (item) => (
        <StatusBadge
          dotColorClass={STATUS_DOT_STYLES[item.status] || STATUS_DOT_STYLES.default}
          label={STATUS_LABELS[item.status] || item.status}
        />
      )
    }
    ```
  - **Requirement 4:** Remove `bg-red-100` classes and update `severity` column render to match the global referral table pattern:
    ```tsx
    { 
      key: 'severity', 
      label: '预警等级', 
      render: (item) => (
        <StatusBadge
          dotColorClass={RISK_LEVEL_DOT_STYLES[item.severity] || RISK_LEVEL_DOT_STYLES.LOW}
          label={RISK_LEVEL_LABELS[item.severity] || item.severity}
        />
      ) 
    }
    ```
