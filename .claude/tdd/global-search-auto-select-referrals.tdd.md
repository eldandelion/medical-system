# TDD Evidence: Global Search Auto-Selection Bug Fix (Referrals)

## User Journeys
As a user, I want selecting a referral from the global search dialog to successfully highlight the selected referral in the list and open the details drawer without crashing or spinning indefinitely.

## Task Report
- **Goal**: Fix the bug where selecting a referral from the search box returned a `ReferralDetailsDto` which was fed directly into components expecting a `ReferralDto`, causing `selectedItem.id` to be undefined (breaking list selection) and the UI details view to crash or load indefinitely.
- **Implementation**: Updated the `fetch` interceptors in `TeacherPage`, `StudentPage`, `HeadCouncillorPage`, `DoctorPage`, and `TrialAdminPage` to correctly inspect the returned JSON object and extract `data.baseInfo` if present. This ensures the correct summary object (`ReferralDto`) is pushed into the `selectedItem`/`selectedRecord` state.
- **Validation**: Added a Vitest integration test simulating the `/api/referrals/{id}` response payload structure containing `baseInfo`, verifying that the component safely unwraps it and renders the child components without crashing.

## Test Specification
| # | What is guaranteed | Test file or command | Test type | Result | Evidence |
|---|--------------------|----------------------|-----------|--------|----------|
| 1 | Referral search selection extracts `baseInfo` and mounts details panel | `GlobalSearchNavigation.test.tsx:fetches referral entity and correctly extracts baseInfo` | unit/integration | PASS | `npx vitest run src/pages/GlobalSearchNavigation.test.tsx` |

## Coverage and known gaps
- The fix propagates across all role portals that manage referrals. 
- The fallback logic `data.baseInfo ? data.baseInfo : data` is highly resilient as it automatically handles Students, Users, and other entity endpoints that do not nest their payloads.
