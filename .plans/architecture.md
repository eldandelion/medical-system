# Architecture: Student Details View Header Layout & DetailsPanel Delegation

## 1. Overview & Problem Statement
In "指派历史" (Dispatch / Assignment History in Assessment Catalog Management) and student directories across the system, clicking a student or assessment dispatch record opens `<DetailsPanel>` containing `<StudentDetailsView>`.
Previously, `<StudentDetailsView>` rendered a redundant inner header inside `ScrollableDetailsLayout` featuring:
- A 64px circular avatar placeholder.
- An `h1` displaying the student's name.
- A subtitle line showing student number, college/major, and a risk level chip.

This created a dual header (one in `DetailsPanel`'s top navigation bar, and one inside the scrollable content area). Furthermore, the risk factor indicator was trapped in the inner body rather than appearing beside the student number in the top header bar of `DetailsPanel`.

Following the modern header pattern established in `ReferralDetailsView` (commits `aa4705d` and `b870331`), `<StudentDetailsView>` will:
1. Eliminate the legacy inner header completely.
2. Delegate the top header presentation to `DetailsPanel` via `DetailsContext.setHeaderOverride`.
3. Provide the compact 32px circular initial avatar, student name title, student number subtitle, and the pill-shaped risk factor badge.
4. Clean up `setHeaderOverride` on unmount.
5. Pass `disableTitleOverride={true}` to `ScrollableDetailsLayout`.

---

## 2. Component Contract & Integration

### 2.1. `DetailsContext` Integration in `StudentDetailsView.tsx`
`StudentDetailsView` consumes `useDetails()` to extract `setHeaderOverride`:
```tsx
const { isFullScreen, setHeaderOverride } = useDetails();
```

In a `React.useEffect`, when `student` changes (handling both initial props and React Query fetched data), `setHeaderOverride` is called:
```tsx
const studentNumber = student.studentNumber || 'N/A';

React.useEffect(() => {
  if (setHeaderOverride) {
    setHeaderOverride({
      avatar: (
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0">
          {student.name ? student.name.charAt(0) : '?'}
        </div>
      ),
      title: student.name,
      subtitle: studentNumber,
      badge: (
        <div className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[student.riskLevel || 'LOW'] || ''}`}>
          <span>{RISK_LEVEL_LABELS[student.riskLevel || 'LOW'] || student.riskLevel || 'LOW'}</span>
        </div>
      ),
    });
  }
  return () => {
    setHeaderOverride?.(null);
  };
}, [setHeaderOverride, student.name, studentNumber, student.riskLevel]);
```

### 2.2. Inner Header Elimination in `ScrollableDetailsLayout`
Remove the `header={!hideHeader && !isFullScreen ? (...) : undefined}` prop from `<ScrollableDetailsLayout>`:
```tsx
return (
  <ScrollableDetailsLayout
    title={student.name}
    disableTitleOverride={true}
    className="min-w-[350px]"
    tabs={!isFullScreen ? (
      <SecondaryTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabType)}
      />
    ) : undefined}
    footer={...}
  >
    {/* Tab contents */}
  </ScrollableDetailsLayout>
);
```

### 2.3. Top Header Alignment in `DetailsPanel`
`DetailsPanel` already supports `effectiveAvatar`, `effectiveTitle`, `effectiveSubtitle`, and `effectiveBadge`:
- Top-left icon is replaced by the 32px circular avatar placeholder with student initial.
- Title displays `student.name`.
- Subtitle displays `student.studentNumber` alongside the pill-shaped `effectiveBadge` in the same subtitle flex row.
- College/major is eliminated from the top header entirely (it remains in the Overview tab under academic details).

---

## 3. Testing Strategy
Update `StudentDetailsView.test.tsx`:
1. Assert that `setHeaderOverride` is registered on mount with the expected avatar, title (`student.name`), subtitle (`student.studentNumber`), and risk badge.
2. Assert that `setHeaderOverride(null)` is called on component unmount.
3. Assert that the legacy inner header elements (e.g. inner 64px avatar, inner `h1` name element) are no longer rendered inside `StudentDetailsView`.
4. Ensure academic and contact information remain intact in the Overview tab.
