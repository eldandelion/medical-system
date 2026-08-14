package com.medicalsystem.backend.storage

import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.Referral
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.storage.domain.FileCategory
import com.medicalsystem.backend.storage.domain.FileStatus
import com.medicalsystem.backend.storage.dto.UploadIntentRequest
import com.medicalsystem.backend.storage.entity.UploadedFileEntity
import com.medicalsystem.backend.storage.port.FileStoragePort
import com.medicalsystem.backend.storage.repository.UploadedFileRepository
import com.medicalsystem.backend.storage.service.FileApplicationService
import com.medicalsystem.backend.storage.service.FileValidationService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.net.URI
import java.net.URL
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockitoExtension::class)
class FileApplicationServiceTest {

    @Mock private lateinit var uploadedFileRepository: UploadedFileRepository
    @Mock private lateinit var fileStoragePort: FileStoragePort
    @Mock private lateinit var fileValidationService: FileValidationService
    @Mock private lateinit var referralRepository: ReferralRepository

    private lateinit var service: FileApplicationService

    private val testUser = User(id = 101L, name = "Counselor Zhang", role = UserRole.TEACHER, email = com.medicalsystem.backend.model.EmailAddress("zhang@univ.edu"))

    @BeforeEach
    fun setup() {
        service = FileApplicationService(
            uploadedFileRepository,
            fileStoragePort,
            fileValidationService,
            referralRepository
        )
    }

    @Test
    fun `requestUploadIntent should succeed and return presigned URL`() {
        val req = UploadIntentRequest(
            filename = "report.pdf",
            sizeBytes = 1024L,
            mimeType = "application/pdf",
            category = FileCategory.REFERRAL_ATTACHMENT
        )
        whenever(fileValidationService.isAllowedMimeType("application/pdf")).thenReturn(true)
        whenever(uploadedFileRepository.save(any<UploadedFileEntity>())).thenAnswer { invocation ->
            val e = invocation.getArgument<UploadedFileEntity>(0)
            e.id = 1L
            e
        }
        whenever(fileStoragePort.generatePresignedUploadUrl(any(), eq("application/pdf"), eq(1024L), any()))
            .thenReturn(URI.create("http://localhost:9000/upload").toURL())

        val res = service.requestUploadIntent(req, testUser)

        assertNotNull(res)
        assertEquals(1L, res.fileId)
        assertTrue(res.presignedUploadUrl.contains("upload"))
        verify(uploadedFileRepository).save(any())
    }

    @Test
    fun `requestUploadIntent should throw ValidationException for oversized file`() {
        val req = UploadIntentRequest(
            filename = "huge.pdf",
            sizeBytes = 30L * 1024L * 1024L, // 30MB (>25MB)
            mimeType = "application/pdf",
            category = FileCategory.REFERRAL_ATTACHMENT
        )
        assertThrows(ValidationException::class.java) {
            service.requestUploadIntent(req, testUser)
        }
    }

    @Test
    fun `completeUpload should verify header bytes and activate file`() {
        val fileEntity = UploadedFileEntity(
            id = 1L,
            storageKey = "referrals/abc.pdf",
            originalName = "report.pdf",
            mimeType = "application/pdf",
            sizeBytes = 1024L,
            uploadedById = testUser.id,
            category = FileCategory.REFERRAL_ATTACHMENT,
            status = FileStatus.PENDING_UPLOAD
        )
        whenever(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(fileEntity))
        whenever(fileStoragePort.getObjectHeaderBytes("referrals/abc.pdf", 4096)).thenReturn("%PDF-1.4".toByteArray())
        whenever(fileValidationService.validateHeader(any(), eq("application/pdf"))).thenReturn(true)

        val res = service.completeUpload(1L, testUser)

        assertEquals(FileStatus.ACTIVE, res.status)
        assertEquals(FileStatus.ACTIVE, fileEntity.status)
        verify(uploadedFileRepository).save(fileEntity)
    }

    @Test
    fun `completeUpload should reject and delete file when magic bytes invalid`() {
        val fileEntity = UploadedFileEntity(
            id = 1L,
            storageKey = "referrals/fake.pdf",
            originalName = "fake.pdf",
            mimeType = "application/pdf",
            sizeBytes = 1024L,
            uploadedById = testUser.id,
            category = FileCategory.REFERRAL_ATTACHMENT,
            status = FileStatus.PENDING_UPLOAD
        )
        whenever(uploadedFileRepository.findById(1L)).thenReturn(Optional.of(fileEntity))
        whenever(fileStoragePort.getObjectHeaderBytes("referrals/fake.pdf", 4096)).thenReturn("MZ executable".toByteArray())
        whenever(fileValidationService.validateHeader(any(), eq("application/pdf"))).thenReturn(false)

        val res = service.completeUpload(1L, testUser)

        assertEquals(FileStatus.REJECTED, res.status)
        assertEquals(FileStatus.REJECTED, fileEntity.status)
        verify(fileStoragePort).deleteObject("referrals/fake.pdf")
        verify(uploadedFileRepository).save(fileEntity)
    }

    @Test
    fun `getReferralAttachmentDownloadUrl should enforce visibility, verify aggregate attachment ownership and return download URL`() {
        val referral = Referral(
            id = 50L,
            studentId = 200L,
            referredById = testUser.id,
            title = "Test",
            description = "Desc",
            type = ReferralType.INITIAL,
            riskLevel = RiskStatus.LOW,
            status = ReferralStatus.AWAITING_APPROVAL,
            date = LocalDateTime.now(),
            attachments = mutableListOf(
                com.medicalsystem.backend.model.ReferralAttachment(
                    file = com.medicalsystem.backend.model.FileReference(
                        name = "report.pdf",
                        sizeBytes = 1024L,
                        url = java.net.URI("http://localhost")
                    ),
                    fileId = 10L
                )
            )
        )
        val fileEntity = UploadedFileEntity(
            id = 10L,
            storageKey = "referrals/attachment.pdf",
            originalName = "report.pdf",
            mimeType = "application/pdf",
            sizeBytes = 1024L,
            uploadedById = testUser.id,
            category = FileCategory.REFERRAL_ATTACHMENT,
            status = FileStatus.ACTIVE
        )

        whenever(referralRepository.findById(50L)).thenReturn(Optional.of(referral))
        whenever(referralRepository.findVisibleReferralsFor(testUser)).thenReturn(listOf(referral))
        whenever(uploadedFileRepository.findById(10L)).thenReturn(Optional.of(fileEntity))
        whenever(fileStoragePort.generatePresignedDownloadUrl(eq("referrals/attachment.pdf"), eq("report.pdf"), eq("application/pdf"), eq(com.medicalsystem.backend.storage.domain.DownloadIntent.PREVIEW), any()))
            .thenReturn(URI.create("http://localhost:9000/download").toURL())

        val res = service.getReferralAttachmentDownloadUrl(50L, 10L, com.medicalsystem.backend.storage.domain.DownloadIntent.PREVIEW, testUser)

        assertNotNull(res)
        assertTrue(res.downloadUrl.contains("download"))
    }

    @Test
    fun `getReferralAttachmentDownloadUrl should throw ResourceNotFoundException when fileId not attached to referral`() {
        val referral = Referral(
            id = 50L,
            studentId = 200L,
            referredById = testUser.id,
            title = "Test",
            description = "Desc",
            type = ReferralType.INITIAL,
            riskLevel = RiskStatus.LOW,
            status = ReferralStatus.AWAITING_APPROVAL,
            date = LocalDateTime.now(),
            attachments = mutableListOf() // No attachment with fileId 999
        )

        whenever(referralRepository.findById(50L)).thenReturn(Optional.of(referral))
        whenever(referralRepository.findVisibleReferralsFor(testUser)).thenReturn(listOf(referral))

        assertThrows(com.medicalsystem.backend.exception.ResourceNotFoundException::class.java) {
            service.getReferralAttachmentDownloadUrl(50L, 999L, com.medicalsystem.backend.storage.domain.DownloadIntent.DOWNLOAD, testUser)
        }
    }
}
