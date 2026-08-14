# Feature: Hardened Attachment Preview & Download Architecture

This implementation plan is comprehensive, context-rich, and grounded in the Senior Architect Advisory Review. Validate codebase patterns and test sanity before executing.

---

## Feature Description

In the University Medical Screening & Psychiatric Referral System, users (Teachers, Head Councillors, Trial Admins, and Doctors) need to both preview medical evidence (PDFs, clinical photos) inline and download document files (Word `.docx`, Excel, records) seamlessly without browser popup blocks or blank screen flashes.

This feature delivers:
1. **Zero-Tab Silent Downloads**: Clicking the circular download icon or any document binary (DOCX/XLSX) starts an immediate browser download via an ephemeral DOM anchor without opening new browser tabs or triggering popup blockers.
2. **Safe Pre-Styled Tab Previews**: Clicking an in-browser previewable attachment (PDF/images) synchronously creates a tab pre-styled with a themed loading spinner, severs `window.opener` to eliminate reverse tab-nabbing vulnerabilities, and navigates via `win.location.replace(url)`.
3. **Backend Aggregate Ownership Verification (IDOR Fix)**: The backend asserts that the requested `fileId` is strictly owned by the given `referralId` or its diagnostic feedback before generating S3 credentials.
4. **Explicit `intent` Presigning Parameter**: The client explicitly passes `intent=PREVIEW` or `intent=DOWNLOAD` so S3 presigns the exact `inline` or `attachment` Content-Disposition header.
5. **Row-Level UI Loading Feedback**: The shared `AttachmentList` component displays an active progress spinner on the clicked item and disables interactions during network fetches.

---

## User Story

```text
As a medical staff member or counsellor reviewing a student's referral
I want to click an attachment card to preview clinical PDFs/images immediately, or click the download icon to silently download the file
So that I can review medical records without popup blocker interruptions, white screen flashes, or security vulnerabilities
```

---

## Problem Statement

1. **Popup Blocker Interception**: `window.open(url, '_blank')` called after `await fetch(...)` in `ReferralOverviewTab.tsx` is blocked by modern browsers (Safari, Chrome, Firefox) because the user interaction tick expires.
2. **Backend Aggregate IDOR Vulnerability**: `FileApplicationService.kt` currently verifies user visibility on `referralId` and fetches `fileId`, but never validates that `fileId` actually belongs to `referralId`.
3. **Inflexible MIME-Based Disposition**: Presigning logic hardcodes `inline` for PDFs, preventing users from directly downloading a PDF when clicking the circular download button.
4. **Missing Loading State & Tab-Nabbing Risk**: Opening `about:blank` without loading feedback leaves a blank white tab on slow networks, and failing to sever `win.opener` exposes the medical session to reverse tab-nabbing.

---

## Solution Statement

1. **Backend**:
   - Create `DownloadIntent` enum (`PREVIEW`, `DOWNLOAD`) in `storage/domain`.
   - Add `assertCanAccessAttachment(fileId: Long)` to `Referral` domain model.
   - Update `FileStoragePort` and `MinioStorageAdapter` to accept `intent: DownloadIntent` and format RFC 5987 UTF-8 encoded Content-Disposition headers.
   - Update `FileApplicationService` and `FileController` to accept `intent` and enforce aggregate attachment ownership.
2. **Frontend**:
   - Create `src/utils/fileType.ts` for centralized capability mapping (category, isPreviewable, icons).
   - Create `src/hooks/useAttachmentActions.ts` with silent download and safe preview tab management.
   - Update `AttachmentList.tsx` with `loadingFileId`, `onPreview`, and `onDownload` handlers.
   - Wire `ReferralOverviewTab.tsx` and `ReferralFeedbackTab.tsx` to `useAttachmentActions()`.
   - Align MSW mock handlers to handle `intent` query parameter.

---

## Feature Metadata

- **Feature Type**: Enhancement & Security Hardening
- **Estimated Complexity**: Medium
- **Primary Systems Affected**: `backend/storage`, `backend/model`, `backend/controller`, `frontend/hooks`, `frontend/components/common`, `frontend/components/records`
- **Dependencies**: AWS S3 SDK v2 (`S3Presigner`), React 19, TypeScript 5.8

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- `backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt` (lines 25-50) - Referral aggregate root.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/port/FileStoragePort.kt` (lines 6-12) - Presigned URL storage port interface.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/adapter/MinioStorageAdapter.kt` (lines 48-66) - MinIO S3 presigner implementation.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt` (lines 142-167) - File download URL application service.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/controller/FileController.kt` (lines 35-46) - REST file controller.
- `frontend/src/components/common/AttachmentList.tsx` (lines 20-80) - Reusable MD3 attachment list component.
- `frontend/src/components/records/ReferralOverviewTab.tsx` (lines 25-45) - Referral overview tab component.
- `frontend/src/components/records/ReferralFeedbackTab.tsx` (lines 15-35) - Referral feedback tab component.
- `frontend/src/api/files.ts` (lines 85-105) - Frontend API client for attachment download URLs.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/domain/DownloadIntent.kt`
- **IMPLEMENT**: Define domain enum:
  ```kotlin
  package com.medicalsystem.backend.storage.domain

  enum class DownloadIntent {
      PREVIEW,
      DOWNLOAD
  }
  ```
- **VALIDATE**: `./mvnw test-compile`

### Task 2: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt`
- **IMPLEMENT**: Add aggregate invariant validation method `assertCanAccessAttachment(fileId: Long)`:
  ```kotlin
  fun assertCanAccessAttachment(fileId: Long) {
      val isReferralAttachment = attachments.any { it.fileId == fileId }
      val isFeedbackAttachment = feedback?.attachments?.any { it.fileId == fileId } == true

      if (!isReferralAttachment && !isFeedbackAttachment) {
          throw com.medicalsystem.backend.exception.ResourceNotFoundException("Attachment with fileId $fileId does not belong to referral $id")
      }
  }
  ```
- **VALIDATE**: `./mvnw test-compile`

### Task 3: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/port/FileStoragePort.kt` & `MinioStorageAdapter.kt`
- **IMPLEMENT**:
  1. Update `FileStoragePort.generatePresignedDownloadUrl`:
     ```kotlin
     fun generatePresignedDownloadUrl(
         storageKey: String,
         originalFilename: String,
         mimeType: String,
         intent: com.medicalsystem.backend.storage.domain.DownloadIntent,
         duration: Duration
     ): URL
     ```
  2. In `MinioStorageAdapter.kt`:
     - Determine disposition based on `intent` AND MIME capability:
       ```kotlin
       val isPreviewable = mimeType == "application/pdf" || mimeType.startsWith("image/")
       val dispositionType = if (intent == DownloadIntent.PREVIEW && isPreviewable) "inline" else "attachment"
       val encodedFilename = java.net.URLEncoder.encode(originalFilename, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20")
       val sanitizedPlain = originalFilename.replace("\"", "").replace(";", "").trim()

       val getObjectRequest = GetObjectRequest.builder()
           .bucket(bucketName)
           .key(storageKey)
           .responseContentDisposition("$dispositionType; filename=\"$sanitizedPlain\"; filename*=UTF-8''$encodedFilename")
           .responseContentType(mimeType)
           .build()
       ```
- **VALIDATE**: `./mvnw test-compile`

### Task 4: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt`
- **IMPLEMENT**:
  1. Update `getReferralAttachmentDownloadUrl(referralId: Long, fileId: Long, intent: DownloadIntent, user: User)`:
     ```kotlin
     @Transactional(readOnly = true)
     fun getReferralAttachmentDownloadUrl(
         referralId: Long,
         fileId: Long,
         intent: DownloadIntent,
         user: User
     ): DownloadUrlResponse {
         val referral = referralRepository.findById(referralId).orElseThrow {
             ResourceNotFoundException("Referral with ID $referralId not found")
         }

         val visibleReferrals = referralRepository.findVisibleReferralsFor(user)
         if (visibleReferrals.none { it.id == referralId }) {
             throw ForbiddenException("Unauthorized to access attachments on referral $referralId")
         }

         // Enforce aggregate invariant ownership
         referral.assertCanAccessAttachment(fileId)

         val file = uploadedFileRepository.findById(fileId).orElseThrow {
             ResourceNotFoundException("File with ID $fileId not found")
         }

         val presignedUrl = fileStoragePort.generatePresignedDownloadUrl(
             storageKey = file.storageKey,
             originalFilename = file.originalName,
             mimeType = file.mimeType,
             intent = intent,
             duration = DOWNLOAD_PRESIGN_DURATION
         )

         return DownloadUrlResponse(
             downloadUrl = presignedUrl.toString(),
             expiresInSeconds = DOWNLOAD_PRESIGN_DURATION.seconds
         )
     }
     ```
- **VALIDATE**: `./mvnw test-compile`

### Task 5: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/controller/FileController.kt` & Tests
- **IMPLEMENT**:
  1. Update `getReferralAttachmentDownloadUrl`:
     ```kotlin
     @GetMapping("/referrals/{referralId}/attachments/{fileId}/download-url")
     fun getReferralAttachmentDownloadUrl(
         @PathVariable referralId: Long,
         @PathVariable fileId: Long,
         @RequestParam(defaultValue = "DOWNLOAD") intent: com.medicalsystem.backend.storage.domain.DownloadIntent,
         @CurrentUser user: User
     ): DownloadUrlResponse {
         return fileApplicationService.getReferralAttachmentDownloadUrl(referralId, fileId, intent, user)
     }
     ```
  2. Update unit tests in `FileApplicationServiceTest.kt` to test:
     - Success with `DownloadIntent.PREVIEW` and `DownloadIntent.DOWNLOAD`.
     - `ResourceNotFoundException` when `fileId` does not belong to `referral`.
- **VALIDATE**: `./mvnw test`

### Task 6: CREATE `frontend/src/utils/fileType.ts`
- **IMPLEMENT**: Centralized capability evaluator:
  ```typescript
  export type FileCategoryType = 'pdf' | 'image' | 'document' | 'other';

  export interface FileCapability {
    category: FileCategoryType;
    isPreviewable: boolean;
    iconName: string;
  }

  export function getFileCapability(filename: string, mimeType?: string): FileCapability {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return { category: 'pdf', isPreviewable: true, iconName: 'picture_as_pdf' };
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
      return { category: 'image', isPreviewable: true, iconName: 'image' };
    }
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      return { category: 'document', isPreviewable: false, iconName: 'description' };
    }
    return { category: 'other', isPreviewable: false, iconName: 'attach_file' };
  }
  ```
- **VALIDATE**: `cd frontend && npm run lint`

### Task 7: UPDATE `frontend/src/api/files.ts`
- **IMPLEMENT**: Pass `intent` query parameter in `getReferralAttachmentDownloadUrl`:
  ```typescript
  export async function getReferralAttachmentDownloadUrl(
    referralId: string | number,
    fileId: string | number,
    intent: 'PREVIEW' | 'DOWNLOAD' = 'DOWNLOAD',
    token?: string
  ): Promise<string> {
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/referrals/${referralId}/attachments/${fileId}/download-url?intent=${intent}`, {
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || '获取下载链接失败');
    }

    const data = await res.json();
    return data.downloadUrl;
  }
  ```
- **VALIDATE**: `cd frontend && npm run lint`

### Task 8: CREATE `frontend/src/hooks/useAttachmentActions.ts`
- **IMPLEMENT**: Create hook with silent download and safe preview window management:
  - `downloadAttachment({ referralId, fileId, name })`:
    1. Sets `loadingFileId`.
    2. Calls `getReferralAttachmentDownloadUrl(referralId, fileId, 'DOWNLOAD', session?.token)`.
    3. Creates hidden `<a href={url} download={name}>` and triggers `link.click()`.
  - `previewAttachment({ referralId, fileId, name })`:
    1. Evaluates `getFileCapability(name)`. If not previewable, delegates to `downloadAttachment`.
    2. Synchronously opens `const win = window.open('about:blank', '_blank')`.
    3. Sets `win.opener = null`.
    4. Writes styled HTML loading spinner to `win.document`.
    5. Calls `getReferralAttachmentDownloadUrl(referralId, fileId, 'PREVIEW', session?.token)`.
    6. Calls `win.location.replace(url)` (or writes friendly error message on catch).
- **VALIDATE**: `cd frontend && npm run lint`

### Task 9: UPDATE `frontend/src/components/common/AttachmentList.tsx`
- **IMPLEMENT**:
  - Accept `loadingFileId?: string | number | null`, `onPreview?: (file: Attachment) => void`.
  - Use `getFileCapability(file.name)` for icons and preview badges.
  - Card click invokes `onPreview` (if previewable) or `onDownload`.
  - Download icon button invokes `onDownload` with `e.stopPropagation()`.
  - Display spinner `progress_activity` when `loadingFileId === file.fileId`.
- **VALIDATE**: `cd frontend && npx vitest run src/components/common/AttachmentList.test.tsx`

### Task 10: UPDATE `frontend/src/components/records/ReferralOverviewTab.tsx` & `ReferralFeedbackTab.tsx`
- **IMPLEMENT**:
  - Replace raw `handleDownload` with `const { previewAttachment, downloadAttachment, loadingFileId } = useAttachmentActions();`.
  - Pass `onPreview={file => previewAttachment({ referralId: referral.id, fileId: file.fileId!, name: file.name })}`.
  - Pass `onDownload={file => downloadAttachment({ referralId: referral.id, fileId: file.fileId!, name: file.name })}`.
  - Pass `loadingFileId={loadingFileId}` to `<AttachmentList />`.
- **VALIDATE**: `cd frontend && npx vitest run src/components/records/`

### Task 11: UPDATE `frontend/src/mocks/handlers.ts`
- **IMPLEMENT**: Support `intent` query parameter in `/api/referrals/:referralId/attachments/:fileId/download-url` mock handler.
- **VALIDATE**: `cd frontend && npx vitest run src/mocks/handlers.test.ts`

---

## TESTING STRATEGY

### Unit Tests
- `ReferralTest.kt`: Test `assertCanAccessAttachment` throws `ResourceNotFoundException` when `fileId` does not match, and succeeds when `fileId` is present.
- `FileApplicationServiceTest.kt`: Assert `getReferralAttachmentDownloadUrl` calls `fileStoragePort` with given `intent`.
- `AttachmentList.test.tsx`: Test card click triggers `onPreview` for PDFs and `onDownload` for DOCX.
- `ReferralOverviewTab.test.tsx`: Test preview and download interactions with mocked `useAttachmentActions`.

### Integration Tests
- Verify S3 SigV4 URL contains valid query params and RFC 5987 headers.
- Full suite test passes without regression.

---

## VALIDATION COMMANDS

```bash
# 1. Backend test suite
cd backend && ./mvnw test

# 2. Frontend typecheck and unit tests
cd frontend && npm run lint
cd frontend && npx vitest run src/components/common/AttachmentList.test.tsx src/components/records/ src/mocks/handlers.test.ts

# 3. Frontend production build
cd frontend && npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] Circular download button triggers a silent browser file download without opening blank tabs.
- [ ] Clicking a PDF or image card opens a themed loading preview tab that transitions to the rendered file.
- [ ] Clicking a Word/DOCX card triggers direct download.
- [ ] Backend validates that `fileId` belongs to `referralId` before issuing URLs (IDOR protection).
- [ ] Backend sets `inline` for `intent=PREVIEW` and `attachment` for `intent=DOWNLOAD`.
- [ ] 100% test pass rate across backend (`./mvnw test`) and frontend (`vitest`).
