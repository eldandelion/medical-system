# Complete Visibility Policy Update Tasks

## Phase 1: Domain Foundation Updates
- [ ] **Task 1: Update `VisibilityCriteria`**
  - Add `BySubject` data class.
  - Add `HasReachedStep` data class.
- [ ] **Task 2: Update `ReferralVisibilityPolicy`**
  - Route `UserRole.STUDENT` to `BySubject`.
  - Route `UserRole.TRIAL_ADMIN` to `HasReachedStep`.
- [ ] **Task 3: Update Domain Unit Tests**
  - Test student visibility rules.
  - Test trial admin visibility rules.

## Phase 2: Infrastructure Translation
- [ ] **Task 4: Update `ReferralJpaSpecification`**
  - Implement `BySubject` SQL logic.
  - Implement `HasReachedStep` SQL logic (ensure `query.distinct(true)` is used).

## Verification
- [ ] Verify tests pass with `./mvnw clean test`
