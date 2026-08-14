package com.medicalsystem.backend.storage

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.storage.controller.FileController
import com.medicalsystem.backend.storage.domain.FileCategory
import com.medicalsystem.backend.storage.domain.FileStatus
import com.medicalsystem.backend.storage.dto.CompleteUploadResponse
import com.medicalsystem.backend.storage.dto.DownloadUrlResponse
import com.medicalsystem.backend.storage.dto.UploadIntentRequest
import com.medicalsystem.backend.storage.dto.UploadIntentResponse
import com.medicalsystem.backend.storage.service.FileApplicationService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

@ExtendWith(MockitoExtension::class)
class FileControllerTest {

    @Mock
    private lateinit var fileApplicationService: FileApplicationService

    @InjectMocks
    private lateinit var fileController: FileController

    private val testUser = User(id = 100L, name = "Dr. Test", email = EmailAddress("dr@univ.edu"), role = UserRole.DOCTOR)

    @Test
    fun `requestUploadIntent should delegate to service and return response`() {
        val req = UploadIntentRequest("scan.pdf", 1024L, "application/pdf", FileCategory.FEEDBACK_ATTACHMENT)
        val expected = UploadIntentResponse(1L, "http://localhost:9000/upload", "key", 300L)
        whenever(fileApplicationService.requestUploadIntent(req, testUser)).thenReturn(expected)

        val res = fileController.requestUploadIntent(req, testUser)

        assertEquals(expected, res)
        verify(fileApplicationService).requestUploadIntent(req, testUser)
    }

    @Test
    fun `completeUpload should delegate to service and return status`() {
        val expected = CompleteUploadResponse(1L, FileStatus.ACTIVE)
        whenever(fileApplicationService.completeUpload(1L, testUser)).thenReturn(expected)

        val res = fileController.completeUpload(1L, testUser)

        assertEquals(expected, res)
        verify(fileApplicationService).completeUpload(1L, testUser)
    }

    @Test
    fun `getReferralAttachmentDownloadUrl should delegate to service and return url`() {
        val expected = DownloadUrlResponse("http://localhost:9000/download", 60L)
        whenever(fileApplicationService.getReferralAttachmentDownloadUrl(5L, 1L, com.medicalsystem.backend.storage.domain.DownloadIntent.DOWNLOAD, testUser)).thenReturn(expected)

        val res = fileController.getReferralAttachmentDownloadUrl(5L, 1L, com.medicalsystem.backend.storage.domain.DownloadIntent.DOWNLOAD, testUser)

        assertEquals(expected, res)
        verify(fileApplicationService).getReferralAttachmentDownloadUrl(5L, 1L, com.medicalsystem.backend.storage.domain.DownloadIntent.DOWNLOAD, testUser)
    }
}
