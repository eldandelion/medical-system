# Implementation Plan: Complete Referral Visibility Policy Update

## Overview
Implement the finalized, comprehensive role-based visibility policy across all user types (Student, Teacher, Head Counsellor, Trial Admin, Doctor, System Admin). This includes updating the domain policy to support new criteria (like step-history checking for Trial Admins and subject-checking for Students), and mapping these new criteria into JPA Specifications.

## Architecture Decisions
- **Step-History Checking for Trial Admin:** Instead of complex status tracking for rejections, the Trial Admin's visibility will be determined by whether the referral has ever reached a specific step in its lifecycle (`TRIAGE`, `SCHEDULING`, etc.). This cleanly encapsulates scope regardless of the current status (`REJECTED` or `ERROR`).
- **Student Visibility:** Students will query based on `studentId` and explicitly exclude `DRAFT` and `RECALLED` statuses.

## Task List

### Phase 1: Domain Foundation Updates
- [ ] **Task 1: Update `VisibilityCriteria`**
  - Add `BySubject(val studentId: Long)` for students.
  - Add `HasReachedStep(val stepTypes: List<ReferralStepType>)` for trial admins.
- [ ] **Task 2: Update `ReferralVisibilityPolicy`**
  - Map `UserRole.STUDENT` to `BySubject`.
  - Map `UserRole.TRIAL_ADMIN` to `HasReachedStep`.
- [ ] **Task 3: Update Domain Unit Tests**
  - Expand `ReferralVisibilityPolicyTest.kt` to cover the new behaviors for Students and Trial Admins.

### Checkpoint: Domain Foundation
- [ ] All unit tests in `ReferralVisibilityPolicyTest` pass.
- [ ] Domain logic remains free of infrastructure/Spring dependencies.

### Phase 2: Infrastructure Translation
- [ ] **Task 4: Update `ReferralJpaSpecification`**
  - Implement SQL mapping for `BySubject` (filter by `studentId` and exclude `DRAFT`/`RECALLED`).
  - Implement SQL mapping for `HasReachedStep` (use a JPA join or subquery on the `steps` collection to check if any step matches the provided types).

### Checkpoint: Complete
- [ ] Compile successfully.
- [ ] Backend test suite passes (`./mvnw clean test`), verifying the JPA specifications run correctly against the database.
- [ ] Ready for review.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Collection Join Performance | Low/Medium | Joining on the `steps` collection for `HasReachedStep` might duplicate rows if not distinct. We must ensure `query.distinct(true)` is used in the Specification to prevent returning the same referral multiple times if it has multiple matching steps. |

## Open Questions
- None. Requirements finalized in `docs/specs/complete-visibility-policy.md`.
