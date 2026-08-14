package com.medicalsystem.backend.storage.controller

import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.storage.dto.CompleteUploadResponse
import com.medicalsystem.backend.storage.dto.DownloadUrlResponse
import com.medicalsystem.backend.storage.dto.UploadIntentRequest
import com.medicalsystem.backend.storage.dto.UploadIntentResponse
import com.medicalsystem.backend.storage.service.FileApplicationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class FileController(
    private val fileApplicationService: FileApplicationService
) {

    @PostMapping("/files/upload-intent")
    @ResponseStatus(HttpStatus.CREATED)
    fun requestUploadIntent(
        @Valid @RequestBody req: UploadIntentRequest,
        @CurrentUser user: User
    ): UploadIntentResponse {
        return fileApplicationService.requestUploadIntent(req, user)
    }

    @PostMapping("/files/{id}/complete")
    fun completeUpload(
        @PathVariable id: Long,
        @CurrentUser user: User
    ): CompleteUploadResponse {
        return fileApplicationService.completeUpload(id, user)
    }

    @GetMapping("/referrals/{referralId}/attachments/{fileId}/download-url")
    fun getReferralAttachmentDownloadUrl(
        @PathVariable referralId: Long,
        @PathVariable fileId: Long,
        @RequestParam(defaultValue = "DOWNLOAD") intent: com.medicalsystem.backend.storage.domain.DownloadIntent,
        @CurrentUser user: User
    ): DownloadUrlResponse {
        return fileApplicationService.getReferralAttachmentDownloadUrl(referralId, fileId, intent, user)
    }
}
