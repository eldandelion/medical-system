# Code Review: Global Search Filter Reset

## Review Summary
The PR implements a mechanism to clear local filters in list views (`StudentsView`, `ReferralManagementView`, `StaffManagementView`) when a user navigates via global search. While the intent is correct, the implementation uses a React anti-pattern (syncing state in a `useEffect` via a `resetToken` prop) instead of utilizing React's built-in `key` remounting behavior. Additionally, a critical missing `session.token` in `queryKey` was spotted in one of the modified files.

---

### [HIGH] Initializing/Resetting state from a prop without `key`
**Files:** 
- `frontend/src/components/students/StudentsView.tsx:28`
- `frontend/src/components/records/ReferralManagementView.tsx:130`
- `frontend/src/components/staff/StaffManagementView.tsx:19`

**Issue:** 
The components use `useEffect` to reset internal states (`searchQuery`, `activeFilters`) when the `resetToken` prop changes.

**Why:** 
According to React best practices and the project's hook rules, synchronizing a component's internal state with a prop via `useEffect` is an anti-pattern (Effect for derived/reset state). It leads to unnecessary waterfall re-renders (component renders with old state, effect runs, sets new state, component renders again).

**Fix:** 
Remove the `resetToken` prop and the associated `useEffect` blocks. Instead, pass `key={lastEvent?.timestamp}` (or combine it with existing keys like `key={"rmv-" + refreshKey + "-" + (lastEvent?.timestamp || "")}`) to these components from their parents (`AdminPage.tsx`, `DoctorPage.tsx`, `HeadCouncillorPage.tsx`, `TeacherPage.tsx`, `TrialAdminPage.tsx`). When the key changes, React will unmount and remount the component, natively resetting all internal transient state.

---

### [HIGH] Cache Collision Risk: Missing `session.token` in `queryKey`
**File:** `frontend/src/components/records/ReferralManagementView.tsx:111`

**Issue:** 
The `useQuery` hook fetching `/api/referrals` does not include `session.token` in its `queryKey`.

**Why:** 
Per `GEMINI.md` rules: *"Every `useQuery` hook for user-scoped or role-scoped data MUST include `session.token` in its `queryKey`"*. Without the token in the `queryKey`, if a user switches roles in `AuthContext`, React Query will serve cached data from the previous role because the cache key (`['/api/referrals']`) is identical.

**Fix:** 
Update the `queryKey` to include the session token:
```tsx
  const { data: referralsData, isLoading: loading, isError } = useQuery<Referral[]>({
    queryKey: ['/api/referrals', session.token],
```

---

### [MEDIUM] Suboptimal Test Setup for State Reset
**File:** `frontend/src/components/students/StudentsView.test.tsx:180`

**Issue:** 
The test validates the filter reset behavior by re-rendering with a new `resetToken={Date.now()}` prop.

**Why:** 
If the team adopts the `key` prop pattern recommended above, this unit test will become obsolete because the `key` prop is handled by React natively, not by the component's internal logic. 

**Fix:** 
Remove this specific test from `StudentsView.test.tsx`. The responsibility of verifying the reset falls to integration tests on the parent pages (e.g., `AdminPage.test.tsx`) asserting that the component remounts or the key changes.
