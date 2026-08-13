# Feature: Assessment Assignment (Architecturally Hardened)

## Executive Architectural Summary
This plan was evaluated by both Domain-Driven Design (DDD) and Clean Code specialized subagents.
- **DDD Quality Score (4/10 ➔ Hardened)**: Addressed Anemic Domain Model violations by extracting a pure `AssessmentAssignment` aggregate to enforce state transitions and revocation invariants.
- **Clean Code Score (6/10 ➔ Hardened)**: Addressed the ubiquitous language mismatch, UI-string leak violations, check-then-act race conditions, and unbounded DB query liabilities.

### Reconciliation & Trade-Off Log
1. **Ubiquitous Language**: `scaleType` is officially dropped. The business domain term `batteryCode` will be used universally across the database, backend models, DTOs, and frontend UI to prevent translation cognitive load.
2. **Domain Isolation vs Boilerplate**: We will adopt a pure `model/AssessmentAssignment.kt` aggregate. The application service will act only as an orchestrator, while the aggregate handles state guards (e.g., `revoke(user)`) and records its own domain events (via Spring's `@DomainEvents` or manual registration).
3. **Presentation Strings**: Backend exceptions will no longer return human-readable UI strings (e.g. `ConflictException("Already assigned")`). They will return standardized error codes (`{"error": "DUPLICATE_ASSIGNMENT"}`), which the frontend will localize.
4. **Race Conditions**: The check-then-act duplicate validation will be reinforced by catching `DataIntegrityViolationException` (with a corresponding unique constraint in the DB, applying careful handling for the 'status' column).
5. **Pagination**: The unbounded history query is replaced with Spring Data `Pageable` to prevent performance degradation over time.

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentAssignmentEntity.kt` - Why: Existing entity mapping. Must be updated to include constraints and `revokedAt`.
- `backend/src/main/kotlin/com/medicalsystem/backend/event/DomainEventPublisher.kt` - Why: Used for domain event dispatch.
- `backend/src/main/kotlin/com/medicalsystem/backend/exception/GlobalExceptionHandler.kt` - Why: Ensures exceptions return standardized JSON error codes without presentation strings.
- `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx` - Why: The existing UI that needs to consume the new `batteryCode`-based API and handle localized error codes.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Domain Models & Enums)
- Add `REVOKED` state to `AssessmentStatus` enum.
- Create `model/AssessmentAssignment.kt` (Pure Aggregate Root). It must contain state variables and behavioral methods (`assign`, `complete`, `revoke(revokerId)`) which internally guard against invalid state transitions and accumulate domain events (`AssessmentAssignedEvent`, etc.).

### Phase 2: Core Persistence & Application Service
- Update `AssessmentAssignmentEntity.kt` to include `revokedAt`. Add a unique constraint to prevent duplicate pending assignments at the DB level (if possible with MySQL 8 expression indexes, or handle carefully via pessimistic locking in JPA).
- Create `AssessmentAssignmentRepository.kt` with `Pageable` support.
- Create `AssessmentAssignmentService.kt` to orchestrate fetching the student, instantiating the pure domain aggregate, calling its behavioral methods, and persisting the resulting entity state.

### Phase 3: REST Contracts & Frontend Types
- Implement `AssessmentAssignmentController.kt` returning `201 Created` with the hydrated `AssessmentAssignmentHistoryDto` array (instead of a count).
- Use `Page<AssessmentAssignmentHistoryDto>` for the history endpoint.
- Update frontend TypeScript types to use `batteryCode` exclusively.

### Phase 4: Frontend UI & Edge Cases
- Build `AssessmentHistoryTab.tsx` with pagination support.
- Modify `AssignQuestionnaireDialog.tsx` to handle backend error codes like `DUPLICATE_ASSIGNMENT` and `UNAUTHORIZED_REVOCATION` and translate them into user-facing snackbar messages.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentStatus.kt`
- **IMPLEMENT**: Add `REVOKED` to the enum list.
- **VALIDATE**: `./mvnw compile`

### CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt`
- **IMPLEMENT**: Pure domain aggregate root.
- **PATTERN**: Should contain functions `fun complete()` and `fun revoke(revokerId: Long)`. These functions must throw `DomainException` (or similar) if state transitions are invalid (e.g., revoking an already completed assignment, or non-owners revoking).
- **IMPLEMENT**: Domain event registration (e.g. keeping an internal list of events to publish).
- **VALIDATE**: `./mvnw compile`

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentAssignmentEntity.kt`
- **IMPLEMENT**: Add `@Column(name = "revoked_at") var revokedAt: LocalDateTime? = null`.
- **IMPLEMENT**: Add mapping functions `fun toDomain(): AssessmentAssignment` and `companion object { fun fromDomain(domain: AssessmentAssignment) }` to isolate persistence.
- **VALIDATE**: `./mvnw compile`

### CREATE `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepository.kt`
- **IMPLEMENT**: Interface extending `JpaRepository<AssessmentAssignmentEntity, Long>`.
- **IMPLEMENT**: `fun findByStudentIdOrderByAssignedAtDesc(studentId: Long, pageable: Pageable): Page<AssessmentAssignmentEntity>`
- **IMPLEMENT**: `fun findByStudentIdAndBatteryCodeAndStatus(studentId: Long, batteryCode: String, status: AssessmentStatus): AssessmentAssignmentEntity?`
- **VALIDATE**: `./mvnw compile`

### CREATE `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEvents.kt`
- **IMPLEMENT**: `AssessmentAssignedEvent`, `AssessmentCompletedEvent`, `AssessmentRevokedEvent` containing `studentId`, `batteryCode`, and `userId`.
- **VALIDATE**: `./mvnw compile`

### CREATE `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentAssignmentService.kt`
- **IMPLEMENT**: `assignAssessments` - loads dependencies, attempts assignment. Wraps repository `save()` in a `try-catch` for `DataIntegrityViolationException` to throw `ConflictException("DUPLICATE_ASSIGNMENT")`.
- **IMPLEMENT**: `revokeAssignment` - delegates invariant checking to the pure domain aggregate (`domain.revoke(userId)`).
- **IMPLEMENT**: Uses `DomainEventPublisher` to dispatch aggregate events.
- **VALIDATE**: `./mvnw test` (Ensure mock tests are created).

### CREATE `backend/src/main/kotlin/com/medicalsystem/backend/controller/AssessmentAssignmentController.kt`
- **IMPLEMENT**: POST `/api/assessments/assign` returning `201 Created` with `List<AssessmentAssignmentHistoryDto>`.
- **IMPLEMENT**: POST `/api/assessments/assignments/{id}/revoke`.
- **IMPLEMENT**: GET `/api/assessments/assignments/student/{studentId}` returning `Page<AssessmentAssignmentHistoryDto>`.
- **VALIDATE**: `./mvnw test`

### UPDATE `frontend/src/types/index.ts`
- **IMPLEMENT**: Export interface `AssessmentAssignmentHistoryDto { id: number; batteryCode: string; assignedByName: string; assignedById: number; status: AssignmentStatus; assignedAt: string; completedAt?: string; revokedAt?: string; }`
- **IMPLEMENT**: Ensure all references to `scaleType` in this domain are refactored to `batteryCode` to maintain Ubiquitous Language.

### CREATE `frontend/src/hooks/useAssessmentAssignments.ts`
- **IMPLEMENT**: `useAssessmentHistory(studentId, page, size)` using `useQuery`.
- **IMPLEMENT**: `useRevokeAssignment()` using `useMutation`.

### CREATE `frontend/src/components/students/AssessmentHistoryTab.tsx`
- **IMPLEMENT**: Table displaying history data.
- **IMPLEMENT**: Pagination controls interacting with the React Query hook.
- **IMPLEMENT**: "Revoke" button visible only for PENDING items where `assignedById === session.user?.id`.

### UPDATE `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx`
- **IMPLEMENT**: Migrate variable names from `scaleTypes` to `batteryCodes`.
- **IMPLEMENT**: In `handleAssign`, check the error response. If `err.error === 'DUPLICATE_ASSIGNMENT'`, `showSnackbar({ message: 'This assessment is already pending for the student.' })`. Do NOT display raw backend error messages.

---

## TESTING STRATEGY
### Unit Tests
- Backend: `AssessmentAssignmentTest.kt` (Pure Domain Aggregate unit tests verifying state transitions and invariant rules without Spring Context).
- Backend: `AssessmentAssignmentServiceTest.kt` verifying `DataIntegrityViolationException` translation and event publishing logic.
- Frontend: `AssignQuestionnaireDialog.test.tsx` verifying localization of the `DUPLICATE_ASSIGNMENT` error using `@testing-library/react`.

### Integration Tests
- Backend: `@SpringBootTest` on the Repository to verify paginated history queries and constraint enforcement.

### Edge Cases
- State Machine Violations: Calling `revoke()` on an already `COMPLETED` assignment throws a domain exception.
- Concurrency: Two rapid requests to assign the same test simultaneously fail on the DB layer and return graceful `DUPLICATE_ASSIGNMENT` codes to the UI.
