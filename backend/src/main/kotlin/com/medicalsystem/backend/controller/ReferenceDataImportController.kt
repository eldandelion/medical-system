package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.ReferenceImportCommitRequestDto
import com.medicalsystem.backend.dto.ReferenceImportPreviewDto
import com.medicalsystem.backend.dto.ReferenceImportResultDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.ReferenceDataImportService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/admin/references/import")
class ReferenceDataImportController(
    private val importService: ReferenceDataImportService
) {

    private fun checkAdmin(user: User?) {
        if (user == null || user.role != UserRole.SYSTEM_ADMIN) {
            throw ForbiddenException("Only System Administrators may perform bulk import operations.")
        }
    }

    @GetMapping("/template/{category}")
    fun downloadTemplate(
        @PathVariable category: ReferenceCategory,
        @CurrentUser user: User?
    ): ResponseEntity<ByteArray> {
        checkAdmin(user)
        val csvBytes = importService.generateTemplateCsv(category)
        val filename = "${category.name.lowercase()}_template.csv"
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$filename\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csvBytes)
    }

    @PostMapping("/preview", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun previewImport(
        @RequestParam("category") category: ReferenceCategory,
        @RequestParam("file") file: MultipartFile,
        @CurrentUser user: User?
    ): ResponseEntity<ReferenceImportPreviewDto> {
        checkAdmin(user)
        val preview = importService.previewCsv(category, file)
        return ResponseEntity.ok(preview)
    }

    @PostMapping("/commit")
    fun commitImport(
        @RequestBody request: ReferenceImportCommitRequestDto,
        @CurrentUser user: User?
    ): ResponseEntity<ReferenceImportResultDto> {
        checkAdmin(user)
        val result = importService.commitImport(request, user!!)
        return ResponseEntity.ok(result)
    }
}
