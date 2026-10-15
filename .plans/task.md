# Implementation Plan: Global Search Enter Key Navigation & Details Opening Fix

## Overview
When searching in the frontend global search (`CommandPalette.tsx`), pressing Enter currently navigates to the generic tab (e.g., Students tab or Referral Management tab) without opening the specific detail view/drawer because `flatItems` places generic system actions ahead of remote entities, and actions invoke `navigateToTab` without an `entityId`. 

This implementation prioritizes remote search results (`students`, `referrals`, `assessments`) ahead of actions/navigations both in `flatItems` and visual JSX layout when a query is non-empty, fixes Enter key resolution to target the highlighted or first entry with its `entityId`, guarantees search input blur on selection, keeps focus on the input when pressing Enter with zero results, and adds comprehensive regression test coverage.

---

## Locked Requirements
1. **Selection on Enter**: If an entry in the dropdown is highlighted, open that entry; otherwise, default to opening the first (top) matching entry (`flatItems[0]`).
2. **Post-navigation State**: Close search dropdown (`closeSearch()`), blur search input (`inputRef.current?.blur()`), switch to relevant tab, and display the target entry's detail view/modal (passing `entityId` to `navigateToTab`).
3. **Zero Results Edge Case**: When Enter is pressed and there are 0 matching items, do nothing and keep focus on the search input (`inputRef.current?.focus()`).
4. **Data-first Priority**: When query is present (`query.trim().length > 0`), specific data entries (`students`, `referrals`, `assessments`) must precede actions and navigations in both `flatItems` array and visual JSX rendering.

---

## Writable Files
The execution is strictly limited to the following 4 files:
1. `frontend/src/components/search/CommandPalette.test.tsx` (Regression tests & assertion suite)
2. `frontend/src/components/search/CommandPalette.tsx` (Component implementation)
3. `frontend/src/config/searchActions.ts` (Action keyword refinement)
4. `.plans/task.md` (Implementation plan document)

---

## File-by-File Roadmap & Technical Specification

### 1. `frontend/src/components/search/CommandPalette.test.tsx`
- **Mock Setup Enhancements**:
  - Provide mock `navigateToTab` spy via custom wrapper or `useNavigation` spy to assert exact parameters `(tab, entityId)`.
  - Simulate remote query responses containing students, referrals, and assessments.
- **New Regression Test Cases (Red Phase)**:
  1. `Enter key on active query opens the first remote student record with entityId`:
     - Type query `"李四"`, return student entity with `id: 202`.
     - Press `Enter` on search input.
     - Assert `navigateToTab('Students', 202)` was called.
     - Assert palette is closed and input is blurred.
  2. `Enter key on active query opens remote referral record with entityId even when action keywords match`:
     - Type query `"转诊"`, return referral entity with `id: 'ref-999'`.
     - Even though `"转诊"` matches `action-create-referral` and `nav-referral-management`, remote referral entity must take precedence.
     - Press `Enter`.
     - Assert `navigateToTab('Referral Management', 'ref-999')` was called with `entityId: 'ref-999'`.
  3. `ArrowDown navigation highlights specific item and Enter key opens highlighted entity`:
     - Type query `"张"`, return 2 students: `id: 101` and `id: 102`.
     - Press `ArrowDown` once to highlight second student.
     - Press `Enter`.
     - Assert `navigateToTab('Students', 102)` is called.
  4. `Enter key with zero search results does nothing and maintains focus on search input`:
     - Type query `"NonExistentItem999"`, return empty results.
     - Press `Enter`.
     - Assert `navigateToTab` is NOT called, palette remains open, and `input` retains focus.
  5. `Visual DOM ordering renders data records above actions when query is present`:
     - Render palette with query `"测试"`.
     - Assert that DOM elements for student/referral results appear before "快捷操作" and "系统导航" headings.
     - When query is empty `""`, assert "快捷操作" appears at the top.
  6. `Search input blur is executed upon navigation`:
     - Focus input, type search query, press Enter on result.
     - Assert `inputRef.current?.blur()` took effect.

### 2. `frontend/src/components/search/CommandPalette.tsx`
- **Data-First `flatItems` Ordering**:
  ```tsx
  const hasQuery = query.trim().length > 0;

  const flatItems: FlatSearchItem[] = useMemo(() => {
    const items: FlatSearchItem[] = [];

    if (hasQuery) {
      // 1. Remote entity records take top priority when query exists
      searchResults?.students?.forEach((item) => items.push({ kind: 'student', item }));
      searchResults?.referrals?.forEach((item) => items.push({ kind: 'referral', item }));
      searchResults?.assessments?.forEach((item) => items.push({ kind: 'assessment', item }));

      // 2. Actions & Navigations follow
      matchedActions.forEach((item) => items.push({ kind: 'action', item }));
      matchedNavigations.forEach((item) => items.push({ kind: 'navigation', item }));
    } else {
      // Default empty query view: actions and navigations first
      matchedActions.forEach((item) => items.push({ kind: 'action', item }));
      matchedNavigations.forEach((item) => items.push({ kind: 'navigation', item }));
      searchResults?.students?.forEach((item) => items.push({ kind: 'student', item }));
      searchResults?.referrals?.forEach((item) => items.push({ kind: 'referral', item }));
      searchResults?.assessments?.forEach((item) => items.push({ kind: 'assessment', item }));
    }

    return items;
  }, [hasQuery, matchedActions, matchedNavigations, searchResults]);
  ```

- **Visual Rendering Re-ordering in JSX**:
  - Re-order sections within `listRef` based on `hasQuery`:
    - When `hasQuery` is true: Render Students -> Referrals -> Assessments -> Quick Actions -> System Navigation.
    - When `hasQuery` is false: Render Quick Actions -> System Navigation.
  - This ensures visual order matches `flatItems` index order 1:1, so `selectedIndex = 0` is visually highlighted at the very top.

- **Keyboard Navigation & Enter Key Handling**:
  - Replace `handleKeyDown` Enter branch:
    ```tsx
    if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems.length === 0) {
        inputRef.current?.focus();
        return;
      }
      const targetItem =
        selectedIndex >= 0 && selectedIndex < flatItems.length
          ? flatItems[selectedIndex]
          : flatItems[0];
      if (!targetItem) {
        inputRef.current?.focus();
        return;
      }
      handleSelectItem(targetItem);
    }
    ```
  - Only reset `selectedIndex` to 0 when `query` changes (`useEffect(() => setSelectedIndex(0), [query])`), avoiding wipes when asynchronous `searchResults` resolve.
  - Add bounding clamp: `if (flatItems.length > 0 && selectedIndex >= flatItems.length) setSelectedIndex(flatItems.length - 1)`.

- **Post-Navigation Input Blur & Selection Cleanup**:
  - In `handleSelectItem`:
    ```tsx
    const handleSelectItem = (item: FlatSearchItem) => {
      inputRef.current?.blur();
      closeSearch();
      switch (item.kind) {
        case 'action':
        case 'navigation':
          item.item.onSelect();
          break;
        case 'student':
          if (session.role === 'student') {
            navigateToTab('My Records', item.item.id);
          } else {
            navigateToTab('Students', item.item.id);
          }
          break;
        case 'referral':
          navigateToTab(session.role === 'student' ? 'My Records' : 'Referral Management', item.item.id);
          break;
        case 'assessment':
          navigateToTab('Assessments', item.item.id);
          break;
      }
    };
    ```
  - In `actionContext`:
    ```tsx
    closeSearch: () => {
      inputRef.current?.blur();
      closeSearch();
    }
    ```

### 3. `frontend/src/config/searchActions.ts`
- **Keyword Disambiguation**:
  - In `action-create-referral`: Replace broad keyword `'转诊'` with explicit action keywords: `['发起转诊', '新建转诊', '创建转诊', 'create referral']`.
  - Prevents action creation from preempting referral navigation or colliding with entity queries when users search for referral records.

---

## Precise Task Execution Order (TDD)

### Task 1: Failing Regression Tests in `CommandPalette.test.tsx` (Red Phase)
1. Add spy/mock for `navigateToTab` in `CommandPalette.test.tsx` to inspect `tab` and `entityId` arguments.
2. Add regression test 1: Type student query, press Enter, assert `navigateToTab('Students', entityId)` is called with student ID.
3. Add regression test 2: Type referral query `"转诊"`, press Enter, assert `navigateToTab('Referral Management', referralId)` is called with referral ID.
4. Add regression test 3: ArrowDown navigation highlights second item, Enter opens that specific highlighted entity ID.
5. Add regression test 4: Type query with 0 results, press Enter, assert `navigateToTab` is not called, palette stays open, input maintains focus.
6. Add regression test 5: Verify visual DOM ordering places student/referral results before actions when `query` is non-empty.
7. Run Vitest on `CommandPalette.test.tsx` and verify test failures (demonstrating current bug).

### Task 2: Implementation in `CommandPalette.tsx` and `searchActions.ts` (Green Phase)
1. In `searchActions.ts`, refine `action-create-referral` keywords to avoid bare `'转诊'` collision.
2. In `CommandPalette.tsx`:
   - Update `flatItems` `useMemo` to prioritize remote entities (`students`, `referrals`, `assessments`) when `hasQuery` is true.
   - Update JSX rendering in `CommandPalette.tsx` to display remote entity cards above actions/navigations when `hasQuery` is true.
   - Update `handleKeyDown` for `Enter`:
     - Retain focus and return early if `flatItems.length === 0`.
     - Select `flatItems[selectedIndex]` or fallback to `flatItems[0]`.
   - Update `handleSelectItem` and `actionContext` to invoke `inputRef.current?.blur()`.
   - Update `selectedIndex` effect: reset on `query` changes, clamp within bounds on `flatItems.length` change.
3. Re-run Vitest on `CommandPalette.test.tsx` and verify all tests pass green.

### Task 3: Verification & Static Analysis (Verification Phase)
1. Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
2. Run full frontend test suite (`npm run test`) to ensure zero regressions across pages (`TeacherPage`, `DoctorPage`, `GlobalSearchNavigation.test.tsx`).
3. Verify role-based matrix: Student role navigates to `'My Records'` with `entityId`, Teacher/Doctor/Admin navigate to `'Students'` / `'Referral Management'` with `entityId`.

---

## Testing Strategy
- **Unit Tests (`frontend/src/components/search/CommandPalette.test.tsx`)**:
  - Enter key selection on first matching remote record passing `entityId`.
  - Arrow navigation (`ArrowDown`, `ArrowUp`) + Enter key selection passing `entityId`.
  - Enter key on zero results keeping input focus without closing.
  - Search input blur on navigation.
  - Visual layout ordering with query present vs empty.
- **Integration Tests (`frontend/src/pages/GlobalSearchNavigation.test.tsx`)**:
  - Ensure host pages (`TeacherPage`, `DoctorPage`, `HeadCouncillorPage`) correctly receive the emitted `entityId` and open detail panels.

---

## Risks & Mitigations
- **Risk**: Asynchronous TanStack query arrival while user is pressing arrow keys could reset or shift `selectedIndex`.
  - **Mitigation**: Do not reset `selectedIndex` on `searchResults` changes; only reset on `query` text change. Clamp `selectedIndex` to `flatItems.length - 1` if `flatItems` shrinks.
- **Risk**: Role differences (Student navigates to "My Records" while Teacher/Doctor navigate to "Students" / "Referral Management").
  - **Mitigation**: `handleSelectItem` already branches by `session.role` and passes `item.item.id`; regression tests will explicitly assert this role-specific mapping.

---

## Success Criteria
- [ ] Pressing Enter after searching defaults to opening the top matching record with its `entityId`.
- [ ] Arrow navigation followed by Enter opens the highlighted record with its `entityId`.
- [ ] Detail view/modal opens automatically on the navigated tab for the target entity.
- [ ] Search input is blurred and dropdown is closed upon navigation.
- [ ] Pressing Enter with 0 results does nothing and preserves input focus.
- [ ] When query is non-empty, remote entity results appear above actions/navigations both logically (`flatItems`) and visually.
- [ ] All Vitest tests in `CommandPalette.test.tsx` pass.
- [ ] `tsc --noEmit` passes with 0 errors.
