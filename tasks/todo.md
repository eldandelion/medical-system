## Task 1: Add `submit()` method to `Referral` entity

**Description:** Add a `submit(actorRole: UserRole, actorId: Long)` method to the `Referral` aggregate to encapsulate the transition logic.

**Acceptance criteria:**
-[x] Method checks that the current status is `DRAFT`.
-[x] If `actorRole` is `HEAD_COUNSELLOR`, transitions to `AWAITING_TRIAGE`.
-[x] Otherwise, transitions to `AWAITING_APPROVAL`.

**Verification:**
-[x] Manual review of `Referral.kt`

**Dependencies:** None

**Files likely touched:**
- `backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt`

**Estimated scope:** Small

---

## Task 2: Refactor `ReferralFactory` to only create drafts

**Description:** Rename `ReferralFactory.initiate` to `createDraft` and remove the `isDraft` logic, meaning the factory will only ever output a draft `Referral`.

**Acceptance criteria:**
-[x] Renamed `initiate` to `createDraft`.
-[x] Removed `isDraft` parameter and the subsequent `if (!isDraft)` transition logic.

**Verification:**
-[x] Backend compiles after this change (ignoring the service layer which is updated in Task 4).

**Dependencies:** None

**Files likely touched:**
- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralFactory.kt`

**Estimated scope:** Small

---

## Task 3: Update `ReferralStatus` transition rules

**Description:** Modify the `canTransitionFrom` logic in `ReferralStatus` to allow the `AWAITING_TRIAGE` state to be reached directly from `DRAFT`.

**Acceptance criteria:**
-[x] `AWAITING_TRIAGE` allows `previousStatus == DRAFT`.

**Verification:**
-[x] Manual review of `ReferralStatus.kt`.

**Dependencies:** None

**Files likely touched:**
- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt`

**Estimated scope:** XS

---

## Checkpoint: Foundation

-[x] Review changes in `Referral.kt`, `ReferralFactory.kt`, and `ReferralStatus.kt`.

---

## Task 4: Update `ReferralService.initiateReferral` orchestration

**Description:** Connect the newly decoupled factory and entity logic in the application service.

**Acceptance criteria:**
-[x] Uses `ReferralFactory.createDraft(...)`.
-[x] Calls `model.submit(user.role, user.id)` if `dto.actionType != "draft"`.

**Verification:**
-[x] Backend builds without compilation errors.

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `backend/src/main/kotlin/com/medicalsystem/backend/service/ReferralService.kt`

**Estimated scope:** Small

---

## Checkpoint: Core Features

-[x] Execute `mvn clean compile` in the `backend` folder.

---

## Task 5: Update and add Unit Tests

**Description:** Update existing tests that reference `ReferralFactory.initiate` and add tests verifying the head counsellor bypass logic.

**Acceptance criteria:**
-[x] `ReferralFactoryTest` (or similar) is updated to test `createDraft`.
-[x] `ReferralServiceTest` tests the `submit` logic for both regular users and head counsellors.

**Verification:**
-[x] `mvn test` runs successfully.

**Dependencies:** Task 4

**Files likely touched:**
- `backend/src/test/kotlin/com/medicalsystem/backend/model/ReferralFactoryTest.kt` (if exists)
- `backend/src/test/kotlin/com/medicalsystem/backend/service/ReferralServiceTest.kt`

**Estimated scope:** Medium
