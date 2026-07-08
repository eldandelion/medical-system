# Implementation Plan: Role-Based Referral Visibility Filtering

## Overview
Implement domain-driven role-based visibility filtering for the referrals system. This will restrict users from seeing referrals that they are not permitted to see based on their role and the referral's status/assignee, particularly preventing the Trial Admin from seeing rejected referrals. This requires defining a Domain Policy for visibility criteria, extending the repository interface, mapping these rules to JPA specifications, and updating the application service.

## Architecture Decisions
- **Specification Pattern for Queries:** Encapsulate visibility rules in a Domain object (`ReferralVisibilityPolicy` returning `VisibilityCriteria`) rather than leaky abstractions like list of statuses in the application layer.
- **Spring Data JPA Specifications:** The infrastructure layer will translate the domain `VisibilityCriteria` into a highly-optimized JPA Specification query to prevent fetching unwanted records into memory.
- **TDD:** Write unit and integration tests before implementing the production code.

## Task List

### Phase 1: Domain Foundation
- [ ] Task 1: Create Domain Visibility Criteria & Policy
- [ ] Task 2: Extend Domain Repository Interface

### Checkpoint: Domain Foundation
- [ ] `ReferralVisibilityPolicyTest` passes.
- [ ] Domain is completely free of Spring/JPA dependencies.

### Phase 2: Infrastructure Translation
- [ ] Task 3: Implement JPA Specifications for Visibility
- [ ] Task 4: Implement Repository Adapter

### Checkpoint: Infrastructure
- [ ] Adapter integration tests pass (verifies correct SQL is generated and rows filtered).

### Phase 3: Application Integration
- [ ] Task 5: Update `ReferralService` 

### Checkpoint: Complete
- [ ] Application service tests pass.
- [ ] E2E flow verified. Trial Admin cannot see rejected referrals.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| N+1 queries from JPA Spec | Medium | Ensure fetch joins are used if eager loading of destination/attachments is needed in the `findAll(Spec)` query. |
| Complex SQL generation | Medium | Rely heavily on repository integration tests against an in-memory DB or test containers to verify the JPA specification translates accurately. |

## Open Questions
- None. Requirements clarified by user.
