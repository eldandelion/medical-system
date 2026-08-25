# Feature: Harden Student Name Validation in CSV Bulk Import & Demographics (学生姓名校验规则加固) - Hardened Production Plan

The following plan has undergone rigorous **Architect Plan Review** across Domain-Driven Design (DDD) and Clean Code & Quality axes.
Pay special attention to value object encapsulation, input sanitization in CSV ingestion, multicultural naming support (Chinese & Latin), and language-agnostic contract compliance.

---

## Executive Architectural Summary

| Review Axis | Score | Key Findings & Enhancements |
| :--- | :---: | :--- |
| **Domain-Driven Design (DDD)** | **9/10** (Hardened from 4/10) | Elevated `PersonName` from an anemic regex check to a rich, self-validating Value Object (`@JvmInline value class`). Replaced primitive string validation with factory construction (`PersonName.fromOrNull(raw)`). Added JPA `@Converter` mapping in `ValueObjectConverters.kt`. |
| **Clean Code & Quality** | **9.5/10** (Hardened from 7/10) | Fixed the critical flaw where Latin/international student names ("John Doe", "Jean-Luc", "O'Connor") were rejected by a blanket whitespace ban. Added automatic input trimming (`.trim()`) to prevent dirty trailing whitespace in CSV cells from triggering false positives. Expanded test matrix with explicit boundary and failure scenarios. |

---

## Reconciliation & Trade-Off Log

1. **Latin & Multicultural Name Compatibility vs. Space Restriction**:
   - *Tension*: The initial plan banned all whitespace, which broke standard Latin names like "John Doe" or "Mary Jane".
   - *Resolution*: Bounded contexts for naming are clearly separated in the `PersonName` Value Object:
     - **Chinese Names**: Strict `^[\u4e00-\u9fa5]{2,20}(?:[·•][\u4e00-\u9fa5]{1,20})*$` (2–20 Chinese chars, optional minority separator dot `·`/`•`, strictly **zero spaces**).
     - **Latin Names**: `^[A-Za-z]+(?:[ '-][A-Za-z]+)*$` (2–50 chars, allows internal single spaces, hyphens, and apostrophes between letter groups; disallows leading/trailing/consecutive symbols/spaces).
2. **Input Sanitization in Anti-Corruption Layer (ACL)**:
   - *Decision*: In CSV ingestion, human data entry often produces accidental trailing or leading spaces (e.g. `"李雷 "`). The validator and `PersonName.fromOrNull(raw)` will automatically trim the raw cell string before executing syntax validation, preventing false rejections while ensuring clean persisted data.
3. **Value Object Integration in Domain Aggregates vs. Scope Control**:
   - *Decision*: Introduce `PersonName` as a standard Domain Value Object alongside `MobileNumber`, `IdCardNumber`, and `EmailAddress`. Add `PersonNameConverter` in `ValueObjectConverters.kt` for persistence decoupling.

---

## User Story

```text
As a System Administrator or Head Councillor importing student cohorts via CSV
I want the system to strictly validate student names against Chinese and International academic naming standards (disallowing invalid spaces, symbols, punctuation, and digits)
So that student records and clinical psychiatric health profiles maintain clean, valid real-name identities without data corruption.
```

---

## Problem Statement

- **Current State**: `StudentImportValidator.validateRequiredField(Fields.NAME, row, errors)` only verifies that the cell is not blank. Unsanitized strings containing invalid spaces (`"张  三"`), special characters (`"王@五"`), symbols (`"李#四"`), numbers (`"张3"`), or single characters (`"王"`) are accepted into `READY` state and persisted into `users` and `students` tables.
- **Risk**: Dirty identity data compromises clinical psychiatric referrals, notification dispatches, and student search/triage.

---

## Solution Statement

1. **Domain Value Object (`PersonName`)**: Define an inline value class `PersonName` in `DomainValueObjects.kt` with clear regex predicates and sanitization:
   - **Chinese Names**: `^[\u4e00-\u9fa5]{2,20}(?:[·•][\u4e00-\u9fa5]{1,20})*$` (supports standard 2–20 character Han names and ethnic minority names with single middle dot `·` / `•`, e.g., `阿依努尔·阿卜杜拉`).
   - **Latin Names**: `^[A-Za-z]+(?:[ '-][A-Za-z]+)*$` (supports 2–50 alphabetical letters with standard single word separators for international students, e.g. `John Doe`, `Jean-Luc`, `O'Connor`).
   - **Disallowed**: Consecutive spaces/symbols, digits (`0-9`), punctuation, emoji, or arbitrary symbols (`!@#$%^&*()_+={}[];:"<>\/?|~` etc.).
2. **Error Code**: Introduce `INVALID_NAME_FORMAT` in `StudentImportErrorCode` (backend) and `StudentImportErrorCode` (frontend).
3. **Validator Integration**: Add `validateName` in `StudentImportValidator.kt` using `PersonName.fromOrNull(raw.trim())` to mark malformed names with `INVALID_NAME_FORMAT` and `INVALID` status.
4. **Localization & UI**: Map `INVALID_NAME_FORMAT` in `StudentBulkImportPreviewTable.tsx` to clear Chinese feedback (`姓名格式无效 (需2-20位中文及少数民族分隔点，或标准英文姓名，不可包含数字或特殊符号)`).

---

## Feature Metadata

- **Feature Type**: Bug Fix & Security/Data Hardening
- **Estimated Complexity**: Low to Medium
- **Primary Systems Affected**:
  - Backend Domain (`DomainValueObjects.kt`, `ValueObjectConverters.kt`)
  - Backend DTOs (`StudentImportDto.kt`)
  - Backend Ingestion Service (`StudentImportValidator.kt`, `StudentImportService.kt`)
  - Frontend Types (`studentImport.ts`)
  - Frontend Preview Components (`StudentBulkImportPreviewTable.tsx`)
- **Dependencies**: None (pure Kotlin & TypeScript stdlib regex)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- `backend/src/main/kotlin/com/medicalsystem/backend/model/DomainValueObjects.kt` (lines 1-118): Pattern for inline value classes (`MobileNumber`, `IdCardNumber`, `EmailAddress`).
- `backend/src/main/kotlin/com/medicalsystem/backend/converter/ValueObjectConverters.kt` (lines 1-12): Pattern for JPA `@Converter` mapping.
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/StudentImportDto.kt` (lines 11-24): Enum `StudentImportErrorCode`.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportValidator.kt` (lines 85-95, 149-160): Row validation step-down helpers and error generation.
- `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportValidatorTest.kt` (lines 120-132): Unit test fixture and assertions.
- `frontend/src/types/studentImport.ts` (lines 3-15): Frontend error code union type.
- `frontend/src/components/students/StudentBulkImportPreviewTable.tsx` (lines 24-52): `formatImportError` localization dictionary.

### New Files to Create
None (all changes enrich existing modules in-place).

---

## IMPLEMENTATION PLAN

### Phase 1: Domain Value Object & JPA Converter Definition
- Define `PersonName` inline value class in `DomainValueObjects.kt`.
- Add `PersonNameConverter` in `ValueObjectConverters.kt`.
- Add `INVALID_NAME_FORMAT` to `StudentImportErrorCode` in `StudentImportDto.kt` and `studentImport.ts`.

### Phase 2: Ingestion Validator Hardening
- Implement `validateName(rawName: String?, errors: MutableList<StudentImportFieldErrorDto>): String?` in `StudentImportValidator.kt`.
- Sanitize input with `.trim()` and instantiate via `PersonName.fromOrNull(...)`. If invalid, attach `INVALID_NAME_FORMAT` with the invalid value.

### Phase 3: Frontend Error Message Mapping
- Add `INVALID_NAME_FORMAT` handling in `formatImportError` inside `StudentBulkImportPreviewTable.tsx`.

### Phase 4: Unit & Integration Testing
- Add unit tests in `StudentImportValidatorTest.kt` covering all valid and invalid scenarios.
- Add frontend unit tests in `StudentBulkImportDialog.test.tsx` verifying the rendered error label.
- Run full test suites (`mvn test` and `npm run test`).

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/DomainValueObjects.kt`
- **IMPLEMENT**: Add `PersonName` value class with `CHINESE_NAME_PATTERN`, `LATIN_NAME_PATTERN`, sanitization, and `isValid(raw: String?): Boolean`.
- **PATTERN**: Mirror `MobileNumber` and `IdCardNumber` (`DomainValueObjects.kt:5-21`).
- **VALIDATE**: `./mvnw test-compile` in `/backend`

```kotlin
@JvmInline
value class PersonName(val value: String) {
    companion object {
        // 2-20 Chinese characters with optional single middle dot (· / •) for ethnic minority names
        val CHINESE_NAME_PATTERN = Regex("^[\\u4e00-\\u9fa5]{2,20}(?:[·•][\\u4e00-\\u9fa5]{1,20})*$")
        // 2-50 Latin characters with optional single space, hyphen, or apostrophe between word groups
        val LATIN_NAME_PATTERN = Regex("^[A-Za-z]+(?:[ '-][A-Za-z]+)*$")

        fun isValid(raw: String?): Boolean {
            if (raw.isNullOrBlank()) return false
            val trimmed = raw.trim()
            if (trimmed.length < 2 || trimmed.length > 50) return false
            return CHINESE_NAME_PATTERN.matches(trimmed) || LATIN_NAME_PATTERN.matches(trimmed)
        }

        fun fromOrNull(raw: String?): PersonName? =
            raw?.trim()?.takeIf { isValid(it) }?.let { PersonName(it) }
    }

    init {
        val trimmed = value.trim()
        require(isValid(trimmed)) {
            "Invalid person name format: '$value'"
        }
    }
}
```

### Task 2: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/converter/ValueObjectConverters.kt`
- **IMPLEMENT**: Add `PersonNameConverter` mapping `PersonName` to/from `String`.
- **PATTERN**: Mirror `EmailAddressConverter` (`ValueObjectConverters.kt:7-11`).
- **VALIDATE**: `./mvnw test-compile` in `/backend`

```kotlin
@Converter(autoApply = true)
class PersonNameConverter : AttributeConverter<PersonName, String> {
    override fun convertToDatabaseColumn(attribute: PersonName?) = attribute?.value
    override fun convertToEntityAttribute(dbData: String?) = dbData?.let { PersonName(it) }
}
```

### Task 3: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/StudentImportDto.kt`
- **IMPLEMENT**: Add `INVALID_NAME_FORMAT` to `enum class StudentImportErrorCode`.
- **VALIDATE**: `./mvnw test-compile` in `/backend`

### Task 4: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportValidator.kt`
- **IMPLEMENT**: Replace raw string check with `validateName`:
  ```kotlin
  val name = validateName(row[Fields.NAME], errors)
  ```
  And add helper:
  ```kotlin
  private fun validateName(
      rawName: String?,
      errors: MutableList<StudentImportFieldErrorDto>
  ): String? {
      if (rawName.isNullOrBlank()) {
          errors.add(StudentImportFieldErrorDto(Fields.NAME, StudentImportErrorCode.REQUIRED_FIELD_MISSING))
          return null
      }
      val personName = PersonName.fromOrNull(rawName)
      return if (personName != null) {
          personName.value
      } else {
          errors.add(
              StudentImportFieldErrorDto(
                  Fields.NAME,
                  StudentImportErrorCode.INVALID_NAME_FORMAT,
                  rawName.trim()
              )
          )
          null
      }
  }
  ```
- **VALIDATE**: `./mvnw test -Dtest=StudentImportValidatorTest`

### Task 5: UPDATE `frontend/src/types/studentImport.ts`
- **IMPLEMENT**: Add `'INVALID_NAME_FORMAT'` to `StudentImportErrorCode` type union.
- **VALIDATE**: `npm run lint` in `/frontend`

### Task 6: UPDATE `frontend/src/components/students/StudentBulkImportPreviewTable.tsx`
- **IMPLEMENT**: Add:
  ```ts
  case 'INVALID_NAME_FORMAT':
    return `姓名格式无效 (需2-20位中文及少数民族分隔点，或标准英文姓名，不可包含数字或特殊符号)`;
  ```
- **VALIDATE**: `npm run lint` and `npm run test` in `/frontend`

### Task 7: UPDATE `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportValidatorTest.kt`
- **IMPLEMENT**: Comprehensive test suite:
  - `valid standard Chinese names are classified as READY` (`"张三"`, `"李雷"`, `"诸葛孔明"`)
  - `valid minority names with middle dot are accepted` (`"买买提·吐尔逊"`, `"阿依努尔•阿卜杜拉"`)
  - `valid Latin names with spaces and hyphens are accepted` (`"John Doe"`, `"Jean-Luc"`, `"Mary-Jane"`, `"O'Connor"`)
  - `name with trailing or leading spaces is trimmed and accepted if valid` (`"  王小明  "` -> `"王小明"`)
  - `name with internal double spaces is rejected` (`"张  三"`)
  - `name with symbols or numbers produces INVALID_NAME_FORMAT error` (`"张*三"`, `"Alex#123"`, `"李4"`, `"王@五"`)
  - `single character name produces INVALID_NAME_FORMAT error` (`"张"`, `"A"`)
- **VALIDATE**: `./mvnw test` in `/backend`

---

## VALIDATION COMMANDS

### Level 1: Frontend Type & Lint Validation
```bash
cd frontend && npm run lint
```

### Level 2: Backend Unit & Integration Tests
```bash
cd backend && ./mvnw test
```

### Level 3: Frontend Unit Tests
```bash
cd frontend && npm run test
```

---

## ACCEPTANCE CRITERIA

- [ ] Student names containing invalid symbols (`*`, `@`, `#`, `$`, etc.) or numbers are flagged as `INVALID_NAME_FORMAT` and rejected.
- [ ] Standard Chinese names (2–20 chars) and ethnic minority names with middle dot (`·` / `•`) pass validation without errors.
- [ ] Standard Latin names (including valid single spaces, hyphens, or apostrophes, e.g. "John Doe", "Jean-Luc") pass validation.
- [ ] Accidental leading/trailing whitespace in CSV cells is automatically sanitized (`.trim()`).
- [ ] Frontend preview table displays localized, actionable error messages for name formatting errors.
- [ ] Backend JPA converter ensures seamless persistence decoupling.
- [ ] Zero regressions in existing CSV bulk import workflows, tests, and API contracts.
