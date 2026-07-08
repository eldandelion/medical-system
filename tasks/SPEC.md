# Spec: Fix Referral Tracker Inconsistency

## Objective
Fix the architectural flaw where the referral tracker skips the "Review" step and shows incorrect active states. The backend domain model currently maps the `AWAITING_APPROVAL` status to the `INITIATION` step, and entirely misses recording the `REVIEW` step, causing the frontend UI to display an incomplete and desynced progress track. Success means the tracker accurately reflects the current status (e.g., Awaiting Approval -> Review is Active) and does not skip any steps.

## Tech Stack
- Backend: Kotlin, Spring Boot
- Data Access: Spring Data JPA
- Testing: JUnit 5, Mockito

## Commands
- Build: `./mvnw clean compile` (or equivalent Maven command)
- Test: `./mvnw test`

## Project Structure
- `backend/src/main/kotlin/com/medicalsystem/backend/model/` → Domain models (ReferralStatus, Referral, ReferralFactory)
- `backend/src/test/kotlin/com/medicalsystem/backend/` → TDD test suite

## Code Style
```kotlin
// Ensure clean domain model state transitions without leaking infrastructure concerns
fun initiate(..., isDraft: Boolean = false): Referral {
    val referral = Referral(..., status = ReferralStatus.DRAFT, steps = mutableListOf(
        ReferralStep(..., type = ReferralStepType.INITIATION, status = ReferralStepStatus.ACTIVE)
    ))
    if (!isDraft) {
        referral.transition(ReferralStatus.AWAITING_APPROVAL, "Referral Submitted")
    }
    return referral
}
```

## Testing Strategy
- **Framework**: JUnit 5 & Mockito
- **Locations**: `backend/src/test/kotlin/com/medicalsystem/backend/model/ReferralTest.kt` (or similar)
- **TDD Requirement**: Write failing tests for the `Referral` transition logic first, verifying that the correct steps are generated and marked as completed/active.

## Boundaries
- **Always**: Run tests before considering the fix complete. Follow DDD practices (keep state logic in the Aggregate Root).
- **Ask first**: If we need to write a database migration script for existing corrupted records.
- **Never**: Modify the frontend tracking logic (it is already correct and purely data-driven).

## Success Criteria
1. When a referral is created as a draft, its status is `DRAFT` and its active step is `INITIATION`.
2. When a referral is submitted, its status is `AWAITING_APPROVAL`, `INITIATION` is marked completed, and `REVIEW` is the active step.
3. When transitioning to `AWAITING_TRIAGE`, `REVIEW` is marked completed, and `TRIAGE` is active.
4. All backend tests pass.

## Open Questions
1. How should we handle existing database records that were saved with the flawed state mapping? Should we write an SQL migration script to correct their `referral_step_entity` data, or only apply this fix to new state transitions going forward?
