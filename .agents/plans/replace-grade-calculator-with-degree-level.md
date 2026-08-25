# Feature: Replace Dynamic Grade Calculator with Database-Backed Degree Level (以学历/培养层次字典表替代动态年级计算器) - Hardened Production Plan

The following plan has undergone rigorous **Architect Plan Review** across Domain-Driven Design (DDD) and Clean Code & Quality axes.
Pay special attention to language-agnostic backend design, ingestion Anti-Corruption Layer (ACL) normalization, aggregate boundary isolation, and O(1) dictionary pre-fetching.

---

## Executive Architectural Summary

| Review Axis | Score | Key Findings & Enhancements |
| :--- | :---: | :--- |
| **Domain-Driven Design (DDD)** | **9/10** (Hardened from 4/10) | Enforced pure Aggregate Root boundaries (`Student` aggregate references `DegreeLevel` model / ID). Modeled CSV ingestion explicitly as an Anti-Corruption Layer (ACL) translating external localized strings (`"本科"`, `"硕士"`, etc.) into language-agnostic domain representations (`"BACHELOR"`, `"MASTER"`, etc.). Decoupled JPA persistence from domain models. |
| **Clean Code & Quality** | **9.5/10** (Hardened from 4/10) | Strictly eliminated backend presentation strings by utilizing canonical codes (`BACHELOR`, `MASTER`, `PHD`, `OTHER`) in database seed data and DTOs. Kept presentation and CJK display strings purely on the frontend via `referralConstants.ts`. Specified exhaustive unit, integration, and CSV edge case tests. |

---

## Reconciliation & Trade-Off Log

1. **Language-Agnostic Backend vs. Localized Display**:
   - *Tension*: Storing Chinese strings like `"本科"` directly in database records and DTOs violates `GEMINI.md` ("No Presentation Strings in Backend").
   - *Resolution*: The database lookup entity `DegreeLevelEntity` and REST DTO `StudentDto.degreeLevel` use canonical language-agnostic codes (`BACHELOR`, `MASTER`, `PHD`, `OTHER`). The Ingestion ACL in `StudentImportSchema` translates localized Chinese CSV headers/cells (`"本科"`, `"硕士"`, etc.) to canonical codes at the system boundary. The frontend handles localized rendering (`BACHELOR -> 本科`).
2. **Database Lookup Table vs. Hardcoded Enum**:
   - *Decision*: Adopt `DegreeLevelEntity` (`degree_levels` table) with `@ManyToOne` in `StudentEntity`, mirroring `EthnicityEntity` (`ethnicities`) and `MajorEntity` (`major_entity`). This fulfills the user's explicit requirement for database-backed degree levels while enabling future university degree additions via database migrations.
3. **Ingestion ACL & O(1) Pre-fetching**:
   - *Decision*: In `StudentImportService`, pre-fetch `degreeLevelsMap` from `DegreeLevelJpaRepository` before iterating rows. The `StudentImportValidator` maps Chinese aliases to canonical codes in O(1) without N+1 queries.

---

## User Story

```text
As a Counseling Director, Trial Admin, or Teacher managing university screening cohorts
I want students to be categorized by their fixed education degree level (BACHELOR, MASTER, PHD, OTHER) backed by a database lookup entity
So that screening workflows, student records, and batch imports cleanly reflect university education tiers without time-based grade calculation skew.
```

---

## Problem Statement

- **Current State**: `StudentDto.year` is dynamically computed on every query via `AcademicYearCalculator.calculate(enrollmentDate)` against the system clock into an `AcademicYear` enum (`FRESHMAN`..`FIFTH_YEAR`). This is fragile, fails to cleanly distinguish master/PhD/specialty students, and cannot be statically assigned during CSV import.
- **Goal**: Replace dynamic grade calculation with a normalized `DegreeLevelEntity` (`degree_levels` table) mirroring the existing `EthnicityEntity` (`ethnicities`) and `MajorEntity` (`major_entity`) architecture.

---

## Solution Statement

1. **Entity & Repository**:
   - Create `DegreeLevelEntity` (`degree_levels` table) with `id: Long` and `name: String` (`BACHELOR`, `MASTER`, `PHD`, `OTHER`).
   - Create `DegreeLevelJpaRepository` extending `JpaRepository<DegreeLevelEntity, Long>`.
   - Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "degree_level_id") var degreeLevel: DegreeLevelEntity? = null` in `StudentEntity`.
   - Seed `BACHELOR`, `MASTER`, `PHD`, `OTHER` in `DataInitializer.kt`.
2. **Domain Model & DTOs**:
   - Add `data class DegreeLevel(val id: Long, val name: String)` in `DemographicsModels.kt`.
   - Update `Student` aggregate with `val degreeLevel: DegreeLevel? = null`.
   - Update `StudentDto` replacing `val year: AcademicYear?` with `val degreeLevel: String? = null` (and `val degreeLevelId: Long? = null`).
   - Remove `AcademicYearCalculator.kt`, `AcademicYearCalculatorTest.kt`, and `AcademicYear.kt`.
3. **CSV Ingestion ACL**:
   - Add `Fields.DEGREE_LEVEL = "degreeLevel"` and mappings (`"培养层次"`, `"学历层次"`, `"学历"`, `"学位"`, `"degreeLevel"`) in `StudentImportSchema.kt`.
   - Add `DEGREE_LEVEL_NOT_FOUND` to `StudentImportErrorCode`.
   - In `StudentImportService` & `StudentImportValidator`, pre-fetch `degreeLevelsMap = degreeLevelJpaRepository.findAll().associateBy { it.name }` and validate rows in O(1).
4. **Frontend UI**:
   - Update `Student` interface in `frontend/src/types/index.ts` with `degreeLevel?: string`.
   - Update `referralConstants.ts` with `DEGREE_LEVEL_OPTIONS` and `DEGREE_LEVEL_LABELS` (mapping `BACHELOR -> 本科`, `MASTER -> 硕士`, `PHD -> 博士`, `OTHER -> 其他`).
   - Update `StudentsView.tsx` column label to "学历/培养层次", rendering `DEGREE_LEVEL_LABELS[item.degreeLevel || ''] || '本科'`, and update filter chips.
   - Update `StudentBulkImportPreviewTable.tsx` with `DEGREE_LEVEL_NOT_FOUND` error formatting.

---

## Feature Metadata

- **Feature Type**: Simplification & Architectural Refactor
- **Estimated Complexity**: Low to Medium
- **Primary Systems Affected**:
  - Backend Entities & Repositories (`StudentEntity.kt`, `DegreeLevelEntity.kt`, `DegreeLevelJpaRepository.kt`, `DataInitializer.kt`)
  - Backend Domain & DTOs (`DemographicsModels.kt`, `Student.kt`, `StudentDto.kt`, `StudentMapper.kt`)
  - Backend CSV Ingestion (`StudentImportSchema.kt`, `StudentImportDto.kt`, `StudentImportValidator.kt`, `StudentImportService.kt`)
  - Frontend Types & Config (`index.ts`, `referralConstants.ts`, `studentImport.ts`)
  - Frontend UI Views (`StudentsView.tsx`, `StudentBulkImportPreviewTable.tsx`, `ProfileAcademicView.tsx`)
- **Dependencies**: None (internal domain model refactor)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- `backend/src/main/kotlin/com/medicalsystem/backend/entity/EthnicityEntity.kt` (lines 1-14): Pattern for lookup table entity.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentEntity.kt` (lines 1-33): Entity references to majors and teachers.
- `backend/src/main/kotlin/com/medicalsystem/backend/config/DataInitializer.kt` (lines 50-80): Database initialization and dictionary seeding.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportSchema.kt` (lines 40-75): CSV header mappings and field keys.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportValidator.kt` (lines 33-85, 208-224): Pattern for pre-fetched dictionary validation (`validateEthnicity`, `validateMajor`).
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportService.kt` (lines 45-75): Pre-fetching dictionaries and committing entities.
- `frontend/src/components/students/StudentsView.tsx` (lines 70-76, 100-108): Table columns and filter chips.
- `frontend/src/config/referralConstants.ts` (lines 31-40): Degree / year label mappings.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/entity/DegreeLevelEntity.kt`: Lookup table entity.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/DegreeLevelJpaRepository.kt`: Spring Data JPA repository.

### Files to Delete/Retire

- `backend/src/main/kotlin/com/medicalsystem/backend/model/AcademicYear.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/util/AcademicYearCalculator.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/util/AcademicYearCalculatorTest.kt`

---

## IMPLEMENTATION PLAN

### Phase 1: Persistence & Domain Foundation
- Create `DegreeLevelEntity` and `DegreeLevelJpaRepository`.
- Add `degreeLevel` reference to `StudentEntity` and `Student` domain model.
- Seed `BACHELOR`, `MASTER`, `PHD`, `OTHER` in `DataInitializer.kt`.
- Remove `AcademicYearCalculator.kt` and `AcademicYear.kt`.

### Phase 2: DTOs, Mappers, and Ingestion Validation
- Update `StudentDto` and `StudentMapper` to serialize `degreeLevel`.
- Add `DEGREE_LEVEL_NOT_FOUND` to `StudentImportErrorCode` (backend & frontend).
- Update `StudentImportSchema` with degree level column aliases and default (`BACHELOR`).
- Update `StudentImportValidator` and `StudentImportService` to pre-fetch and validate `degreeLevelsMap`.

### Phase 3: Frontend Integration
- Update TypeScript types (`Student`, `StudentImportRow`, `StudentImportErrorCode`).
- Update `referralConstants.ts` with `DEGREE_LEVEL_OPTIONS` and labels (`BACHELOR: 本科`, `MASTER: 硕士`, `PHD: 博士`, `OTHER: 其他`).
- Update `StudentsView.tsx` table column and filter chips.
- Update `StudentBulkImportPreviewTable.tsx` with error message formatting and column display.

### Phase 4: Verification & Test Alignment
- Update `StudentImportValidatorTest.kt`, `StudentImportServiceTest.kt`, and `StudentImportIntegrationTest.kt`.
- Run full backend test suite (`mvn test`) and frontend test suite (`npm run test` + `npm run lint`).

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/DegreeLevelEntity.kt`
- **IMPLEMENT**:
  ```kotlin
  package com.medicalsystem.backend.entity

  import jakarta.persistence.*

  @Entity
  @Table(name = "degree_levels")
  class DegreeLevelEntity(
      @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
      val id: Long = 0,

      @Column(unique = true, nullable = false, length = 50)
      var name: String
  )
  ```
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 2: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/repository/DegreeLevelJpaRepository.kt`
- **IMPLEMENT**:
  ```kotlin
  package com.medicalsystem.backend.repository

  import com.medicalsystem.backend.entity.DegreeLevelEntity
  import org.springframework.data.jpa.repository.JpaRepository
  import org.springframework.stereotype.Repository
  import java.util.Optional

  @Repository
  interface DegreeLevelJpaRepository : JpaRepository<DegreeLevelEntity, Long> {
      fun findByName(name: String): Optional<DegreeLevelEntity>
  }
  ```
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 3: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentEntity.kt`
- **IMPLEMENT**: Add `@ManyToOne` reference:
  ```kotlin
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "degree_level_id")
  var degreeLevel: DegreeLevelEntity? = null,
  ```
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 4: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/DemographicsModels.kt` & `Student.kt`
- **IMPLEMENT**: Add `DegreeLevel` model to `DemographicsModels.kt`:
  ```kotlin
  data class DegreeLevel(
      val id: Long,
      val name: String
  )
  ```
  And update `Student.kt`:
  ```kotlin
  data class Student(
      val id: Long,
      val studentNumber: String,
      val name: String,
      val major: Major,
      val enrollmentDate: LocalDate,
      val riskStatus: RiskStatus,
      val degreeLevel: DegreeLevel? = null,
      val demographics: Demographics? = null,
      val assignedTeacherId: Long? = null
  ) : AggregateRoot()
  ```
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 5: REMOVE `AcademicYearCalculator.kt`, `AcademicYearCalculatorTest.kt`, and `AcademicYear.kt`
- **REMOVE**:
  - `backend/src/main/kotlin/com/medicalsystem/backend/util/AcademicYearCalculator.kt`
  - `backend/src/main/kotlin/com/medicalsystem/backend/model/AcademicYear.kt`
  - `backend/src/test/kotlin/com/medicalsystem/backend/util/AcademicYearCalculatorTest.kt`

### Task 6: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/StudentDto.kt` & `StudentMapper.kt`
- **IMPLEMENT**: In `StudentDto.kt`, replace `val year: AcademicYear?` with:
  ```kotlin
  val degreeLevel: String? = null,
  val degreeLevelId: Long? = null,
  ```
  In `StudentMapper.kt`, inject `DegreeLevelJpaRepository` and map `degreeLevel` directly between `StudentEntity`, `Student`, and `StudentDto`.
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 7: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/config/DataInitializer.kt`
- **IMPLEMENT**: Inject `DegreeLevelJpaRepository` and seed initial records:
  ```kotlin
  val bachelorDegree = degreeLevelRepository.save(DegreeLevelEntity(name = "BACHELOR"))
  val masterDegree = degreeLevelRepository.save(DegreeLevelEntity(name = "MASTER"))
  val phdDegree = degreeLevelRepository.save(DegreeLevelEntity(name = "PHD"))
  val otherDegree = degreeLevelRepository.save(DegreeLevelEntity(name = "OTHER"))
  ```
  And attach `degreeLevel = bachelorDegree` when creating initial test students.
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 8: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportSchema.kt` & `StudentImportDto.kt`
- **IMPLEMENT**:
  - In `StudentImportDto.kt`: Add `DEGREE_LEVEL_NOT_FOUND` to `StudentImportErrorCode`, and `val degreeLevel: String? = null` to `StudentImportRowDto`.
  - In `StudentImportSchema.kt`:
    ```kotlin
    const val DEFAULT_DEGREE_LEVEL_CODE = "BACHELOR"
    // In Fields:
    const val DEGREE_LEVEL = "degreeLevel"
    // In HEADER_MAPPINGS:
    "培养层次" to Fields.DEGREE_LEVEL,
    "学历层次" to Fields.DEGREE_LEVEL,
    "学历" to Fields.DEGREE_LEVEL,
    "学位" to Fields.DEGREE_LEVEL,
    "degreeLevel" to Fields.DEGREE_LEVEL,
    ```
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 9: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportValidator.kt` & `StudentImportService.kt`
- **IMPLEMENT**:
  - Pass `degreeLevelsMap: Map<String, DegreeLevelEntity>` to `validateRows`.
  - Add `validateDegreeLevel` helper:
    ```kotlin
    private fun validateDegreeLevel(
        rawDegree: String?,
        degreeLevelsMap: Map<String, DegreeLevelEntity>,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String {
        val trimmed = rawDegree?.trim()
        val degreeCode = when (trimmed?.uppercase()) {
            null, "" -> StudentImportSchema.DEFAULT_DEGREE_LEVEL_CODE
            "BACHELOR", "本科", "本科生" -> "BACHELOR"
            "MASTER", "硕士", "硕士研究生" -> "MASTER"
            "PHD", "博士", "博士研究生" -> "PHD"
            "OTHER", "其他", "专科", "进修" -> "OTHER"
            else -> trimmed
        }
        if (!degreeLevelsMap.containsKey(degreeCode)) {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.DEGREE_LEVEL,
                    StudentImportErrorCode.DEGREE_LEVEL_NOT_FOUND,
                    trimmed
                )
            )
        }
        return degreeCode
    }
    ```
  - In `StudentImportService.kt`: Pre-fetch `degreeLevelsMap = degreeLevelJpaRepository.findAll().associateBy { it.name }` and set `studentEntity.degreeLevel = degreeLevelsMap[row.degreeLevel]`.
- **VALIDATE**: `./mvnw test -Dtest=StudentImportValidatorTest` in `/backend`

### Task 10: UPDATE Frontend Types & Constants
- **IMPLEMENT**:
  - In `frontend/src/types/index.ts`: Update `Student` interface with `degreeLevel?: string`.
  - In `frontend/src/types/studentImport.ts`: Add `'DEGREE_LEVEL_NOT_FOUND'` to `StudentImportErrorCode`, and `degreeLevel?: string | null` to `StudentImportRow`.
  - In `frontend/src/config/referralConstants.ts`:
    ```ts
    export const DEGREE_LEVEL_OPTIONS = [
      { label: '本科', value: 'BACHELOR' },
      { label: '硕士', value: 'MASTER' },
      { label: '博士', value: 'PHD' },
      { label: '其他', value: 'OTHER' }
    ];
    export const DEGREE_LEVEL_LABELS: Record<string, string> = {
      BACHELOR: '本科',
      MASTER: '硕士',
      PHD: '博士',
      OTHER: '其他'
    };
    ```
- **VALIDATE**: `npm run lint` in `/frontend`

### Task 11: UPDATE Frontend UI Components (`StudentsView.tsx`, `StudentBulkImportPreviewTable.tsx`)
- **IMPLEMENT**:
  - In `StudentsView.tsx`:
    - Change column label to `"学历/层次"`.
    - Render `DEGREE_LEVEL_LABELS[item.degreeLevel || 'BACHELOR'] || '本科'`.
    - Change filter chips to `{ label: '学历', options: ['本科', '硕士', '博士', '其他'] }`.
  - In `StudentBulkImportPreviewTable.tsx`:
    - Add `case 'DEGREE_LEVEL_NOT_FOUND': return '培养层次/学历在系统中未匹配: "${err.invalidValue ?? ""}"';`.
- **VALIDATE**: `npm run lint` and `npm run test` in `/frontend`

### Task 12: UPDATE Backend Test Suites
- **IMPLEMENT**:
  - Update `StudentImportValidatorTest.kt` with degree level validation test cases (defaults to BACHELOR, maps aliases, flags unknown values).
  - Update `StudentImportIntegrationTest.kt` to verify `degree_levels` database mapping on commit.
  - Run `./mvnw test` in `/backend`.

---

## VALIDATION COMMANDS

### Level 1: Frontend Type & Lint Validation
```bash
cd frontend && npm run lint
```

### Level 2: Frontend Unit Tests
```bash
cd frontend && npm run test
```

### Level 3: Backend Unit & Integration Tests
```bash
cd backend && ./mvnw test
```

---

## ACCEPTANCE CRITERIA

- [ ] `DegreeLevelEntity` and `degree_levels` table created with seed rows (`BACHELOR`, `MASTER`, `PHD`, `OTHER`).
- [ ] `StudentEntity` contains `@ManyToOne` foreign key to `DegreeLevelEntity`.
- [ ] Dynamic `AcademicYearCalculator` and `AcademicYear` enum completely removed from codebase.
- [ ] CSV bulk import supports `培养层次` / `学历层次` (defaulting to `BACHELOR` if omitted) and validates against pre-fetched dictionary in O(1).
- [ ] Frontend student list displays localized degree level (`本科`, `硕士`, `博士`, `其他`) with working filter chips.
- [ ] All frontend and backend tests pass with zero regressions.
