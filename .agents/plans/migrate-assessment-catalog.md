# Feature: Migrate Assessment Catalog to Database

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Migrate the hardcoded `AssessmentScaleCatalog` in the backend to a relational database schema. Currently, psychiatric tests (like PHQ-9, GAD-7) are statically defined in the backend codebase, causing discrepancies with the frontend mock database which includes extended domain tests (e.g., APQ-9, Social Environment). This feature will create a flexible database structure to dynamically store and manage assessment scales, sections, shared options, and questions while strictly adhering to the project's Domain-Driven Design (DDD) architecture and Clean Code principles.

## User Story

As a System Administrator / Developer
I want to manage assessment scales via database tables instead of hardcoded Kotlin objects
So that I can easily add, update, and align new psychological tests (like APQ-9) with the frontend without releasing a new backend build.

## Problem Statement

The backend uses a statically defined `AssessmentScaleCatalog.kt` to define tests, while the frontend mock db (`assessments.ts`) contains a superset of these tests with varying names and structures. This prevents dynamic assignment of new tests and creates maintenance overhead when syncing the two systems. Furthermore, keeping huge amounts of magic strings in Kotlin violates our clean code rules.

## Solution Statement

Implement a fully relational database model for `AssessmentScale` as the Aggregate Root. We will create 6 JPA entities (`AssessmentScaleEntity`, `AssessmentSectionEntity`, `AssessmentOptionGroupEntity`, `AssessmentOptionEntity`, `AssessmentQuestionEntity`, `AssessmentScoringRuleEntity`), but ONLY ONE Spring Data repository (`AssessmentScaleJpaRepository`) to enforce aggregate invariants. We will map this to the domain layer using an `AssessmentScaleRepositoryAdapter`. The `AssessmentService` will consume the pure domain interface. A Data Initializer will seed the database atomically from an external JSON file on startup, preventing magic string bloat in the codebase. We will avoid N+1 queries using `@EntityGraph` for deep fetching.

## Feature Metadata

**Feature Type**: Refactor / Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**: Backend Persistence Layer, Assessment Domain, Assessment Service
**Dependencies**: Spring Data JPA, Jackson (for JSON seeding), MySQL

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapter.kt` - Why: Shows the exact pattern for decoupling Domain Repositories from Spring Data JPA Repositories.
- `backend/src/main/kotlin/com/medicalsystem/backend/exception/NotFoundException.kt` - Why: Required for handling "Scale Not Found" errors gracefully.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleCatalog.kt` - Why: The current source of truth that will be deleted.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleRepository.kt` (Pure Domain Interface)
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentScaleRepositoryAdapter.kt` (JPA Adapter)
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentScaleJpaRepository.kt` (Spring Data Interface)
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentScaleEntity.kt` (and the other 5 internal entities: Sections, OptionGroups, Options, Questions, Rules)
- `backend/src/main/resources/seed/assessments.json` (JSON seeder file)
- `backend/src/main/kotlin/com/medicalsystem/backend/config/AssessmentDataInitializer.kt`

### Patterns to Follow

**Repository Adapter Pattern:**
The `AssessmentService` must NEVER see `AssessmentScaleJpaRepository` or any `*Entity` class. It only interacts with the domain interface:
```kotlin
// In model/
interface AssessmentScaleRepository {
    fun findByCode(code: String): AssessmentScale?
    fun findAll(): List<AssessmentScale>
}

// In repository/
@Repository
class AssessmentScaleRepositoryAdapter(
    private val jpaRepository: AssessmentScaleJpaRepository
) : AssessmentScaleRepository {
    override fun findByCode(code: String): AssessmentScale? {
        return jpaRepository.findByCode(code)?.toDomain()
    }
    // ...
}
```

**Avoid N+1 Queries (EntityGraph):**
```kotlin
@Repository
interface AssessmentScaleJpaRepository : JpaRepository<AssessmentScaleEntity, Long> {
    @EntityGraph(attributePaths = ["sections", "sections.questions", "sections.questions.optionGroup"])
    fun findByCode(code: String): AssessmentScaleEntity?
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Pure Domain & Adapters
**Tasks:**
- Define `AssessmentScaleRepository` interface in the `model/` package.
- Create all 6 JPA entities in the `entity/` package with `CascadeType.ALL` from the root. Use `snake_case` table names. Note that sections, questions, etc. are value objects/internal entities that belong entirely to the `AssessmentScale` aggregate.
- Create `AssessmentScaleJpaRepository` (the ONLY Spring Data repository). Include `@EntityGraph` to fetch the entire scale structure efficiently.
- Create `AssessmentScaleRepositoryAdapter` to implement the domain interface and map between JPA entities and domain models.

### Phase 2: Data Seeding (Externalized)
**Tasks:**
- Create `backend/src/main/resources/seed/assessments.json` containing the data from the old `AssessmentScaleCatalog` plus the missing frontend scales (APQ-9, etc.).
- Create `AssessmentDataInitializer` (`@Component`). Use Jackson `ObjectMapper` to parse the JSON.
- Add `@Transactional` to the initializer to ensure atomic seeding. Only insert if `repository.count() == 0`.

### Phase 3: Service Refactoring
**Tasks:**
- Refactor `AssessmentService` to inject `AssessmentScaleRepository` (domain interface).
- Apply `@Transactional(readOnly = true)` to fetch operations in the service.
- Throw `NotFoundException` if a requested scale code does not exist.
- Safely delete `AssessmentScaleCatalog.kt`.

### Phase 4: Testing & Validation
**Tasks:**
- Write `@SpringBootTest` to validate the complex 6-table entity relationships, ensuring saving the root cascades to all children. Verify no N+1 queries occur.
- Write unit tests for `AssessmentService` mocking the `AssessmentScaleRepository`. Test the `NotFoundException` path.
- Write integration test for `AssessmentDataInitializer` to ensure it parses the JSON correctly without constraint violations.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### 1. CREATE Domain Repository Interface
- **IMPLEMENT**: Create `AssessmentScaleRepository` in `com.medicalsystem.backend.model`.
- **VALIDATE**: `./mvnw clean test`

### 2. CREATE JPA Entities
- **IMPLEMENT**: Create `AssessmentScaleEntity` and its 5 child entities (Sections, Questions, etc.). Configure `@OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)` carefully.
- **IMPORTS**: `jakarta.persistence.*`
- **VALIDATE**: `./mvnw clean test`

### 3. CREATE JPA Repository & Adapter
- **IMPLEMENT**: Create `AssessmentScaleJpaRepository` using `@EntityGraph`. Create `AssessmentScaleRepositoryAdapter` to bridge the JPA and Domain worlds. Write the `.toDomain()` mapping logic.
- **VALIDATE**: Run a quick repository integration test (`@DataJpaTest` or `@SpringBootTest`) to confirm mappings.

### 4. CREATE JSON Seed Data & Initializer
- **IMPLEMENT**: Create `assessments.json`. Create `AssessmentDataInitializer` with `@Transactional` using `ObjectMapper`.
- **GOTCHA**: Ensure JSON parsing handles nested objects securely.
- **VALIDATE**: `./mvnw spring-boot:run` to test context load and DB population.

### 5. REFACTOR AssessmentService & Remove Catalog
- **IMPLEMENT**: Update `AssessmentService` to use the Domain Repository. Add error handling (`NotFoundException`). Delete `AssessmentScaleCatalog.kt`.
- **IMPORTS**: `com.medicalsystem.backend.exception.NotFoundException`
- **VALIDATE**: `./mvnw test -Dtest=AssessmentServiceTest`

---

## TESTING STRATEGY

### Unit Tests
- Use `Mockito` in `AssessmentServiceTest` to mock the domain repository interface. Test successful fetches and `NotFoundException` cases.

### Integration Tests
- `@SpringBootTest` focused on the `AssessmentScaleJpaRepository` to prove `@EntityGraph` works and prevents N+1 queries, and to verify the seeder logic successfully inserts a full aggregate.

---

## VALIDATION COMMANDS

### Level 1: Unit Tests
`./mvnw test` (Must pass 100%)

### Level 2: Integration Tests
`./mvnw spring-boot:run` (Verify logs show Hibernate successfully generating tables and inserting seed data without error).

---

## ACCEPTANCE CRITERIA

- [ ] `AssessmentScaleCatalog.kt` is removed.
- [ ] Database contains 6 tables correctly mapping the assessment scale aggregate.
- [ ] Only one Spring Data repository exists for the Aggregate Root.
- [ ] Application uses a JSON file for seeding data on startup cleanly.
- [ ] `AssessmentService` is completely decoupled from JPA.
- [ ] No N+1 query problems when fetching an assessment.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)

---

## NOTES

- The DDD Architecture review flagged that previous iterations leaked JPA into the service and violated aggregate boundaries. This plan explicitly fixes that via the Repository Adapter pattern and `@EntityGraph`.
- Clean Code review emphasized externalizing seed data to JSON to avoid magic string bloat in Kotlin files, and using `@Transactional` to avoid partial data writes during initialization.
