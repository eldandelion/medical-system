# Implementation Plan: Backend Referral Action Authorization Migration

## Overview
We are migrating the computation of available actions for a referral from the frontend presentation layer into the backend Domain layer (`Referral` aggregate root). This resolves structural bugs where the frontend lost track of actions after decoupling detail data, and properly encapsulates business logic inside the Spring Boot/Kotlin backend.

## Architecture Decisions
- **Domain logic in Aggregate Root:** `Referral.getAllowedActions(currentUser)` will centralize all role and state transition logic natively within the domain.
- **DTO enhancement:** Both `ReferralDto` and `ReferralDetailsDto` will expose `availableActions` directly natively, treating the backend as the single source of truth.
- **Frontend as Dumb Consumer:** The frontend will remove `actionUtils.ts` and exclusively render what the `referral.availableActions` prop dictates.

## Task List

### Phase 1: Backend Domain Foundations
- [ ] **Task 1: Define ReferralAction Enum and Domain Logic**
  - Create `ReferralAction` enum.
  - Implement `getAllowedActions(user: User): List<ReferralAction>` in `Referral.kt`.

### Checkpoint: Backend Domain
- [ ] Kotlin tests pass for Domain logic.
- [ ] No compilation errors in backend.

### Phase 2: DTOs & Services
- [ ] **Task 2: Update DTOs and Mapper**
  - Add `availableActions: List<String>` to `ReferralDto`.
  - Update `ReferralMapper.kt` and `ReferralService.kt` to pass the authenticated user and execute `getAllowedActions()`.

### Checkpoint: Backend APIs
- [ ] Spring Boot builds cleanly (`mvn clean package`).
- [ ] Endpoint tests pass.

### Phase 3: Frontend Cleanup & Integration
- [ ] **Task 3: Refactor Frontend Types & Mock Handlers**
  - Update MSW `handlers.ts` to mock the array natively on the base mock data.
  - Remove `computeAvailableActions` and delete `actionUtils.ts`.
- [ ] **Task 4: Update UI Consumer**
  - Update `ReferralActionFooter.tsx` to read natively from `referral.availableActions`.

### Checkpoint: Complete
- [ ] Vitest tests pass cleanly on frontend.
- [ ] UI visual verification complete (buttons appear as expected).
- [ ] Ready for human review.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| **Mock Breakage** | High | The MSW interceptors heavily relied on the old `computeAvailableActions`. We must thoroughly rewrite how `mockReferralsDb` behaves and ensure unit tests pass. |
| **User Resolution** | Med | The backend `ReferralController` must successfully resolve the `User` from the JWT token and repository before passing to the domain model. |

## Open Questions
- Since the backend doesn't currently fully decode JWTs into `User` entities everywhere, do we need to implement a dummy User resolution in `ReferralService` for the mock tokens (`teacher_token_zhang`, `head_councillor_token`) until the full security context is built out?
