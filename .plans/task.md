# Implementation Plan: Assessment Dispatch Record Details View Default Tab

## Overview
When opening student details from the assessment dispatch record history in `AdminTabs.ASSESSMENTS` ("测评量表" -> "指派历史"), the primary administrative intent is to inspect the student's historical assessments, participation status, and revoke actions. This implementation updates `<StudentDetailsView>` to support an optional `defaultTab?: TabType` prop with uncontrolled dynamic syncing, and updates `AdminPage.tsx` so clicking a dispatch record defaults to the "档案记录" tab (`StudentDetailsTabs.HISTORY`), while student selection from the directory (`AdminTabs.STUDENTS`) continues to default to "临床概览" (`StudentDetailsTabs.OVERVIEW`).

---

## Requirements
1. **StudentDetailsView Contract**:
   - Add `defaultTab?: TabType` to `StudentDetailsViewProps` (typed using `TabType = typeof StudentDetailsTabs[keyof typeof StudentDetailsTabs]`).
   - Initialize `internalActiveTab` state with `defaultTab || StudentDetailsTabs.OVERVIEW`.
   - Include a `React.useEffect` hook that synchronizes `internalActiveTab` when `defaultTab` changes while in uncontrolled mode (`!propsActiveTab`).
   - Retain controlled precedence when `activeTab` is supplied.
2. **AdminPage Integration**:
   - Import `StudentDetailsTabs` from `../components/students/StudentDetailsView`.
   - In `AdminTabs.ASSESSMENTS`, update `onStudentSelect` to invoke `setActiveTab(StudentDetailsTabs.HISTORY)`.
   - In `AdminTabs.STUDENTS`, ensure `onStudentSelect` invokes `setActiveTab(StudentDetailsTabs.OVERVIEW)`.
   - In `handlePageChange`, reset `activeTab` to `page === AdminTabs.ASSESSMENTS ? StudentDetailsTabs.HISTORY : StudentDetailsTabs.OVERVIEW`.
   - Pass `defaultTab={activePage === AdminTabs.ASSESSMENTS ? StudentDetailsTabs.HISTORY : StudentDetailsTabs.OVERVIEW}` to `<StudentDetailsView>`.
   - Replace any lingering magic strings `'overview'` with `StudentDetailsTabs.OVERVIEW`.
3. **Testing Requirements**:
   - `StudentDetailsView.test.tsx`:
     - Test uncontrolled initialization with `defaultTab={StudentDetailsTabs.HISTORY}` rendering "测评记录".
     - Test fallback to `StudentDetailsTabs.OVERVIEW` when `defaultTab` is omitted.
     - Test that controlled `activeTab` prop overrides `defaultTab`.
     - Test dynamic sync of `internalActiveTab` when `defaultTab` prop changes in uncontrolled mode.
   - `AdminPage.test.tsx`:
     - Test that clicking an assessment dispatch record in `AssessmentCatalogManagementView` sets the details panel active tab to `StudentDetailsTabs.HISTORY` (`'history'`).
     - Test that clicking a student in `StudentsView` sets the details panel active tab to `StudentDetailsTabs.OVERVIEW` (`'overview'`).
     - Test that switching tabs via `handlePageChange` resets active tab appropriately.
4. **Zero Magic Strings & Strict Typing**:
   - Strictly use `StudentDetailsTabs` and `TabType`.
   - Strictly zero `any` on API responses and types.

---

## Writable Files
The execution is strictly limited to the following 4 files:
1. `frontend/src/components/students/StudentDetailsView.tsx`
2. `frontend/src/pages/AdminPage.tsx`
3. `frontend/src/components/students/StudentDetailsView.test.tsx`
4. `frontend/src/pages/AdminPage.test.tsx`

---

## File-by-File Roadmap & Technical Specification

### 1. `frontend/src/components/students/StudentDetailsView.tsx`
- **Props Interface**:
  Update `StudentDetailsViewProps` to include `defaultTab?: TabType`:
  ```typescript
  export interface StudentDetailsViewProps {
    student: Student;
    hideHeader?: boolean;
    defaultTab?: TabType;                 // Defaults to StudentDetailsTabs.OVERVIEW
    activeTab?: string;                   // Controlled mode override
    onTabChange?: (tabId: string) => void;
    footer?: React.ReactNode;
  }
  ```
- **State Initialization & Uncontrolled Sync**:
  ```typescript
  export function StudentDetailsView({
    student: initialStudent,
    hideHeader,
    defaultTab = StudentDetailsTabs.OVERVIEW,
    activeTab: propsActiveTab,
    onTabChange,
    footer
  }: StudentDetailsViewProps) {
    const { session } = useAuth();
    const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>(defaultTab || StudentDetailsTabs.OVERVIEW);

    // Sync uncontrolled tab if defaultTab changes dynamically
    React.useEffect(() => {
      if (defaultTab && !propsActiveTab) {
        setInternalActiveTab(defaultTab);
      }
    }, [defaultTab, propsActiveTab]);

    const activeTab = (propsActiveTab || internalActiveTab) as TabType;

    const setActiveTab = (tab: TabType) => {
      setInternalActiveTab(tab);
      onTabChange?.(tab);
    };
    ...
  ```

### 2. `frontend/src/pages/AdminPage.tsx`
- **Imports**:
  Import `StudentDetailsTabs` from `../components/students/StudentDetailsView`:
  ```typescript
  import { StudentDetailsView, STUDENT_DETAILS_TABS, StudentDetailsTabs } from '../components/students/StudentDetailsView';
  ```
- **State Initialization**:
  Replace magic string `'overview'` with `StudentDetailsTabs.OVERVIEW`:
  ```typescript
  const [activeTab, setActiveTab] = React.useState<string>(StudentDetailsTabs.OVERVIEW);
  ```
- **Page Change Handler**:
  ```typescript
  const handlePageChange = (page: AdminPageName) => {
    setActivePage(page);
    setSelectedItem(null);
    setActiveTab(page === AdminTabs.ASSESSMENTS ? StudentDetailsTabs.HISTORY : StudentDetailsTabs.OVERVIEW);
  };
  ```
- **Navigation Hook Effect**:
  Replace `setActiveTab('overview')` with `setActiveTab(StudentDetailsTabs.OVERVIEW)`.
- **AdminTabs.ASSESSMENTS**:
  ```typescript
  case AdminTabs.ASSESSMENTS:
    return (
      <>
        <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
        <AssessmentCatalogManagementView 
          onStudentSelect={(student) => {
            setSelectedItem(student);
            setActiveTab(StudentDetailsTabs.HISTORY);
          }}
          selectedStudentId={selectedItem?.id}
        />
      </>
    );
  ```
- **AdminTabs.STUDENTS**:
  ```typescript
  case AdminTabs.STUDENTS:
    return (
      <>
        <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
        <StudentsView
          resetToken={lastEvent?.timestamp}
          onStudentSelect={(stu) => {
            setSelectedItem(stu);
            setActiveTab(StudentDetailsTabs.OVERVIEW);
          }}
          selectedStudentId={selectedItem?.id}
        />
      </>
    );
  ```
- **StudentDetailsView Render Block**:
  ```typescript
  {(activePage === AdminTabs.STUDENTS || activePage === AdminTabs.ASSESSMENTS) && (
    <StudentDetailsView
      student={selectedItem}
      defaultTab={activePage === AdminTabs.ASSESSMENTS ? StudentDetailsTabs.HISTORY : StudentDetailsTabs.OVERVIEW}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )}
  ```

### 3. `frontend/src/components/students/StudentDetailsView.test.tsx`
- **Import Verification**:
  Ensure `StudentDetailsTabs` is imported alongside `StudentDetailsView`.
- **Add Tests**:
  1. `renders history tab when initialized in uncontrolled mode with defaultTab={StudentDetailsTabs.HISTORY}`:
     - Render `<StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.HISTORY} />`.
     - Assert `screen.getByText('测评记录')` is present in DOM.
     - Assert `screen.queryByText('基本特征')` is null (since Overview tab is inactive).
  2. `falls back to StudentDetailsTabs.OVERVIEW when defaultTab is omitted in uncontrolled mode`:
     - Render `<StudentDetailsView student={mockStudent} />`.
     - Assert `screen.getByText('基本特征')` is present.
     - Assert `screen.queryByText('测评记录')` is null.
  3. `honors controlled activeTab prop even when defaultTab is provided`:
     - Render `<StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.HISTORY} activeTab={StudentDetailsTabs.OVERVIEW} />`.
     - Assert `screen.getByText('基本特征')` is present.
     - Assert `screen.queryByText('测评记录')` is null.
  4. `synchronizes internal active tab when defaultTab prop updates in uncontrolled mode`:
     - Render `<StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.OVERVIEW} />`.
     - Assert `screen.getByText('基本特征')` is present.
     - Rerender with `<StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.HISTORY} />`.
     - Assert `screen.getByText('测评记录')` is present.

### 4. `frontend/src/pages/AdminPage.test.tsx`
- **Test Scenarios**:
  1. `clicking dispatch record in AssessmentCatalogManagementView sets active tab to history`:
     - Render `<AdminPage />`.
     - Switch to "测评量表" (`AdminTabs.ASSESSMENTS`).
     - Click dispatch record.
     - Assert that `DetailsPanel` opens with `activeTab === StudentDetailsTabs.HISTORY`.
  2. `clicking student in student directory sets active tab to overview`:
     - Switch to "全校学生" (`AdminTabs.STUDENTS`).
     - Click student row in `StudentsView`.
     - Assert that `DetailsPanel` opens with `activeTab === StudentDetailsTabs.OVERVIEW`.
  3. `navigating between pages resets selected item and sets default tab`:
     - Select dispatch record in `AdminTabs.ASSESSMENTS` (tab becomes `history`).
     - Switch page to "全校学生", verify `selectedItem` is cleared and `activeTab` defaults back to `overview`.

---

## Precise Task Execution Order (TDD)

### Phase 1: Test Suite Preparation (Red Phase)
1. **Extend `StudentDetailsView.test.tsx`**:
   - Add unit tests for `defaultTab={StudentDetailsTabs.HISTORY}`, omitted `defaultTab` fallback to `OVERVIEW`, controlled `activeTab` precedence, and uncontrolled `defaultTab` prop change synchronization.
2. **Create `AdminPage.test.tsx`**:
   - Write integration tests for AdminPage tab orchestration.
3. **Execute Vitest (Red State)**:
   - Run Vitest for both files to confirm failures before implementation.

### Phase 2: Implementation (Green Phase)
4. **Implement `StudentDetailsView.tsx`**:
   - Add `defaultTab?: TabType` to `StudentDetailsViewProps`.
   - Initialize `internalActiveTab` with `defaultTab || StudentDetailsTabs.OVERVIEW`.
   - Add `React.useEffect` to sync `defaultTab` changes when uncontrolled.
5. **Implement `AdminPage.tsx`**:
   - Import `StudentDetailsTabs`.
   - In `AdminTabs.ASSESSMENTS` `onStudentSelect`, call `setActiveTab(StudentDetailsTabs.HISTORY)`.
   - In `AdminTabs.STUDENTS` `onStudentSelect`, call `setActiveTab(StudentDetailsTabs.OVERVIEW)`.
   - In `handlePageChange`, set `activeTab` to `page === AdminTabs.ASSESSMENTS ? StudentDetailsTabs.HISTORY : StudentDetailsTabs.OVERVIEW`.
   - Pass `defaultTab` to `<StudentDetailsView>`.
   - Replace magic strings with `StudentDetailsTabs.OVERVIEW`.
6. **Verify Vitest (Green State)**:
   - Run `npx vitest run StudentDetailsView.test.tsx AdminPage.test.tsx` and verify 100% pass.

### Phase 3: Integration & Static Analysis Verification
7. **Type Check**:
   - Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
8. **Full Suite Regression**:
   - Run `npm run test -- run` to guarantee no regressions across all components.

---

## Testing Strategy
- **Unit Tests**:
  - `frontend/src/components/students/StudentDetailsView.test.tsx`:
    - `defaultTab` initialization (history vs overview).
    - Uncontrolled fallback default.
    - Controlled `activeTab` prop priority over `defaultTab`.
    - Dynamic `defaultTab` update sync.
- **Integration Tests**:
  - `frontend/src/pages/AdminPage.test.tsx`:
    - Dispatch record selection flow in `AdminTabs.ASSESSMENTS` navigating directly to `history` tab.
    - Student directory selection flow in `AdminTabs.STUDENTS` navigating to `overview` tab.
    - Page change tab reset behavior.

---

## Risks & Mitigations
- **Risk**: In controlled mode, `AdminPage` controls `activeTab`, but if child component maintains internal tab state out of sync, tab switching in `DetailsPanel` vs `SecondaryTabs` could conflict.
  - **Mitigation**: `StudentDetailsView` derives `activeTab = (propsActiveTab || internalActiveTab) as TabType`, ensuring controlled mode from `AdminPage` strictly takes precedence, and `onTabChange` notifies `AdminPage` to update parent state.
- **Risk**: Switching between student directory and assessments leaves previous `selectedItem` or tab state.
  - **Mitigation**: `handlePageChange` in `AdminPage.tsx` explicitly calls `setSelectedItem(null)` and sets `setActiveTab` according to the target page.

---

## Success Criteria
- [ ] `StudentDetailsViewProps` includes `defaultTab?: TabType`.
- [ ] Uncontrolled `StudentDetailsView` mounts on `StudentDetailsTabs.HISTORY` when `defaultTab={StudentDetailsTabs.HISTORY}` is provided.
- [ ] Uncontrolled `StudentDetailsView` defaults to `StudentDetailsTabs.OVERVIEW` when `defaultTab` is omitted.
- [ ] Controlled `activeTab` overrides `defaultTab` in `StudentDetailsView`.
- [ ] Clicking a dispatch record in `AssessmentCatalogManagementView` opens `StudentDetailsView` on `history` tab.
- [ ] Clicking a student in `StudentsView` opens `StudentDetailsView` on `overview` tab.
- [ ] `StudentDetailsView.test.tsx` and `AdminPage.test.tsx` pass without errors.
- [ ] `npm run lint` (`tsc --noEmit`) completes with 0 errors.
