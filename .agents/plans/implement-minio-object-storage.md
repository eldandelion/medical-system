# Feature: MinIO Object Storage Subsystem (Architecturally Hardened)

## Executive Architectural Summary
This feature was formally reviewed and hardened through Domain-Driven Design (DDD) and Clean Code / Software Craftsmanship consultations.
- **DDD Quality Score (9.5/10)**: Strict separation between the generic `storage` subdomain (`StoredFile` aggregate root, `FileStoragePort`) and core clinical domain (`Referral`, `DoctorFeedback`, immutable `AttachmentReference` value objects). Ephemeral presigned URLs are strictly separated from persistent domain state.
- **Clean Code & Robustness Score (9.5/10)**:
  1. **Zero Race Conditions**: Replaced unreliable asynchronous MinIO S3 webhooks with a deterministic **Client-Driven Confirmation Handshake** (`POST /api/files/{id}/complete`).
  2. **Docker Network Parity**: Resolved AWS SigV4 host signature mismatches using decoupled `S3Client` (internal `minio:9000`) and `S3Presigner` (external `localhost:9000`).
  3. **Deep MIME Inspection**: Added **Apache Tika 4KB range inspection** to prevent spoofed `.docx` files, disguised executables, or zip bombs.
  4. **Stored XSS Defense**: Forced `response-content-disposition=attachment` on presigned GET URLs.
  5. **Medical Compliance**: Differentiated transient unattached uploads (purged after 24h) from committed clinical attachments (preserved per medical retention rules).
  6. **Multi-Node Resiliency**: Guarded scheduled retention cleanups with **ShedLock** on MySQL.

---

## Feature Description
A high-throughput, secure, S3-compatible Object Storage subsystem utilizing MinIO to store avatars, clinical referral attachments (PDFs, DOCX, scans), and doctor diagnostic feedback. The solution utilizes direct client-to-MinIO streaming via short-lived presigned URLs to eliminate JVM memory and I/O bottlenecks, while maintaining strict row-level authorization via Spring Boot.

## User Story
```
As a Counselor, Doctor, or Student,
I want to securely upload and download clinical referral attachments and profile avatars without system latency,
So that sensitive medical evidence is reliably preserved, verified for integrity, and protected under strict row-level clinical visibility policies.
```

## Problem Statement
Currently, attachment uploads in `ReferralCreationForm.tsx` and `FeedbackCreationForm.tsx` are disabled or stubbed out. The backend lacks an object storage implementation. Storing raw binary files inside MySQL or streaming 25MB clinical PDFs through Spring Boot would cause thread pool starvation and Out-Of-Memory (OOM) errors. Furthermore, naive direct uploads can lead to orphaned files, malware injection, and cross-student data leakage without deep inspection and row-level access control.

## Solution Statement
Implement a containerized MinIO S3 service in `docker-compose.yml` with dual-endpoint configuration. Build a modular `storage` module in Spring Boot providing:
1. `POST /api/files/upload-intent`: Issues 5-minute Presigned PUT URLs with pinned MIME types and size constraints.
2. `POST /api/files/{id}/complete`: Handshake endpoint that fetches 4KB via S3 Range Request, executes Apache Tika deep inspection, and flips status to `ACTIVE`.
3. `POST /api/referrals` & `POST /api/feedback`: Atomically claims `ACTIVE` files as immutable `AttachmentReference` value objects.
4. `GET /api/referrals/{id}/attachments/{fileId}/download-url`: Verifies `ReferralVisibilityPolicy` and issues a 60-second Presigned GET URL with forced attachment disposition.
5. `FileRetentionScheduler`: Nightly ShedLock-protected cron job purging orphaned `PENDING` uploads (>24h).
6. Frontend upload/download integration in `ReferralCreationForm.tsx`, `FeedbackCreationForm.tsx`, and `AttachmentList.tsx`.

## Feature Metadata
- **Feature Type**: New Capability / Infrastructure & Architecture Hardening
- **Estimated Complexity**: High
- **Primary Systems Affected**: `backend` (storage, entity, repository, service, controller), `frontend` (creation forms, attachment lists, API client), `docker-compose.yml`
- **Dependencies**: AWS Java SDK v2 S3 (`software.amazon.awssdk:s3`), Apache Tika Core (`org.apache.tika:tika-core`), ShedLock (`net.javacrumbs.shedlock:shedlock-spring`)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)
- `docker-compose.yml` (lines 1-53) - Why: Container orchestration. MinIO service must be integrated.
- `backend/pom.xml` (lines 30-90) - Why: Dependencies for AWS S3 SDK, Apache Tika, ShedLock.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/AttachmentEntity.kt` (lines 1-22) - Why: Existing JPA entity mapping for referral attachments. Must add `fileId` linkage.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/FeedbackAttachmentEntity.kt` (lines 1-23) - Why: Existing JPA entity mapping for doctor feedback attachments.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralAttachment.kt` (lines 1-7) - Why: Core domain model. Must be refactored to immutable value object with `fileId`.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralVisibilityPolicy.kt` (lines 1-51) - Why: Enforces row-level visibility when generating download URLs.
- `backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt` (lines 1-60) - Why: Standard 1-based integer converters for `FileCategory` and `FileStatus`.
- `frontend/src/components/records/ReferralCreationForm.tsx` (lines 38-49, 360-390) - Why: Form UI where attachments are selected and uploaded.
- `frontend/src/components/records/FeedbackCreationForm.tsx` (lines 26-30, 50-65) - Why: Form UI for doctor clinical feedback attachments.
- `frontend/src/components/common/AttachmentList.tsx` (lines 1-40) - Why: Attachment rendering component with download/delete actions.

### New Files to Create
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/domain/FileStatus.kt` - 1-based enum (`PENDING_UPLOAD`, `ACTIVE`, `REJECTED`, `SOFT_DELETED`).
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/domain/FileCategory.kt` - 1-based enum (`AVATAR`, `REFERRAL_ATTACHMENT`, `FEEDBACK_ATTACHMENT`).
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/domain/StoredFile.kt` - Pure domain aggregate root for file records.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/entity/UploadedFileEntity.kt` - JPA entity mapping table `uploaded_files`.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/repository/UploadedFileRepository.kt` - Spring Data JPA repository.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/port/FileStoragePort.kt` - Interface for presigned URLs, S3 range inspection, and object deletion.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/adapter/MinioStorageAdapter.kt` - S3 SDK adapter implementing `FileStoragePort`.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/config/MinioConfig.kt` - Dual-endpoint `S3Client` & `S3Presigner` beans.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileValidationService.kt` - Apache Tika 4KB deep MIME & signature verification.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt` - Coordinates upload intents, handshakes, and download authorization.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/scheduler/FileRetentionScheduler.kt` - ShedLock-protected cron for purging abandoned uploads.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/controller/FileController.kt` - REST controller for upload-intent, complete handshake, and download URLs.
- `backend/src/main/kotlin/com/medicalsystem/backend/storage/dto/StorageDtos.kt` - DTOs for upload intent, completion, and download tokens.
- `backend/src/test/kotlin/com/medicalsystem/backend/storage/FileValidationServiceTest.kt` - Unit tests for magic bytes and Tika inspection.
- `backend/src/test/kotlin/com/medicalsystem/backend/storage/FileApplicationServiceTest.kt` - Unit tests for storage orchestration.
- `backend/src/test/kotlin/com/medicalsystem/backend/storage/FileControllerTest.kt` - MockMvc tests for file endpoints.
- `frontend/src/api/files.ts` - Frontend client helper for upload intent, direct PUT streaming, and completion handshake.

---

## IMPLEMENTATION PLAN

### Phase 0: Branch Initialization & Infrastructure
- **Branch Creation**: Create and switch to new git branch `feature/minio-object-storage`.
- **Docker Compose**: Add `minio` and `minio-init` (bucket provisioning & CORS policy setup) to `docker-compose.yml`.

### Phase 1: Dependencies & Core Storage Domain (Backend)
- Add AWS S3 SDK, Apache Tika, and ShedLock dependencies to `backend/pom.xml`.
- Implement `FileStatus` and `FileCategory` with JPA 1-based integer converters in `EnumConverters.kt`.
- Create `StoredFile` domain aggregate and `UploadedFileEntity` mapping `uploaded_files`.
- Create `UploadedFileRepository` and `shedlock` table schema mapping.

### Phase 2: S3 Client, Validation & Storage Port Adapter
- Configure `MinioConfig` with decoupled internal (`http://minio:9000`) and external (`http://localhost:9000`) endpoints.
- Implement `FileValidationService` using Apache Tika on 4KB byte arrays.
- Implement `MinioStorageAdapter` implementing `FileStoragePort` (Presigned PUT, Presigned GET with `attachment` disposition, `headObject`, range `getObject`, `deleteObject`).

### Phase 3: Application Service, Controllers & Domain Integration
- Implement `FileApplicationService` managing upload intents, complete handshakes, and claiming files.
- Implement `FileController` (`POST /api/files/upload-intent`, `POST /api/files/{id}/complete`, `GET /api/referrals/{referralId}/attachments/{fileId}/download-url`).
- Update `ReferralService` and `FeedbackService` to atomically claim verified files and attach `fileId`s.
- Implement `FileRetentionScheduler` with `@SchedulerLock`.

### Phase 4: Frontend Direct-Upload Pipeline & UI Wiring
- Create `frontend/src/api/files.ts` with direct S3 PUT streaming and completion handshake.
- Wire file input and upload progress into `ReferralCreationForm.tsx` and `FeedbackCreationForm.tsx`.
- Connect download buttons in `AttachmentList.tsx` to request presigned download URLs.

### Phase 5: Verification & Automated Testing
- Execute unit tests for validation, services, and controllers.
- Validate end-to-end upload and download flow against local MinIO.

---

## STEP-BY-STEP TASKS

### Task 0: Git Branch Initialization
- **ACTION**: `run_command`
- **IMPLEMENT**: `git checkout -b feature/minio-object-storage`
- **GOTCHA**: Verify clean working tree before switching.
- **VALIDATE**: `git status`

---

### Task 1: Docker Compose MinIO Infrastructure
- **ACTION**: UPDATE `docker-compose.yml`
- **IMPLEMENT**:
  - Add `minio` service with image `minio/minio:RELEASE.2024-05-10T01-41-38Z`.
  - Expose ports `9000:9000` (API) and `9001:9001` (Console).
  - Set `MINIO_SERVER_URL: "http://localhost:9000"`.
  - Add `minio-init` helper container running `minio/mc` to create buckets (`medical-attachments`, `medical-avatars`) and set CORS rules allowing `GET, PUT, OPTIONS`.
  - Connect to `app-network`.
  - Add `minio-data` persistent volume.
- **VALIDATE**: `docker compose config`

---

### Task 2: Backend Dependencies (`pom.xml`)
- **ACTION**: UPDATE `backend/pom.xml`
- **IMPLEMENT**:
  ```xml
  <!-- AWS SDK v2 for S3 -->
  <dependency>
      <groupId>software.amazon.awssdk</groupId>
      <artifactId>s3</artifactId>
      <version>2.25.60</version>
  </dependency>
  <!-- Apache Tika Core for Deep MIME & Magic Byte Inspection -->
  <dependency>
      <groupId>org.apache.tika</groupId>
      <artifactId>tika-core</artifactId>
      <version>2.9.2</version>
  </dependency>
  <!-- ShedLock for Distributed Cron Safety -->
  <dependency>
      <groupId>net.javacrumbs.shedlock</groupId>
      <artifactId>shedlock-spring</artifactId>
      <version>5.14.0</version>
  </dependency>
  <dependency>
      <groupId>net.javacrumbs.shedlock</groupId>
      <artifactId>shedlock-provider-jdbc-template</artifactId>
      <version>5.14.0</version>
  </dependency>
  ```
- **VALIDATE**: `./mvnw dependency:resolve`

---

### Task 3: Domain Enums & 1-Based Converters
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/domain/StorageEnums.kt`
- **IMPLEMENT**:
  ```kotlin
  package com.medicalsystem.backend.storage.domain

  enum class FileStatus {
      PENDING_UPLOAD, // 1
      ACTIVE,         // 2
      REJECTED,       // 3
      SOFT_DELETED    // 4
  }

  enum class FileCategory {
      AVATAR,               // 1
      REFERRAL_ATTACHMENT,  // 2
      FEEDBACK_ATTACHMENT   // 3
  }
  ```
- **ACTION**: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt`
- **IMPLEMENT**: Add `FileStatusConverter` and `FileCategoryConverter` using `getIdFromEnum` / `getEnumFromId`.
- **VALIDATE**: `./mvnw compile`

---

### Task 4: Storage Entities & Persistence Mapping
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/entity/UploadedFileEntity.kt`
- **IMPLEMENT**:
  - Entity mapped to table `uploaded_files`.
  - Properties: `id` (BIGINT UNSIGNED generated), `storageKey` (VARCHAR 500), `originalName` (VARCHAR 255), `mimeType` (VARCHAR 100), `sizeBytes` (BIGINT), `uploadedById` (BIGINT), `category` (FileCategory), `status` (FileStatus), `createdAt` (LocalDateTime), `deletedAt` (LocalDateTime?).
- **ACTION**: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/AttachmentEntity.kt`
- **IMPLEMENT**: Add `var fileId: Long? = null` mapped to column `file_id`.
- **ACTION**: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/FeedbackAttachmentEntity.kt`
- **IMPLEMENT**: Add `var fileId: Long? = null` mapped to column `file_id`.
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/repository/UploadedFileRepository.kt`
- **IMPLEMENT**: Spring Data JPA repository with `findAllByStatusAndCreatedAtBefore` and `findAllByDeletedAtBefore`.
- **VALIDATE**: `./mvnw compile`

---

### Task 5: S3 Configuration & Dual-Endpoint Setup
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/config/MinioConfig.kt`
- **IMPLEMENT**:
  - Read properties: `storage.s3.endpoint-internal`, `storage.s3.endpoint-external`, `storage.s3.access-key`, `storage.s3.secret-key`, `storage.s3.bucket`, `storage.s3.region`.
  - Define `@Bean fun s3Client(): S3Client` using `internalEndpoint`.
  - Define `@Bean fun s3Presigner(): S3Presigner` using `externalEndpoint`.
- **ACTION**: UPDATE `backend/src/main/resources/application.properties` and `backend/src/test/resources/application.properties`
- **IMPLEMENT**: Add default S3 configuration properties.
- **VALIDATE**: `./mvnw compile`

---

### Task 6: File Validation Service (Apache Tika Deep Inspection)
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileValidationService.kt`
- **IMPLEMENT**:
  - Whitelist: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`.
  - Method `fun validateHeader(bytes: ByteArray, declaredMime: String): Boolean`: Uses `Tika().detect(bytes)` and validates against declared MIME.
- **ACTION**: CREATE `backend/src/test/kotlin/com/medicalsystem/backend/storage/FileValidationServiceTest.kt`
- **IMPLEMENT**: Unit tests asserting valid PDF (`%PDF-`), valid PNG, valid DOCX, and rejecting fake PDFs / executables.
- **VALIDATE**: `./mvnw test -Dtest=FileValidationServiceTest`

---

### Task 7: Storage Port & MinIO Adapter
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/port/FileStoragePort.kt`
- **IMPLEMENT**:
  - `fun generatePresignedUploadUrl(storageKey: String, mimeType: String, sizeBytes: Long, duration: Duration): URL`
  - `fun generatePresignedDownloadUrl(storageKey: String, originalFilename: String, duration: Duration): URL`
  - `fun getObjectHeaderBytes(storageKey: String, lengthBytes: Long): ByteArray`
  - `fun getObjectSize(storageKey: String): Long`
  - `fun deleteObject(storageKey: String)`
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/adapter/MinioStorageAdapter.kt`
- **IMPLEMENT**: Implement `FileStoragePort` using `s3Client` and `s3Presigner`. Ensure download presigned URL includes `responseContentDisposition("attachment; filename=\"...\"")`.
- **VALIDATE**: `./mvnw compile`

---

### Task 8: Storage Application Service & DTOs
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/dto/StorageDtos.kt`
- **IMPLEMENT**:
  - `UploadIntentRequest(filename: String, sizeBytes: Long, mimeType: String, category: FileCategory)`
  - `UploadIntentResponse(fileId: Long, presignedUploadUrl: String, storageKey: String, expiresInSeconds: Long)`
  - `CompleteUploadRequest(storageKey: String)`
  - `CompleteUploadResponse(fileId: Long, status: FileStatus)`
  - `DownloadUrlResponse(downloadUrl: String, expiresInSeconds: Long)`
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/service/FileApplicationService.kt`
- **IMPLEMENT**:
  - `requestUploadIntent(req: UploadIntentRequest, user: User): UploadIntentResponse`
  - `completeUpload(fileId: Long, user: User): CompleteUploadResponse` (Performs 4KB range check via Tika, verifies size via `headObject`, updates status to `ACTIVE` or `REJECTED`).
  - `claimFiles(fileIds: List<Long>, uploaderId: Long): List<UploadedFileEntity>`
  - `getReferralAttachmentDownloadUrl(referralId: Long, fileId: Long, user: User): DownloadUrlResponse` (Verifies `ReferralVisibilityPolicy`).
- **ACTION**: CREATE `backend/src/test/kotlin/com/medicalsystem/backend/storage/FileApplicationServiceTest.kt`
- **VALIDATE**: `./mvnw test -Dtest=FileApplicationServiceTest`

---

### Task 9: Storage REST Controller
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/controller/FileController.kt`
- **IMPLEMENT**:
  - `POST /api/files/upload-intent` (@Valid @RequestBody req, @CurrentUser user) -> `201 Created`
  - `POST /api/files/{id}/complete` (@PathVariable id, @CurrentUser user) -> `200 OK`
  - `GET /api/referrals/{referralId}/attachments/{fileId}/download-url` (@PathVariable referralId, @PathVariable fileId, @CurrentUser user) -> `200 OK`
- **ACTION**: CREATE `backend/src/test/kotlin/com/medicalsystem/backend/storage/FileControllerTest.kt`
- **VALIDATE**: `./mvnw test -Dtest=FileControllerTest`

---

### Task 10: Wire Attachments in Referral & Feedback Services
- **ACTION**: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/AttachmentDto.kt`
- **IMPLEMENT**: Add `val fileId: Long? = null` to `AttachmentDto`.
- **ACTION**: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/FeedbackCreationRequest.kt`
- **IMPLEMENT**: Add `val fileId: Long? = null` to `FeedbackAttachmentDto`.
- **ACTION**: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/ReferralService.kt` & `backend/src/main/kotlin/com/medicalsystem/backend/service/FeedbackService.kt`
- **IMPLEMENT**: Atomically claim `fileId` attachments during `createReferral` and `submitFeedback`.
- **VALIDATE**: `./mvnw test`

---

### Task 11: ShedLock Distributed Retention Scheduler
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/config/SchedulerConfig.kt`
- **IMPLEMENT**: `@EnableScheduling`, `@EnableSchedulerLock`, and `LockProvider` bean via `JdbcTemplateLockProvider`.
- **ACTION**: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/storage/scheduler/FileRetentionScheduler.kt`
- **IMPLEMENT**:
  - `@Scheduled(cron = "0 0 3 * * ?")` (3 AM daily) with `@SchedulerLock(name = "FileRetentionTask", lockAtLeastFor = "PT1M", lockAtMostFor = "PT15M")`.
  - Purge `PENDING_UPLOAD` files older than 24 hours from MinIO and MySQL.
  - Purge `SOFT_DELETED` non-clinical files older than 7 days.
- **VALIDATE**: `./mvnw compile`

---

### Task 12: Frontend API Client (`frontend/src/api/files.ts`)
- **ACTION**: CREATE `frontend/src/api/files.ts`
- **IMPLEMENT**:
  - `uploadFileDirect(file: File, category: 'REFERRAL_ATTACHMENT' | 'FEEDBACK_ATTACHMENT' | 'AVATAR', token: string): Promise<{ fileId: number; name: string; size: string }>`:
    1. Calls `POST /api/files/upload-intent` with `{ filename: file.name, sizeBytes: file.size, mimeType: file.type, category }`.
    2. Calls `fetch(presignedUploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })`.
    3. Calls `POST /api/files/${fileId}/complete`.
    4. Returns `{ fileId, name: file.name, size: formatBytes(file.size) }`.
  - `fetchDownloadUrl(referralId: number | string, fileId: number | string, token: string): Promise<string>`:
    1. Calls `GET /api/referrals/${referralId}/attachments/${fileId}/download-url`.
    2. Returns `res.downloadUrl`.
- **VALIDATE**: `npm run lint`

---

### Task 13: Wire Upload & Download in Frontend UI
- **ACTION**: UPDATE `frontend/src/components/records/ReferralCreationForm.tsx`
- **IMPLEMENT**:
  - Add hidden `<input type="file" ref={fileInputRef} multiple onChange={handleFileSelect} />`.
  - Trigger `uploadFileDirect` for each selected file and append to `formData.attachments` with `fileId`.
  - Show upload loading indicator while streaming.
- **ACTION**: UPDATE `frontend/src/components/records/FeedbackCreationForm.tsx`
- **IMPLEMENT**:
  - Enable attachment selection and upload using `uploadFileDirect`.
  - Include uploaded `attachments: [{ name, sizeBytes, fileId }]` in the submit payload.
- **ACTION**: UPDATE `frontend/src/components/common/AttachmentList.tsx`
- **IMPLEMENT**:
  - Wire `onDownload` handler to fetch the presigned download URL and trigger browser download.
- **VALIDATE**: `npm run lint && npm run test`

---

## TESTING STRATEGY

### Unit Tests
- `FileValidationServiceTest`: Assert detection of valid PDF (`%PDF-1.4`), JPEG (`\xFF\xD8\xFF`), PNG (`\x89PNG`), DOCX (`PK\x03\x04` with Tika OpenXML detection), and reject executable binaries or invalid MIME types.
- `FileApplicationServiceTest`: Mock `UploadedFileRepository` and `FileStoragePort` to test intent generation, successful handshake completion, and failure state transitions (`REJECTED`).
- `FileControllerTest`: MockMvc tests for `POST /api/files/upload-intent`, `POST /api/files/{id}/complete`, and role-based access control.

### Integration Tests
- Verify `ReferralJpaSpecificationTest` and `ReferralServiceTest` remain 100% green with new `file_id` column mappings.
- End-to-end Docker integration verifying `minio` container health and S3 connectivity.

### Edge Cases Tested
1. **Host Mismatch**: Browser accessing presigned URL on `localhost:9000` while backend runs on internal Docker network.
2. **File Spoofing**: An executable renamed to `report.pdf` uploaded to MinIO is caught and rejected by `FileValidationService` during the complete handshake.
3. **Download RLS**: An unauthorized user attempting to request a download URL for a referral outside their visibility scope receives `403 Forbidden`.
4. **Stale Abandoned Uploads**: `FileRetentionScheduler` deletes orphaned `PENDING_UPLOAD` objects older than 24h.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
# Frontend Lint & Type Check
cd /Volumes/Files/Programming/medical-system/frontend && npm run lint

# Backend Compilation
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw compile
```

### Level 2: Unit Tests
```bash
# Backend Storage & Core Tests
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw test

# Frontend Vitest Suite
cd /Volumes/Files/Programming/medical-system/frontend && npm run test
```

### Level 3: Integration & Package Verification
```bash
# Full Backend Build
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw clean package -DskipTests=false

# Full Frontend Build
cd /Volumes/Files/Programming/medical-system/frontend && npm run build
```

---

## ACCEPTANCE CRITERIA
- [ ] Switched to a new dedicated git branch `feature/minio-object-storage` before making code changes.
- [ ] MinIO container added to `docker-compose.yml` with automated bucket initialization and CORS policies.
- [ ] Direct client upload via Presigned PUT and synchronous `POST /api/files/{id}/complete` handshake implemented.
- [ ] Apache Tika 4KB range inspection validates MIME integrity and rejects spoofed files.
- [ ] Presigned GET download URLs enforce row-level `ReferralVisibilityPolicy` and attachment disposition headers.
- [ ] Abandoned `PENDING_UPLOAD` files automatically cleaned up via ShedLock-protected cron.
- [ ] Attachment upload and download fully functional in `ReferralCreationForm.tsx` and `FeedbackCreationForm.tsx`.
- [ ] All unit, integration, and build commands pass with 0 errors.

---

## COMPLETION CHECKLIST
- [ ] All tasks executed in order from Task 0 to Task 13.
- [ ] `git status` confirms active branch is `feature/minio-object-storage`.
- [ ] Full backend test suite passes (`./mvnw test`).
- [ ] Full frontend test suite passes (`npm run test`).
- [ ] Code strictly follows `GEMINI.md` conventions (1-based enums, language-agnostic backend, defensive rendering).
