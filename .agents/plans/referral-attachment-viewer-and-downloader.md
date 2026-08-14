# Feature: Referral Attachment Viewer & Downloader (Overview Tab)

The following plan is complete and context-rich. Validate documentation, codebase patterns, and test sanity before executing.

---

## Feature Description

In the University Medical Screening & Psychiatric Referral System, users (Teachers, Head Councillors, Trial Admins, and Doctors) need to review attachments uploaded during the initial referral creation. 

This feature ensures:
1. **First Tab Attachment Visibility**: Initial referral application attachments (distinct from doctor diagnostic feedback) are returned in `ReferralDetailsDto` and displayed in the first tab ("Overview" / "分诊基本信息") of the Referral Details drawer.
2. **MIME-Aware Content Disposition**: When an attachment is clicked, the backend generates an AWS SigV4 presigned download URL with:
   - `inline; filename="..."` + `response-content-type` for previewable media (PDFs and Images: PNG, JPEG, WebP, GIF, SVG), allowing them to render natively in a new browser tab.
   - `attachment; filename="..."` for document files (DOCX, Word, binaries), triggering an automatic browser download.
3. **Domain & UI Cleanliness**: Provenance is strictly preserved—initial referral attachments stay in the Overview tab, while doctor feedback attachments remain isolated in the Feedback tab.

---

## User Story

```text
As a Teacher, Head Councillor, Trial Admin, or Doctor reviewing a student's referral
I want to view and click on all application attachments directly from the first tab of the referral details
So that I can immediately preview medical PDFs/images in a new browser tab and download DOCX documents with one click
```

---

## Problem Statement

1. **Missing Attachments in Details DTO**: `ReferralMapper.toDetailsDto` only maps `feedback.attachments`, omitting the referral's own initial attachments (`model.attachments`), causing the Overview tab to erroneously render empty or feedback attachments.
2. **Hardcoded Download Disposition**: `MinioStorageAdapter` currently hardcodes `responseContentDisposition("attachment; filename=...")` for all files. This forces browsers to download PDFs and images instead of previewing them in a new tab.
3. **Frontend Wiring**: `ReferralOverviewTab.tsx` currently references `referralDetails.feedback?.attachments` instead of `referralDetails.attachments` (or `referral.attachments`).

---

## Solution Statement

1. **DTO & Domain Mapper**:
   - Add `val attachments: List<AttachmentDto> = emptyList()` to `ReferralDetailsDto`.
   - Update `ReferralMapper.toDetailsDto` to map `model.attachments` into `ReferralDetailsDto.attachments`.
2. **Storage Port & MIME-Aware Adapter**:
   - Update `FileStoragePort.generatePresignedDownloadUrl` and `MinioStorageAdapter` to accept `mimeType: String`.
   - Determine `responseContentDisposition`:
     - Inline types (`application/pdf`, `image/*`): `inline; filename="<sanitizedFilename>"`
     - Non-inline types (`docx`, `doc`, other binaries): `attachment; filename="<sanitizedFilename>"`
   - Set `responseContentType(mimeType)` in `GetObjectRequest` presigning.
3. **Frontend Details Types & Overview Tab**:
   - Add `attachments?: Attachment[]` to `ReferralDetails` interface in `frontend/src/types/index.ts`.
   - Update `ReferralOverviewTab.tsx` to pass `referralDetails.attachments || referral.attachments || []` into `<AttachmentList />`.
   - Update MSW handlers to return `attachments` in mock referral details responses.

---

## Feature Metadata

- **Feature Type**: Enhancement / Bug Fix
- **Estimated Complexity**: Low-Medium
- **Primary Systems Affected**: `backend/storage`, `backend/dto`, `backend/mapper`, `frontend/records`, `frontend/api`
- **Dependencies**: AWS S3 SDK v2 (`S3Presigner`), TanStack React Query, Material Design 3 Web Components

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- `backend/src/main/kotlin/com/medicalsystem/backend/dto/ReferralDetailsDto.kt` (lines 3-10) - DTO structure for referral details view.
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/ReferralMapper.kt` (lines 200-230) - Maps domain `Referral` aggregate to `ReferralDetailsDto`.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/port/FileStoragePort.kt` (lines 6-12) - Port interface for presigned URL generation.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/adapter/MinioStorageAdapter.kt` (lines 48-66) - MinIO adapter implementing S3 presigning.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt` (lines 142-166) - Downloads endpoint service with security validation.
- `frontend/src/types/index.ts` (lines 110-140) - TypeScript interfaces for `Referral` and `ReferralDetails`.
- `frontend/src/components/records/ReferralOverviewTab.tsx` (lines 25-38, 185-191) - Overview tab rendering attachments and handling clicks.
- `frontend/src/mocks/handlers.ts` (lines 40-75) - MSW mock handlers for referral details and attachment download URLs.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/ReferralDetailsDto.kt`
- **IMPLEMENT**: Add `val attachments: List<AttachmentDto> = emptyList()` to `ReferralDetailsDto`.
- **IMPORTS**: `com.medicalsystem.backend.dto.AttachmentDto`
- **VALIDATE**: `./mvnw test-compile`

### Task 2: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/mapper/ReferralMapper.kt`
- **IMPLEMENT**: In `toDetailsDto(model: Referral, ...)`, map `model.attachments` to `List<AttachmentDto>`:
  ```kotlin
  val referralAttachments = model.attachments.map { att ->
      com.medicalsystem.backend.dto.AttachmentDto(
          name = att.file.name,
          size = att.file.sizeBytes.toString(),
          fileId = att.fileId
      )
  }
  ```
  Pass `attachments = referralAttachments` into `ReferralDetailsDto(...)`.
- **VALIDATE**: `./mvnw test-compile`

### Task 3: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/port/FileStoragePort.kt` & `MinioStorageAdapter.kt`
- **IMPLEMENT**:
  1. Add `mimeType: String` parameter to `FileStoragePort.generatePresignedDownloadUrl(storageKey: String, originalFilename: String, mimeType: String, duration: Duration): URL`.
  2. In `MinioStorageAdapter.kt`, inspect `mimeType`:
     ```kotlin
     val isInline = mimeType == "application/pdf" || mimeType.startsWith("image/")
     val dispositionType = if (isInline) "inline" else "attachment"
     val sanitizedFilename = originalFilename.replace("\"", "").trim()
     val getObjectRequest = GetObjectRequest.builder()
         .bucket(bucketName)
         .key(storageKey)
         .responseContentDisposition("$dispositionType; filename=\"$sanitizedFilename\"")
         .responseContentType(mimeType)
         .build()
     ```
- **VALIDATE**: `./mvnw test-compile`

### Task 4: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt`
- **IMPLEMENT**: In `getReferralAttachmentDownloadUrl(referralId, fileId, user)`, pass `file.mimeType` to `fileStoragePort.generatePresignedDownloadUrl`:
  ```kotlin
  val presignedUrl = fileStoragePort.generatePresignedDownloadUrl(
      storageKey = file.storageKey,
      originalFilename = file.originalName,
      mimeType = file.mimeType,
      duration = DOWNLOAD_PRESIGN_DURATION
  )
  ```
- **VALIDATE**: `./mvnw test`

### Task 5: UPDATE `frontend/src/types/index.ts`
- **IMPLEMENT**: In `ReferralDetails` interface, add `attachments?: Attachment[];`.
- **VALIDATE**: `cd frontend && npm run lint`

### Task 6: UPDATE `frontend/src/components/records/ReferralOverviewTab.tsx`
- **IMPLEMENT**:
  1. Reuse the existing shared `<AttachmentList />` component (`src/components/common/AttachmentList.tsx`) without creating any new UI components.
  2. Pass `attachments={referralDetails.attachments || referral.attachments || []}` into `<AttachmentList />`.
  3. Keep title as `"转诊附件"`.
  4. Ensure `handleDownload(file: Attachment)` opens the generated presigned URL with `window.open(url, '_blank')`, triggering inline viewing for PDFs/images and direct download for DOCX/others.
- **VALIDATE**: `cd frontend && npx vitest run src/components/records/ src/components/common/`

### Task 7: UPDATE `frontend/src/mocks/handlers.ts`
- **IMPLEMENT**:
  1. Ensure mock referral details response returns `attachments: [{ name: '病历转诊单.pdf', size: '1.2 MB', fileId: 101 }]`.
  2. Align download URL mock response to handle both previewable and download flows.
- **VALIDATE**: `cd frontend && npm test -- --run`

### Task 8: Backend Unit & Controller Tests
- **IMPLEMENT**:
  1. Update `FileApplicationServiceTest.kt` to mock `generatePresignedDownloadUrl` with `mimeType`.
  2. Verify in `FileControllerTest.kt` that `GET /api/referrals/{referralId}/attachments/{fileId}/download-url` returns the presigned URL properly.
- **VALIDATE**: `cd backend && ./mvnw test`

---

## TESTING STRATEGY

### Unit Tests
- `ReferralMapperTest`: Assert `toDetailsDto` maps `model.attachments` into `ReferralDetailsDto.attachments` with valid `name`, `size`, and `fileId`.
- `FileApplicationServiceTest`: Verify `generatePresignedDownloadUrl` is invoked with correct `mimeType` and disposition logic.

### Integration & UI Tests
- Vitest Component Tests:
  - `ReferralOverviewTab.test.tsx` / `AttachmentList.test.tsx`: Verify attachments render properly in the Overview tab and trigger `getReferralAttachmentDownloadUrl`.
- Full Maven test suite:
  - `./mvnw test` (all 166+ tests green).

---

## VALIDATION COMMANDS

```bash
# 1. Backend test suite
cd backend && ./mvnw test

# 2. Frontend typecheck and unit tests
cd frontend && npm run lint
cd frontend && npx vitest run src/components/records/ src/components/common/ src/mocks/handlers.test.ts

# 3. Production build verification
cd frontend && npm run build
cd backend && ./mvnw clean package -DskipTests
```

---

## ACCEPTANCE CRITERIA

- [ ] Initial referral application attachments render in Tab 1 ("Overview") under "转诊附件".
- [ ] Clicking a PDF or image attachment opens in a new browser tab with inline preview rendering.
- [ ] Clicking a DOCX or Word attachment triggers a browser download.
- [ ] Doctor feedback attachments remain isolated in Tab 4 ("Feedback").
- [ ] Row-level access control (`ReferralVisibilityPolicy`) is enforced before generating presigned URLs.
- [ ] 100% test passing on both backend (`./mvnw test`) and frontend (`vitest`).
