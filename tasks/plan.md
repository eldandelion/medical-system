# Implementation Plan: Referral State Machine Update (Head Counsellor Bypass)

## Overview
We need to update the Referral state machine so that referrals submitted by a Head Counsellor bypass the `AWAITING_APPROVAL` status and go directly to `AWAITING_TRIAGE` (where Trial Admins can act on them). We will apply Domain-Driven Design and Clean Code principles by encapsulating the submission transition rules inside the `Referral` Aggregate Root and updating the factory and application service accordingly.

## Architecture Decisions
- **Domain logic in Aggregate Root**: The `Referral` entity will gain a `submit(actorRole, actorId)` method. This encapsulates state machine transitions within the domain model rather than the Application Service or Factory.
- **Factory handles only creation**: `ReferralFactory.initiate` will be renamed to `createDraft` and will solely be responsible for instantiating the entity in its initial `DRAFT` state without handling submission side-effects.
- **Application Service as Orchestrator**: `ReferralService.initiateReferral` will coordinate creating the draft and (if applicable) submitting it immediately, maintaining separation of concerns.

## Task List

### Phase 1: Foundation (Domain Models)
- [ ] **Task 1: Add `submit()` method to `Referral` entity**
- [ ] **Task 2: Refactor `ReferralFactory` to only create drafts**
- [ ] **Task 3: Update `ReferralStatus` transition rules**

### Checkpoint: Foundation
- [ ] Code compiles and domain logic is encapsulated.

### Phase 2: Service Layer Refactoring
- [ ] **Task 4: Update `ReferralService.initiateReferral` orchestration**

### Checkpoint: Core Features
- [ ] Application builds without errors.

### Phase 3: Testing & Verification
- [ ] **Task 5: Update and add Unit Tests**

### Checkpoint: Complete
- [ ] All tests pass: `mvn test` in the backend directory.
- [ ] Ready for review.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing tests breaking due to Factory changes | Medium | Perform a holistic test run and update tests in Phase 3. |
| Missing edge cases where previousStatus might be null | Low | The `DRAFT` status is strictly enforced by the factory, so `submit()` will always transition from `DRAFT`. |

## Open Questions
- None at this time.
