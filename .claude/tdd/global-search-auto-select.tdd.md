# TDD Evidence Report: Global Search Auto-Select

1. **Source plan**: /Users/daniel/.gemini/antigravity-cli/brain/f1da5a88-2a99-48f9-8346-6300030a242a/global-search-auto-select-plan.md
2. **User journeys**:
   - As a user, I want to select a student or referral from the global search palette, so that I can automatically see their details panel open on the relevant page.
3. **Task report**:
   - Updated all role pages (`TeacherPage`, `StudentPage`, `HeadCouncillorPage`, `DoctorPage`, `TrialAdminPage`, `AdminPage`) to intercept `lastEvent.entityId`.
   - Fetched the entity directly from the API when `entityId` is present.
   - Reset the panel active tab to `overview` and opened it by setting `selectedItem` / `selectedRecord`.
   - Validation command: `npx vitest run src/pages/GlobalSearchNavigation.test.tsx`
4. **Test specification**:

| # | What is guaranteed | Test file or command | Test type | Result | Evidence |
|---|--------------------|----------------------|-----------|--------|----------|
| 1 | Fetches entity and opens details panel when entityId is present in lastEvent | `src/pages/GlobalSearchNavigation.test.tsx` | unit | PASS | `npx vitest run src/pages/GlobalSearchNavigation.test.tsx` |

5. **Coverage and known gaps**: Tested in `GlobalSearchNavigation.test.tsx`. E2E tests would provide further coverage of the palette UI behavior. `useStudentBulkImport` had unrelated pre-existing failures in the test suite.
