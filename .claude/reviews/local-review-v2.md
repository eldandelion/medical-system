# Code Review Report

## CRITICAL

[CRITICAL] Strict Type Contracts Violation (`any` on API Responses)
File: `frontend/src/pages/AdminPage.tsx:92` (and all other role pages)
Issue: The response from `queryClient.fetchQuery` is explicitly typed as `any` (`const data: any = await queryClient.fetchQuery(...)`).
Why: This directly violates the project's `GEMINI.md` rules which state: "Strict Type Contracts (Zero any on API Responses): Frontend API fetching hooks (useQuery, fetch) must NEVER type responses implicitly as any."
Fix: Replace `any` with the appropriate explicit TypeScript interface that mirrors the backend DTO for the entity being fetched.

## HIGH

[HIGH] React Query Cancellation Anti-Pattern
File: `frontend/src/pages/AdminPage.tsx:88` (and all other role pages)
Issue: An external `AbortController` is manually created in the effect and passed to `fetch()`, bypassing React Query's internal cancellation mechanism.
Why: `fetchQuery` receives its own `AbortSignal` in the `queryFn` argument (e.g. `({ signal }) => fetch(..., { signal })`). Bypassing this means React Query is unaware of the cancellation, potentially caching queries in a failed state or causing unexpected behavior.
Fix: Use the provided signal from the `queryFn` context. To cancel the query when the component unmounts, call `queryClient.cancelQueries({ queryKey })` in the effect cleanup rather than manually aborting an external controller.

## MEDIUM

[MEDIUM] Formatting and Import Syntax Error
File: `frontend/src/pages/AdminPage.tsx:1`, `frontend/src/pages/DoctorPage.tsx:1`, `frontend/src/pages/StudentPage.tsx:1`, `frontend/src/pages/TeacherPage.tsx:1`, `frontend/src/pages/HeadCouncillorPage.tsx:1`, `frontend/src/pages/TrialAdminPage.tsx:1`
Issue: Multiple imports are on the same line without proper separation (e.g., `import { useSnackbar } from "../contexts/SnackbarContext";import * as React from 'react';`).
Why: This is a formatting error that reduces code readability and can cause linter warnings.
Fix: Add a newline between the imports.

[MEDIUM] Direct import of `queryClient` instead of `useQueryClient`
File: `frontend/src/pages/AdminPage.tsx:92` (and all other role pages)
Issue: `queryClient` is imported directly from `../utils/queryClient` and used inside the React component's `useEffect`.
Why: While it functions, React Query best practices dictate using the `useQueryClient()` hook within components to ensure the correct client instance is used, especially if the app ever implements SSR or scoped providers.
Fix: Use `const queryClient = useQueryClient();` inside the component instead of the global import.
