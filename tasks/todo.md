- [ ] Task 1: Create Domain Visibility Criteria & Policy
  - Acceptance: `VisibilityCriteria` sealed class is defined. `ReferralVisibilityPolicy` object correctly returns the appropriate `VisibilityCriteria` for each `UserRole` based on spec.
  - Verify: Run unit tests `ReferralVisibilityPolicyTest`.
  - Files: `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralVisibilityPolicy.kt`, `backend/src/test/kotlin/com/medicalsystem/backend/model/ReferralVisibilityPolicyTest.kt`

- [ ] Task 2: Extend Domain Repository Interface
  - Acceptance: `ReferralRepository` interface has a new method `fun findVisibleReferralsFor(user: User): List<Referral>`.
  - Verify: Code compiles successfully.
  - Files: `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepository.kt`

- [ ] Task 3: Implement JPA Specifications for Visibility
  - Acceptance: A new class/object translates `VisibilityCriteria` into a Spring Data `Specification<ReferralEntity>`. Supports all conditions: ByInitiator, ByAssignedDoctor, ByStatuses, InitiatedOrStatuses, All.
  - Verify: Compile tests.
  - Files: `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralJpaSpecification.kt` (or similar)

- [ ] Task 4: Implement Repository Adapter
  - Acceptance: `ReferralRepositoryAdapter` implements `findVisibleReferralsFor(user: User)`, calling `ReferralVisibilityPolicy.getVisibilityCriteria(user)`, translating it to JPA Specification, and calling `referralJpaRepository.findAll(spec)`.
  - Verify: Write integration tests `ReferralRepositoryAdapterTest` setting up data and confirming filtering works.
  - Files: `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapter.kt`, `backend/src/test/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapterTest.kt`

- [ ] Task 5: Update `ReferralService`
  - Acceptance: `ReferralService.fetchActiveReferrals` uses `referralRepository.findVisibleReferralsFor(user)` instead of `referralRepository.findAll()`.
  - Verify: All service tests pass (`mvn test`).
  - Files: `backend/src/main/kotlin/com/medicalsystem/backend/service/ReferralService.kt`, `backend/src/test/kotlin/com/medicalsystem/backend/service/ReferralServiceTest.kt`
