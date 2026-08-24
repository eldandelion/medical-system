package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.StudentImportCommitRequestDto
import com.medicalsystem.backend.dto.StudentImportPreviewDto
import com.medicalsystem.backend.dto.StudentImportResultDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.StudentImportService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile

@ExtendWith(MockitoExtension::class)
class StudentImportControllerTest {

    @Mock
    private lateinit var studentImportService: StudentImportService

    @InjectMocks
    private lateinit var controller: StudentImportController

    private val adminUser = User(
        id = 1L,
        name = "Admin",
        email = EmailAddress("admin@test.com"),
        role = UserRole.SYSTEM_ADMIN
    )

    @Test
    fun `downloadTemplate returns 200 with CSV content type and disposition`() {
        val csvBytes = "学号,姓名\n".toByteArray()
        whenever(studentImportService.generateTemplateCsv()).thenReturn(csvBytes)

        val response = controller.downloadTemplate(adminUser)

        assertEquals(HttpStatus.OK, response.statusCode)
        val contentDisposition = response.headers.getFirst("Content-Disposition")
        assertNotNull(contentDisposition)
        assertTrue(contentDisposition!!.contains("student_import_template.csv"))
    }

    @Test
    fun `downloadTemplate throws ForbiddenException when user is null`() {
        assertThrows(ForbiddenException::class.java) {
            controller.downloadTemplate(null)
        }
    }

    @Test
    fun `previewImport returns 200 with preview dto`() {
        val mockFile = MockMultipartFile("file", "test.csv", "text/csv", "学号\nS001\n".toByteArray())
        val expectedPreview = StudentImportPreviewDto(
            totalRows = 1,
            readyCount = 1,
            duplicateCount = 0,
            invalidCount = 0,
            rows = emptyList()
        )
        whenever(studentImportService.previewCsv(any())).thenReturn(expectedPreview)

        val response = controller.previewImport(mockFile, adminUser)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(1, response.body?.totalRows)
    }

    @Test
    fun `previewImport throws ForbiddenException when user is null`() {
        val mockFile = MockMultipartFile("file", "test.csv", "text/csv", byteArrayOf())

        assertThrows(ForbiddenException::class.java) {
            controller.previewImport(mockFile, null)
        }
    }

    @Test
    fun `commitImport returns 200 with result dto`() {
        val request = StudentImportCommitRequestDto(
            rows = emptyList(),
            overwriteDuplicates = false
        )
        val expectedResult = StudentImportResultDto(
            totalProcessed = 0,
            importedCount = 0,
            updatedCount = 0,
            skippedCount = 0,
            failedRows = emptyList()
        )
        whenever(studentImportService.commitImport(any(), any())).thenReturn(expectedResult)

        val response = controller.commitImport(request, adminUser)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
    }

    @Test
    fun `commitImport throws ForbiddenException when user is null`() {
        val request = StudentImportCommitRequestDto(
            rows = emptyList(),
            overwriteDuplicates = false
        )

        assertThrows(ForbiddenException::class.java) {
            controller.commitImport(request, null)
        }
    }
}
