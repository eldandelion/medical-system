# Architecture: Assessment Dispatch Record Details View Default Tab

## 1. Overview & Problem Statement
In `AssessmentCatalogManagementView` ("测评量表" -> "指派历史"), administrators review assessment dispatch records (`ParticipationRecordDto`). Clicking a record in the dispatch table triggers `onStudentSelect`, opening the `<StudentDetailsView>` inside `<DetailsPanel>`.
Previously, `AdminPage.tsx` hardcoded `setActiveTab('overview')`, forcing the panel to open on "临床概览" (overview). For assessment dispatch records, the primary administrative intent is to inspect the student's historical assessment submissions, status, and revoke options—which are located on the last tab: "档案记录" (`StudentDetailsTabs.HISTORY` = `'history'`).

This architectural update introduces context-aware tab defaults:
1. When opening student details from assessment dispatch history (`AdminTabs.ASSESSMENTS`), the details panel defaults directly to "档案记录" (`StudentDetailsTabs.HISTORY`).
2. Other student selection entry points (e.g. `AdminTabs.STUDENTS` "全校学生档案", `TeacherPage`, `HeadCouncillorPage`) continue to default to "临床概览" (`StudentDetailsTabs.OVERVIEW`).
3. `StudentDetailsView` supports an optional `defaultTab?: TabType` prop (defaulting to `StudentDetailsTabs.OVERVIEW`), providing clean uncontrolled fallback initialization while retaining controlled precedence when `activeTab` is provided.
4. Magic strings are completely eliminated by importing and using `StudentDetailsTabs` and `TabType`.

---

## 2. Component Architecture & Contracts

### 2.1. `StudentDetailsView.tsx`
- Add `defaultTab?: TabType` to `StudentDetailsViewProps`:
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
- In `StudentDetailsView`:
```typescript
export function StudentDetailsView({
  student: initialStudent,
  hideHeader,
  defaultTab = StudentDetailsTabs.OVERVIEW,
  activeTab: propsActiveTab,
  onTabChange,
  footer
}: StudentDetailsViewProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>(defaultTab);

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

### 2.2. `AdminPage.tsx`
- Import `StudentDetailsTabs` from `../components/students/StudentDetailsView`.
- In `AdminTabs.ASSESSMENTS`:
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
- In `AdminTabs.STUDENTS`:
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
- In `handlePageChange`:
```typescript
const handlePageChange = (page: AdminPageName) => {
  setActivePage(page);
  setSelectedItem(null);
  setActiveTab(page === AdminTabs.ASSESSMENTS ? StudentDetailsTabs.HISTORY : StudentDetailsTabs.OVERVIEW);
};
```
- In `<StudentDetailsView>` render block in `AdminPage.tsx`:
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

---

## 3. Testing Strategy
1. **`StudentDetailsView.test.tsx`**:
   - Verify uncontrolled mount with `defaultTab={StudentDetailsTabs.HISTORY}` renders the history tab (`测评记录`).
   - Verify uncontrolled mount without `defaultTab` defaults to `OVERVIEW` ("基本特征").
   - Verify controlled `activeTab={StudentDetailsTabs.OVERVIEW}` overrides `defaultTab={StudentDetailsTabs.HISTORY}`.
   - Verify tab change callback triggers properly.
2. **`AdminPage.test.tsx`** or integration tests:
   - Verify clicking dispatch record sets active tab to `history` (`档案记录`).
   - Verify selecting student in student directory sets active tab to `overview` (`临床概览`).
