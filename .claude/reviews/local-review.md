# React Code Review: Global Search Auto-Selection Fix

## Overview
The recent changes in `TeacherPage.tsx`, `StudentPage.tsx`, `HeadCouncillorPage.tsx`, `TrialAdminPage.tsx`, `DoctorPage.tsx`, and `AdminPage.tsx` successfully fix the bug where `ReferralDetailsDto` was improperly passed instead of `ReferralDto` by extracting `data.baseInfo`. However, the implementation relies on several anti-patterns and performance bottlenecks that should be addressed before merging.

### [HIGH] Missing AbortController in useEffect triggers race conditions
**Files:** `frontend/src/pages/*Page.tsx` (e.g., `DoctorPage.tsx:60-84`)
**Issue:** The `fetchEntity` async function is called inside `useEffect` without an `AbortController` to cancel the request if the component unmounts or if `lastEvent` changes rapidly.
**Why:** If the user clicks multiple search results quickly, multiple requests are fired. The last request to *complete* will set the state, which might not match the last result clicked, leading to a race condition. Furthermore, it can update state on unmounted components.
**Fix:** Implement an `AbortController` in the `useEffect` cleanup function.
```tsx
useEffect(() => {
  const abortController = new AbortController();
  // ...
  const fetchEntity = async () => {
    try {
      const res = await fetch(url, {
        signal: abortController.signal,
        headers: { 'Authorization': `Bearer ${session?.token || ''}` }
      });
      // ...
  };
  // ...
  return () => abortController.abort();
}, [lastEvent, session?.token]);
```

### [HIGH] Bypassing React Query cache causing redundant network requests
**Files:** `frontend/src/pages/*Page.tsx`
**Issue:** The `useEffect` fires a manual `fetch` to `/api/referrals/${id}`, which does not interact with TanStack Query.
**Why:** When `setSelectedItem(data.baseInfo)` is called, the child component (e.g. `ReferralDetailsView`) mounts and immediately calls `useQuery` for the exact same URL (`/api/referrals/${id}`). Because the first fetch was out-of-band, it hits the network twice in sequence for the same data.
**Fix:** Inject the `queryClient` using `useQueryClient()` and use `queryClient.fetchQuery(...)`. This allows you to seed the cache with the response so the child component renders instantly without a second network trip.

### [HIGH] Unhandled errors hidden from user
**Files:** `frontend/src/pages/*Page.tsx` (e.g., `DoctorPage.tsx:77-78`)
**Issue:** The `catch` block merely logs `console.error('Error fetching entity', e);` and sets the selection to `null`.
**Why:** If the entity fails to load (e.g., user is offline, backend error), the UI silently does nothing when the user clicks a search result.
**Fix:** Use `useSnackbar().showSnackbar(...)` to display a user-friendly error message on failure.

### [MEDIUM] State declaration out of order (Use-before-define smell)
**Files:** `frontend/src/pages/*Page.tsx` (e.g., `DoctorPage.tsx:113`)
**Issue:** `setActiveTab('overview')` is called inside the `useEffect` block near line 71, but the `const [activeTab, setActiveTab] = React.useState('overview');` is declared on line 113.
**Why:** While technically valid in execution due to function hoisting and the async nature of the `useEffect` callback, declaring hooks below where they are referenced violates clean code standards and can trigger linter warnings.
**Fix:** Move the `const [activeTab, setActiveTab] = React.useState('overview');` declaration to the top of the component alongside the other `useState` declarations.

### [MEDIUM] Brittle URL string replacements
**Files:** `frontend/src/pages/*Page.tsx`
**Issue:** Building the URL uses `${import.meta.env.BASE_URL}${endpoint.substring(1)}`.replace('//api', '/api').
**Why:** This string manipulation is brittle and overly complex for ensuring a single slash.
**Fix:** Normalize the URL construction. For example: `const url = new URL(endpoint, window.location.origin).toString()` or simply standardize the formatting of `import.meta.env.BASE_URL` at application startup.
