package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.StudentImportCommitRequestDto
import com.medicalsystem.backend.dto.StudentImportPreviewDto
import com.medicalsystem.backend.dto.StudentImportResultDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.StudentImportService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/students/import")
class StudentImportController(
    private val studentImportService: StudentImportService
) {

    /**
     * Download the official CSV import template (UTF-8 BOM encoded for Chinese Excel compatibility).
     */
    @GetMapping("/template")
    fun downloadTemplate(@CurrentUser user: User?): ResponseEntity<ByteArray> {
        user ?: throw ForbiddenException("Authorized user not found")

        val csvBytes = studentImportService.generateTemplateCsv()
        return ResponseEntity.ok()
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"student_import_template.csv\""
            )
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csvBytes)
    }

    /**
     * Upload and validate a CSV file. Returns a full preview with per-row validation results.
     * No records are written to the database.
     */
    @PostMapping("/preview", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun previewImport(
        @RequestParam("file") file: MultipartFile,
        @CurrentUser user: User?
    ): ResponseEntity<StudentImportPreviewDto> {
        user ?: throw ForbiddenException("Authorized user not found")

        val preview = studentImportService.previewCsv(file)
        return ResponseEntity.ok(preview)
    }

    /**
     * Commit the import. Re-validates all rows server-side before persisting.
     * Requires SYSTEM_ADMIN or HEAD_COUNSELLOR role.
     */
    @PostMapping("/commit")
    fun commitImport(
        @RequestBody request: StudentImportCommitRequestDto,
        @CurrentUser user: User?
    ): ResponseEntity<StudentImportResultDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")

        val result = studentImportService.commitImport(request, currentUser)
        return ResponseEntity.ok(result)
    }
}
