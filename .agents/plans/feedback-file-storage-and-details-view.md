# Feature: Feedback File Storage Integration and Details View Attachment Support (Hardened)

The following plan provides a hardened, end-to-end architecture and implementation blueprint for integrating MinIO Object Storage into Referral Feedback Submissions and ensuring full inline preview and silent download capabilities in the Referral Details Feedback Tab.

---

## Executive Architectural Summary & Review Reconciliation

This plan has been reviewed and hardened by two specialized architectural quality gates:
- **Domain-Driven Design (DDD) Review**: Identified bounded context decoupling, aggregate file claiming, canonical domain file metadata, domain event publishing (`ReferralFeedbackSubmittedEvent`), and aggregate query predicates.
- **Clean Code & Quality Review**: Identified raw byte size propagation (`sizeBytes` in `UploadedAttachmentResult` eliminating `sizeBytes: 1024` magic numbers), defensive type safety (eliminating `as any[]`), and MSW mock schema synchronization (`content` vs `feedback`).

### Reconciliation & Design Decisions

| Finding | Source | Resolution / Decision |
|---|---|---|
| **Storage Claim & Canonical Domain Metadata** | DDD & Clean Code | `FeedbackService.submitFeedback` invokes `fileApplicationService.claimFiles(fileIds, doctorId)` and uses the returned verified `UploadedFileEntity` records (storage key, name, verified size) to construct canonical `FeedbackAttachment` domain models. |
| **Domain Event Dispatching** | DDD | Register `ReferralFeedbackSubmittedEvent` in `Referral.addFeedback(...)` and ensure `FeedbackService` publishes domain events via `DomainEventPublisher` upon transaction commit. |
| **Eliminate Frontend Magic Number `sizeBytes: 1024`** | Clean Code | Update `UploadedAttachmentResult` in `src/api/files.ts` to include `sizeBytes: number`. Propagate authentic file sizes directly into `POST /api/feedback`. |
| **Zero `any` on Presenter Attachments** | Clean Code | Remove `as any[]` cast from `ReferralFeedbackTab.tsx:45`, strongly type `referralDetails.feedback?.attachments`, and provide defensive fallback `attachments ?? []`. |
| **MSW Handler Contract Synchronization** | Clean Code | Fix `handlers.ts:888` to destructure `content` (matching backend DTO) instead of `feedback`. |
| **Attachment Access Authorization Query** | DDD | Maintain `Referral.hasAttachment(fileId)` / `assertCanAccessAttachment` on the aggregate root to govern both initial referral attachments and consultation feedback attachments. |

---

## Feature Description

Enable doctors submitting clinical feedback to upload medical attachments (discharge summaries, prescriptions, lab results) up to 25MB via the hardened MinIO presigned URL pipeline with magic-byte validation. The backend validates and claims these files upon feedback submission, attaching them to the `ReferralFeedback` aggregate and publishing a `ReferralFeedbackSubmittedEvent`. All authorized users (Doctors, Head Councillors, Teachers) viewing the referral can preview (PDFs/images inline) and download feedback attachments securely from the Feedback tab in the Referral Details view.

## User Story

```text
As a Doctor
I want to upload supporting medical records and prescription attachments when submitting referral feedback
So that Head Councillors and Teachers have access to verified clinical documentation for student follow-up care.

As a Head Councillor or Teacher
I want to preview and download doctor-uploaded feedback attachments from the Referral Details view
So that I can review clinical discharge reports without popup blockers or security compromises.
```

## Feature Metadata

- **Feature Type**: Enhancement & Security Hardening
- **Estimated Complexity**: Medium
- **Primary Systems Affected**: `FeedbackService.kt`, `Referral.kt`, `FeedbackCreationForm.tsx`, `ReferralFeedbackTab.tsx`, `FileApplicationService.kt`, `files.ts`, `handlers.ts`
- **Dependencies**: MinIO / S3, Apache Tika, TanStack React Query, React 19, Spring Boot 4.1

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- [`backend/src/main/kotlin/com/medicalsystem/backend/service/FeedbackService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/FeedbackService.kt#L15-L55) - Feedback application service to inject `FileApplicationService` and `DomainEventPublisher`.
- [`backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt#L180-L220) - `addFeedback` and attachment access query logic on Aggregate Root.
- [`backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt#L124-L175) - File claiming (`claimFiles`) and download URL generation.
- [`frontend/src/api/files.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/api/files.ts#L1-L20) - `UploadedAttachmentResult` interface and `uploadFileDirect` helper.
- [`frontend/src/components/records/FeedbackCreationForm.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/FeedbackCreationForm.tsx#L40-L115) - Doctor feedback submission form.
- [`frontend/src/components/records/ReferralFeedbackTab.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralFeedbackTab.tsx#L44-L66) - Feedback tab in details view rendering attachments.
- [`frontend/src/hooks/useAttachmentActions.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/hooks/useAttachmentActions.ts#L1-L80) - Unified hook managing inline preview and silent download via presigned URLs.
- [`frontend/src/mocks/handlers.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/mocks/handlers.ts#L885-L910) - MSW `POST /api/feedback` handler.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: UPDATE `frontend/src/api/files.ts`
- **IMPLEMENT**: Add `sizeBytes: number` to `interface UploadedAttachmentResult`. Populate `sizeBytes: file.size` in `uploadFileDirect`.
- **PATTERN**: `frontend/src/api/files.ts:3-15`
- **VALIDATE**: `npm run lint`

### Task 2: UPDATE `frontend/src/components/records/FeedbackCreationForm.tsx`
- **IMPLEMENT**:
  1. Store `sizeBytes: uploaded.sizeBytes` in form attachment state.
  2. In `handleSubmit`, map `sizeBytes: att.sizeBytes` (removing `sizeBytes: 1024` magic constant).
- **PATTERN**: `FeedbackCreationForm.tsx:40-95`
- **VALIDATE**: `npm run lint`

### Task 3: UPDATE `frontend/src/components/records/ReferralFeedbackTab.tsx`
- **IMPLEMENT**:
  1. Remove `as any[]` cast on line 45.
  2. Use defensive rendering: `attachments={referralDetails.feedback?.attachments ?? []}`.
- **PATTERN**: `ReferralFeedbackTab.tsx:44-66`
- **VALIDATE**: `npm run lint`

### Task 4: UPDATE `frontend/src/mocks/handlers.ts` & `frontend/src/mocks/data/referrals.ts`
- **IMPLEMENT**:
  1. In `handlers.ts` (`POST /api/feedback`), destructure `const { referralId, content, attachments } = data;` and store `summary: content`.
  2. In `referrals.ts`, ensure mock referral feedback entries contain `fileId`s on attachments (e.g., `fileId: 201`).
- **PATTERN**: `frontend/src/mocks/handlers.ts:888`
- **VALIDATE**: `npx vitest run src/mocks/`

### Task 5: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/FeedbackService.kt`
- **IMPLEMENT**:
  1. Inject `FileApplicationService` and `DomainEventPublisher`.
  2. In `submitFeedback`, extract `fileIds = request.attachments.mapNotNull { it.fileId }`.
  3. If `fileIds.isNotEmpty()`, call `val claimedFiles = fileApplicationService.claimFiles(fileIds, doctorId)` and map them into domain `FeedbackAttachment` models using `claimedFiles.associateBy { it.id }`.
  4. Collect and publish domain events from `referral.getDomainEvents()` via `eventPublisher.publish(events)`.
- **PATTERN**: Mirror `ReferralService.kt` claiming and event dispatching.
- **IMPORTS**: `import com.medicalsystem.backend.storage.service.FileApplicationService`, `import com.medicalsystem.backend.event.DomainEventPublisher`
- **VALIDATE**: `./mvnw test-compile`

### Task 6: UPDATE `backend/src/test/kotlin/com/medicalsystem/backend/service/FeedbackServiceTest.kt`
- **IMPLEMENT**:
  1. Add Mock for `FileApplicationService`.
  2. Add unit tests for:
     - Successful feedback submission with claimed files and event publishing.
     - Rejection when `claimFiles` throws `ForbiddenException` or `ValidationException` (asserting `referralRepository.save` is never called).
     - Clean submission when `attachments` is empty.
- **PATTERN**: JUnit 5 + Mockito Kotlin.
- **VALIDATE**: `./mvnw test -Dtest=FeedbackServiceTest`

### Task 7: ADD `frontend/src/components/records/ReferralFeedbackTab.test.tsx`
- **IMPLEMENT**:
  1. Test defensive rendering when `feedback` is null or `attachments` is empty.
  2. Test rendering with attachments and verify clicking preview/download triggers `useAttachmentActions` functions with correct arguments.
- **PATTERN**: `ReferralOverviewTab.test.tsx`
- **VALIDATE**: `npx vitest run src/components/records/ReferralFeedbackTab.test.tsx`

---

## TESTING STRATEGY

### Unit & Service Tests
- **`FeedbackServiceTest.kt`**:
  - `Given valid feedback with file attachments, When submitFeedback is called, Then claimFiles is invoked, canonical attachments are bound, and referral is saved.`
  - `Given unverified or unowned file ID, When submitFeedback is called, Then claimFiles exception propagates and referral is not saved.`
  - `Given empty attachments, When submitFeedback is called, Then feedback is added without claiming files.`
- **`ReferralFeedbackTab.test.tsx`**:
  - Verify attachment list renders correctly with file names and size badges.
  - Verify clicking attachment card triggers `previewAttachment({ referralId, fileId, name })`.
  - Verify clicking download button triggers `downloadAttachment({ referralId, fileId, name })`.

### Integration & Build Tests
- Execute full backend `./mvnw test` ensuring all domain aggregates, specifications, and storage services pass.
- Execute frontend `npm run lint && npx vitest run && npm run build`.

---

## VALIDATION COMMANDS

```bash
# Level 1: Frontend Lint & Type Check
cd frontend && npm run lint

# Level 2: Frontend Unit Tests
cd frontend && npx vitest run src/components/records/ src/mocks/ src/api/

# Level 3: Backend Test Suite
cd backend && ./mvnw test

# Level 4: Production Build Validation
cd frontend && npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] `UploadedAttachmentResult` carries authentic `sizeBytes`, eliminating hardcoded magic values.
- [ ] `FeedbackService` validates file active status and uploader ownership via `claimFiles`.
- [ ] Submitted feedback attachments persist in database (`feedback_attachments` table) and map cleanly to `ReferralDetailsDto.feedback.attachments`.
- [ ] MSW handlers correctly parse `content` and return synchronous mock feedback with `fileId`s.
- [ ] `ReferralFeedbackTab` displays feedback attachments without type casts (`as any[]`) and supports popup-safe preview and silent download.
- [ ] All automated test suites (backend + frontend) pass with zero regressions.
