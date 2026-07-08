# Spec: Role-Based Referral Visibility Filtering

## Objective
Implement role-based visibility filtering for referrals to ensure users (such as Trial Admins) only see referrals relevant to their role and current status. Specifically, Trial Admins should not see referrals that were rejected by a school counsellor. The solution must adhere to Domain-Driven Design (DDD) principles by encapsulating visibility rules in the Domain layer and translating them efficiently to database queries in the Infrastructure layer.

## Tech Stack
- **Language:** Kotlin
- **Framework:** Spring Boot
- **Database Access:** Spring Data JPA / Hibernate

## Commands
- **Build:** `mvn clean compile` (or `./mvnw clean compile`)
- **Test:** `mvn test` (or `./mvnw test`)
- **Lint:** Follow existing project Kotlin formatting

## Project Structure
- `backend/src/main/kotlin/com/medicalsystem/backend/model/` → Domain layer (where visibility rules/policies belong)
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/` → Domain repository interfaces and infrastructure adapters
- `backend/src/main/kotlin/com/medicalsystem/backend/service/` → Application service (orchestration)

## Code Style
```kotlin
// Domain Policy / Specification Object
object ReferralVisibilityPolicy {
    // Defines criteria that the infrastructure layer will translate into queries
    fun getVisibilityCriteria(user: User): VisibilityCriteria {
        return when (user.role) {
            UserRole.TEACHER -> VisibilityCriteria.ByInitiator(user.id)
            UserRole.DOCTOR -> VisibilityCriteria.ByAssignedDoctor(user.id)
            UserRole.TRIAL_ADMIN -> VisibilityCriteria.ByStatuses(
                listOf(
                    ReferralStatus.AWAITING_TRIAGE,
                    ReferralStatus.WAITING_FOR_SCHEDULING,
                    ReferralStatus.WAITING_FOR_APPOINTMENT,
                    ReferralStatus.AWAITING_FEEDBACK_APPROVAL,
                    ReferralStatus.CLOSED
                )
            )
            UserRole.HEAD_COUNSELLOR -> VisibilityCriteria.InitiatedOrStatuses(
                initiatorId = user.id,
                statuses = listOf(
                    ReferralStatus.AWAITING_APPROVAL,
                    ReferralStatus.AWAITING_FEEDBACK_APPROVAL
                )
            )
            else -> VisibilityCriteria.All
        }
    }
}

sealed class VisibilityCriteria {
    data class ByInitiator(val initiatorId: Long) : VisibilityCriteria()
    data class ByAssignedDoctor(val doctorId: Long) : VisibilityCriteria()
    data class ByStatuses(val statuses: List<ReferralStatus>) : VisibilityCriteria()
    data class InitiatedOrStatuses(val initiatorId: Long, val statuses: List<ReferralStatus>) : VisibilityCriteria()
    object All : VisibilityCriteria()
}

// Domain Repository Interface
interface ReferralRepository {
    fun findVisibleReferralsFor(user: User): List<Referral>
}
```

## Testing Strategy
- **Framework:** JUnit 5 with Mockito and Spring Boot Test.
- **Unit Tests:** Strictly test `ReferralVisibilityPolicy` to ensure each role returns the correct set of allowed statuses.
- **Integration Tests:** Test the infrastructure layer (`ReferralRepositoryAdapter`) to ensure the domain rules translate correctly to the `findByStatusIn` JPA method, verifying no extra rows are loaded into memory.
- **TDD Requirement:** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

## Boundaries
- **Always do:** Run tests before committing, follow naming conventions, ensure the domain has zero knowledge of Spring Data JPA.
- **Ask first:** If we need to change how existing active referrals are consumed by the frontend, or if the visibility logic requires checking fields other than `status`.
- **Never do:** Use `findAll()` and filter in-memory inside the Service layer.

## Success Criteria
- The Trial Admin can no longer see referrals that were rejected by a school counsellor.
- The `fetchActiveReferrals` endpoint returns filtered results efficiently at the database level.
- The business rules defining which statuses each role can view exist purely in the Domain model without leaking into the application service or infrastructure.

## Resolved Questions
1. **Teacher Visibility:** Teachers can only see referrals they initiated.
2. **Head Counsellor Visibility:** Head Counsellors can see referrals they initiated (including drafts), as well as referrals awaiting their approval (and feedback acknowledgment).
3. **Doctor Visibility:** Doctors can only see referrals explicitly assigned to them.
