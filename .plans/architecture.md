# Architecture Design: Fix Missing Dispatch History

## 1. Context and Problem
The system currently experiences a bug where dispatch history fails to load or resolve correctly, particularly due to missing backend dispatch tracking for batch assignments and the frontend's inability to resolve the 'latest' alias in the dispatch history view.

## 2. System Boundaries & Affected Components

### 2.1 Backend Domain & Persistence Layer
We need to formalize dispatches as a Domain Aggregate Root.
- **New Aggregate**: `AssessmentDispatch`
- **Updated Aggregate**: `AssessmentAssignment` (must reference its parent dispatch)

**Affected Files (Backend):**
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt`
  - *Change*: Add `dispatchId: Long?`
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentAssignmentEntity.kt`
  - *Change*: Add `@Column(name = "dispatch_id") val dispatchId: Long?`
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentAssignmentMapper.kt`
  - *Change*: Map the new `dispatchId` between the entity and the domain model.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentDispatch.kt` (NEW)
  - *Change*: Define the Aggregate Root containing dispatch details (id, timestamp, createdBy, etc.)
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentDispatchEntity.kt` (NEW)
  - *Change*: JPA entity mapped to the `assessment_dispatches` table.
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentDispatchMapper.kt` (NEW)
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentDispatchRepository.kt` (NEW)
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentDispatchJpaRepository.kt` (NEW)
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentDispatchRepositoryAdapter.kt` (NEW)

### 2.2 Backend Service Layer
Whenever a batch assignment occurs, the service must create and persist an `AssessmentDispatch`.
- **Affected File**: `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt`
  - *Change*: Update assignment logic to instantiate an `AssessmentDispatch`, save it via its repository, and cascade the generated `dispatchId` to the newly created `AssessmentAssignment` entities.

### 2.3 Frontend Presentation Layer
The UI must handle the special routing alias 'latest' by resolving it to the concrete ID of the most recent dispatch once the list loads.
- **Affected File**: `frontend/src/components/assessments/DispatchHistoryTab.tsx`
  - *Change*: Implement a `useEffect` hook that detects if the requested dispatch ID is 'latest'. If so, it should select the first item from the fetched dispatch summary list and update the route/state with its actual ID.

## 3. Data Migration & Historical Data Handling
- **Constraint**: The `dispatch_id` on assignments must be nullable.
- **Strategy**: We will actively ignore historical assignments with a NULL `dispatch_id` when querying dispatch history, as these were created before the dispatch tracking feature was introduced.

## 4. Execution Plan
1. Create the backend domain, entity, mapper, and repository interfaces for `AssessmentDispatch`.
2. Update `AssessmentAssignment` and `AssessmentAssignmentEntity` to include `dispatchId`.
3. Update `AssessmentService` batch logic to persist a dispatch and link assignments.
4. Modify `DispatchHistoryTab.tsx` to handle the 'latest' string resolution.

### 2.4 Domain Structure of AssessmentDispatch (DDD Addendum)
Following DDD principles, `AssessmentDispatch` is an Aggregate Root referencing other aggregates by ID.
```kotlin
data class AssessmentDispatch(
    val id: Long? = null,
    val batteryCode: BatteryId,
    val dispatchedByUserId: Long,
    val dispatchType: DispatchType,
    val targetCohort: String? = null,
    val dispatchedAt: LocalDateTime = LocalDateTime.now(),
    val dueDate: LocalDate? = null,
    var status: DispatchStatus = DispatchStatus.ACTIVE
) : AggregateRoot() {
    companion object {
        fun createBatch(...) = AssessmentDispatch(...)
        fun createForIndividuals(...) = AssessmentDispatch(...)
    }
}
```
- **Service Orchestration**: `AssessmentService` will first persist `AssessmentDispatch` to generate its ID, then pass that `dispatchId` to the factory methods of `AssessmentAssignment`.

### 2.5 Dispatch History Endpoint & Filtering (Severity Tracking)
To support the 'Dispatch History' tab requirements (paginated history and filtering by ResultSeverity):
- **Domain & Persistence**: 
  - Add `ResultSeverity` enum (`backend/src/main/kotlin/com/medicalsystem/backend/model/ResultSeverity.kt`).
  - Update `AssessmentAssignment` and `AssessmentAssignmentEntity` to include `severity` (mapped to `severity_id` column using a converter in `EnumConverters.kt`).
  - Introduce `ParticipationRecordSpecification` for filtering history queries.
- **Service & Controller**: 
  - Create `AssessmentDispatchService` and `AssessmentDispatchController` to serve GET `/api/assessments/dispatches/summary` and GET `/api/assessments/participation-records` via `AssessmentDispatchHistoryDtos.kt`.
- **Frontend Types**: Update `ParticipationRecordDto` in `frontend/src/types/index.ts` to expose `severity`.
- **Frontend Hooks**: Create `useAssessmentDispatchHistory.ts`.
