# Feature: Migrate Assessment Catalog to Static JSON

The following plan provides step-by-step instructions for reverting the 6-table normalized database schema in favor of reading static JSON files. This approach guarantees immutability for the psychological test definitions, vastly reduces ORM boilerplate, and aligns strictly with our Domain-Driven Design (DDD) aggregate model.

## Executive Architectural Summary
This plan was evaluated by the DDD and Clean Code Architect subagents.
- **DDD Review**: 9/10 - Excellent alignment with modeling read-only configurations as immutable Value Objects.
- **Clean Code Review**: 6/10 (Adjusted to 9/10) - Highlighted SRP violations in the original plan regarding the Repository Adapter doing file I/O and complex JSON parsing.

**Reconciliation & Trade-Off Log**:
- *SRP & Factory Extraction*: The JSON parsing and object stitching will be moved out of the Repository Adapter and into a dedicated `AssessmentCatalogLoader`.
- *Immutability*: `ConcurrentHashMap` has been rejected in favor of building the cache and assigning it to an immutable `Map`.
- *Domain Cleanup*: Surrogate database IDs (`id: Long`) will be completely stripped from the pure domain models, enforcing their identity as Value Objects.
- *Trade-off (Language-Agnostic Backend)*: The JSON files currently contain localized Chinese strings to maintain API compatibility with the existing frontend `AssessmentData.ts`. A full refactor to i18n translation keys is deferred as a pragmatic trade-off to minimize scope creep.

## Feature Description

Migrate the Assessment Catalog to parse static JSON files from `resources/assessments/` on application startup via a dedicated loader, store them in an immutable memory cache, and remove the unnecessary JPA entities for scales, sections, and questions. The database will strictly be used for storing transactional `assessment_assignments` and their `submissions` which refer to the JSON models by ID.

## Feature Metadata

**Feature Type**: Refactor / Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Backend models, repositories, and initializers
**Dependencies**: Jackson ObjectMapper, Spring Core Resources

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentScaleRepositoryAdapter.kt` - Why: This will become a thin wrapper over the in-memory map.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScale.kt` - Why: Target domain object that Jackson should deserialize into. Needs IDs removed.
- `backend/src/main/kotlin/com/medicalsystem/backend/config/AssessmentDataInitializer.kt` - Why: This file should be DELETED as seeding the database is no longer needed.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/config/AssessmentCatalogLoader.kt` - Dedicated component for reading and parsing JSON files on startup.
- `backend/src/main/kotlin/com/medicalsystem/backend/exception/AssessmentCatalogInitializationException.kt` - Descriptive startup error wrapper.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Cleanup & Domain Purity)

**Tasks:**
- Delete all 6 definition-related JPA Entities (`AssessmentScaleEntity.kt`, `AssessmentSectionEntity.kt`, `AssessmentQuestionEntity.kt`, `AssessmentOptionGroupEntity.kt`, `AssessmentOptionEntity.kt`, `AssessmentScoringRuleEntity.kt`).
- Delete `AssessmentScaleJpaRepository.kt`, `AssessmentOptionGroupJpaRepository.kt`, and `AssessmentScaleMapper.kt`.
- Delete the seeder config `AssessmentDataInitializer.kt` and its corresponding `seed/assessments.json`.
- Edit `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScale.kt` (and all nested classes) to remove the `val id: Long? = null` property. They are now pure Value Objects.

### Phase 2: Core Implementation (JSON Loading)

**Tasks:**
- Create `AssessmentCatalogInitializationException(message: String, cause: Throwable? = null)` extending `RuntimeException`.
- Create `AssessmentCatalogLoader` annotated with `@Component`. 
  - Inject `ObjectMapper` and `ResourcePatternResolver`.
  - Externalize path configuration (or use defaults like `classpath*:assessments/*.json`).
  - Read `assessment_groups.json`, `shared_option_groups.json`, and all individual questionnaires.
  - Stitch the standalone questionnaires into `AssessmentScale` models.
  - Wrap any IO or Jackson exceptions in `AssessmentCatalogInitializationException` to fail-fast the Spring Boot startup.
  - Return a fully constructed, immutable `Map<AssessmentScaleType, AssessmentScale>`.
- Refactor `AssessmentScaleRepositoryAdapter.kt` to inject `AssessmentCatalogLoader`. Call the loader in an `@PostConstruct` block to populate a `private lateinit var scalesCache: Map<AssessmentScaleType, AssessmentScale>`.
- Update `findByScaleType` and `findAll` to serve from the cache.

### Phase 3: Integration

**Tasks:**
- Ensure the `AssessmentAssignmentEntity` mapping and submission saving continues to work correctly, referencing the `AssessmentScaleType` enum.

### Phase 4: Testing & Validation

**Tasks:**
- Delete `AssessmentScaleRepositoryIntegrationTest.kt` as it tested database schema generation for scales.
- Create `AssessmentCatalogLoaderTest.kt` to unit test the JSON parsing logic using mock/test JSON files (verifying missing files throw exceptions).
- Hit the `/api/assessments/catalog` endpoint to ensure the JSON serves the identical DTO structure as before.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom.

### REMOVE backend/src/main/kotlin/com/medicalsystem/backend/entity/Assessment*
- **IMPLEMENT**: Delete all `AssessmentScaleEntity`, `AssessmentSectionEntity`, `AssessmentQuestionEntity`, `AssessmentOptionGroupEntity`, `AssessmentOptionEntity`, `AssessmentScoringRuleEntity`.
- **VALIDATE**: `ls backend/src/main/kotlin/com/medicalsystem/backend/entity/ | grep Assessment` (should only show `AssessmentAssignmentEntity.kt` now).

### REMOVE backend/src/main/kotlin/com/medicalsystem/backend/repository/*JpaRepository.kt
- **IMPLEMENT**: Delete `AssessmentScaleJpaRepository.kt` and `AssessmentOptionGroupJpaRepository.kt`.

### REMOVE backend/src/main/kotlin/com/medicalsystem/backend/config/AssessmentDataInitializer.kt
- **IMPLEMENT**: Delete the database seeder class as well as `backend/src/main/resources/seed/assessments.json` and `AssessmentScaleMapper.kt`.

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScale.kt
- **IMPLEMENT**: Remove `id: Long? = null` from `AssessmentScale`, `AssessmentSection`, `AssessmentQuestion`, `AssessmentOptionGroup`, and `AssessmentScoringRule`.
- **VALIDATE**: `./mvnw compile` (Fix any compile errors in `AssessmentService` if it referenced `.id`).

### CREATE backend/src/main/kotlin/com/medicalsystem/backend/config/AssessmentCatalogLoader.kt
- **IMPLEMENT**: Create `@Component` class that reads the JSON resources, stitches the scales together, and returns a `Map<AssessmentScaleType, AssessmentScale>`. Throw custom exceptions on missing files or broken references.
- **IMPORTS**: `org.springframework.core.io.support.PathMatchingResourcePatternResolver`, `com.fasterxml.jackson.module.kotlin.readValue`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentScaleRepositoryAdapter.kt
- **IMPLEMENT**: Remove JPA dependencies. Inject `AssessmentCatalogLoader`. Use `@PostConstruct` to initialize an immutable `Map<AssessmentScaleType, AssessmentScale>` cache. Return data directly from cache.

### UPDATE backend/src/test/kotlin/com/medicalsystem/backend/repository/AssessmentScaleRepositoryIntegrationTest.kt
- **IMPLEMENT**: Delete this file. Because we are no longer using JPA for scales, an integration test checking Hibernate schema generation for scales is obsolete.
- **VALIDATE**: `./mvnw test`

---

## TESTING STRATEGY

### Unit Tests
Create `AssessmentCatalogLoaderTest.kt` using `@SpringBootTest` or standard JUnit to parse the actual JSON files in the resources directory. Assert that all 8 scales are successfully loaded, containing their expected questions. Assert that `AssessmentCatalogInitializationException` is thrown when invalid paths are supplied.

### Integration Tests
Hit the `/api/assessments/catalog` REST endpoint once the server boots to verify the complete JSON graph is served identically to how the database served it.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
`./mvnw compile` - Ensure no missing entity dependencies.

### Level 2: Unit Tests
`./mvnw test` - Verify all logic tests pass.

### Level 3: Manual Validation
`./mvnw spring-boot:run`
`curl -H "Authorization: Bearer mock-token-student1" http://localhost:8080/api/assessments/catalog`
Verify the output structure matches the previous database payload.
