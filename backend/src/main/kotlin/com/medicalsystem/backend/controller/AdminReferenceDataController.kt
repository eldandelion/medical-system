package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.AcademicReferenceService
import com.medicalsystem.backend.service.ClinicalReferenceService
import com.medicalsystem.backend.service.DemographicsReferenceService
import com.medicalsystem.backend.service.ReferenceDependencyAnalyzer
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/references")
class AdminReferenceDataController(
    private val academicReferenceService: AcademicReferenceService,
    private val clinicalReferenceService: ClinicalReferenceService,
    private val demographicsReferenceService: DemographicsReferenceService,
    private val dependencyAnalyzer: ReferenceDependencyAnalyzer
) {

    private fun checkAdmin(user: User?) {
        if (user == null || user.role != UserRole.SYSTEM_ADMIN) {
            throw ForbiddenException("Only System Administrators may manage reference data.")
        }
    }

    // === Query Endpoints ===

    @GetMapping("/colleges")
    fun listColleges(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<CollegeDto> {
        checkAdmin(user)
        return academicReferenceService.listColleges(query, includeDeprecated)
    }

    @GetMapping("/majors")
    fun listMajors(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) collegeId: Long?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<MajorDto> {
        checkAdmin(user)
        return academicReferenceService.listMajors(query, collegeId, includeDeprecated)
    }

    @GetMapping("/school-departments")
    fun listSchoolDepartments(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<SchoolDepartmentDto> {
        checkAdmin(user)
        return academicReferenceService.listSchoolDepartments(query, includeDeprecated)
    }

    @GetMapping("/schools")
    fun listSchools(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<SchoolDto> {
        checkAdmin(user)
        return academicReferenceService.listSchools(query, includeDeprecated)
    }

    @GetMapping("/hospitals")
    fun listHospitals(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<AdminHospitalDto> {
        checkAdmin(user)
        return clinicalReferenceService.listHospitals(query, includeDeprecated)
    }

    @GetMapping("/hospital-departments")
    fun listHospitalDepartments(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false) hospitalId: Long?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<HospitalDepartmentDto> {
        checkAdmin(user)
        return clinicalReferenceService.listHospitalDepartments(query, hospitalId, includeDeprecated)
    }

    @GetMapping("/ethnicities")
    fun listEthnicities(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<EthnicityDto> {
        checkAdmin(user)
        return demographicsReferenceService.listEthnicities(query, includeDeprecated)
    }

    @GetMapping("/degree-levels")
    fun listDegreeLevels(
        @RequestParam(required = false) query: String?,
        @RequestParam(required = false, defaultValue = "true") includeDeprecated: Boolean,
        @CurrentUser user: User?
    ): List<DegreeLevelDto> {
        checkAdmin(user)
        return demographicsReferenceService.listDegreeLevels(query, includeDeprecated)
    }

    // === Create Endpoints ===

    @PostMapping("/colleges")
    fun createCollege(@Valid @RequestBody req: SaveCollegeRequest, @CurrentUser user: User?): ResponseEntity<CollegeDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(academicReferenceService.createCollege(req))
    }

    @PostMapping("/majors")
    fun createMajor(@Valid @RequestBody req: SaveMajorRequest, @CurrentUser user: User?): ResponseEntity<MajorDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(academicReferenceService.createMajor(req))
    }

    @PostMapping("/school-departments")
    fun createSchoolDepartment(@Valid @RequestBody req: SaveSchoolDepartmentRequest, @CurrentUser user: User?): ResponseEntity<SchoolDepartmentDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(academicReferenceService.createSchoolDepartment(req))
    }

    @PostMapping("/schools")
    fun createSchool(@Valid @RequestBody req: SaveSimpleReferenceRequest, @CurrentUser user: User?): ResponseEntity<SchoolDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(academicReferenceService.createSchool(req))
    }

    @PostMapping("/hospitals")
    fun createHospital(@Valid @RequestBody req: SaveHospitalRequest, @CurrentUser user: User?): ResponseEntity<AdminHospitalDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(clinicalReferenceService.createHospital(req))
    }

    @PostMapping("/hospital-departments")
    fun createHospitalDepartment(@Valid @RequestBody req: SaveHospitalDepartmentRequest, @CurrentUser user: User?): ResponseEntity<HospitalDepartmentDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(clinicalReferenceService.createHospitalDepartment(req))
    }

    @PostMapping("/ethnicities")
    fun createEthnicity(@Valid @RequestBody req: SaveSimpleReferenceRequest, @CurrentUser user: User?): ResponseEntity<EthnicityDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(demographicsReferenceService.createEthnicity(req))
    }

    @PostMapping("/degree-levels")
    fun createDegreeLevel(@Valid @RequestBody req: SaveSimpleReferenceRequest, @CurrentUser user: User?): ResponseEntity<DegreeLevelDto> {
        checkAdmin(user)
        return ResponseEntity.status(HttpStatus.CREATED).body(demographicsReferenceService.createDegreeLevel(req))
    }

    // === Update Endpoints ===

    @PutMapping("/colleges/{id}")
    fun updateCollege(@PathVariable id: Long, @Valid @RequestBody req: SaveCollegeRequest, @CurrentUser user: User?): CollegeDto {
        checkAdmin(user)
        return academicReferenceService.updateCollege(id, req)
    }

    @PutMapping("/majors/{id}")
    fun updateMajor(@PathVariable id: Long, @Valid @RequestBody req: SaveMajorRequest, @CurrentUser user: User?): MajorDto {
        checkAdmin(user)
        return academicReferenceService.updateMajor(id, req)
    }

    @PutMapping("/school-departments/{id}")
    fun updateSchoolDepartment(@PathVariable id: Long, @Valid @RequestBody req: SaveSchoolDepartmentRequest, @CurrentUser user: User?): SchoolDepartmentDto {
        checkAdmin(user)
        return academicReferenceService.updateSchoolDepartment(id, req)
    }

    @PutMapping("/schools/{id}")
    fun updateSchool(@PathVariable id: Long, @Valid @RequestBody req: SaveSimpleReferenceRequest, @CurrentUser user: User?): SchoolDto {
        checkAdmin(user)
        return academicReferenceService.updateSchool(id, req)
    }

    @PutMapping("/hospitals/{id}")
    fun updateHospital(@PathVariable id: Long, @Valid @RequestBody req: SaveHospitalRequest, @CurrentUser user: User?): AdminHospitalDto {
        checkAdmin(user)
        return clinicalReferenceService.updateHospital(id, req)
    }

    @PutMapping("/hospital-departments/{id}")
    fun updateHospitalDepartment(@PathVariable id: Long, @Valid @RequestBody req: SaveHospitalDepartmentRequest, @CurrentUser user: User?): HospitalDepartmentDto {
        checkAdmin(user)
        return clinicalReferenceService.updateHospitalDepartment(id, req)
    }

    @PutMapping("/ethnicities/{id}")
    fun updateEthnicity(@PathVariable id: Long, @Valid @RequestBody req: SaveSimpleReferenceRequest, @CurrentUser user: User?): EthnicityDto {
        checkAdmin(user)
        return demographicsReferenceService.updateEthnicity(id, req)
    }

    @PutMapping("/degree-levels/{id}")
    fun updateDegreeLevel(@PathVariable id: Long, @Valid @RequestBody req: SaveSimpleReferenceRequest, @CurrentUser user: User?): DegreeLevelDto {
        checkAdmin(user)
        return demographicsReferenceService.updateDegreeLevel(id, req)
    }

    // === Dependency Check Endpoint ===

    @GetMapping("/{category}/{id}/dependency-check")
    fun checkDependencies(
        @PathVariable category: ReferenceCategory,
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): ReferenceDependencyCheckDto {
        checkAdmin(user)
        return dependencyAnalyzer.checkDependencies(category, id)
    }

    // === Deprecate & Reactivate Endpoints ===

    @PatchMapping("/{category}/{id}/deprecate")
    fun deprecateReference(
        @PathVariable category: ReferenceCategory,
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): Any {
        checkAdmin(user)
        return when (category) {
            ReferenceCategory.COLLEGE -> academicReferenceService.setCollegeStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.MAJOR -> academicReferenceService.setMajorStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.SCHOOL_DEPARTMENT -> academicReferenceService.setSchoolDepartmentStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.SCHOOL -> academicReferenceService.setSchoolStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.HOSPITAL -> clinicalReferenceService.setHospitalStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.HOSPITAL_DEPARTMENT -> clinicalReferenceService.setHospitalDepartmentStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.ETHNICITY -> demographicsReferenceService.setEthnicityStatus(id, ReferenceDataStatus.DEPRECATED)
            ReferenceCategory.DEGREE_LEVEL -> demographicsReferenceService.setDegreeLevelStatus(id, ReferenceDataStatus.DEPRECATED)
        }
    }

    @PatchMapping("/{category}/{id}/reactivate")
    fun reactivateReference(
        @PathVariable category: ReferenceCategory,
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): Any {
        checkAdmin(user)
        return when (category) {
            ReferenceCategory.COLLEGE -> academicReferenceService.setCollegeStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.MAJOR -> academicReferenceService.setMajorStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.SCHOOL_DEPARTMENT -> academicReferenceService.setSchoolDepartmentStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.SCHOOL -> academicReferenceService.setSchoolStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.HOSPITAL -> clinicalReferenceService.setHospitalStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.HOSPITAL_DEPARTMENT -> clinicalReferenceService.setHospitalDepartmentStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.ETHNICITY -> demographicsReferenceService.setEthnicityStatus(id, ReferenceDataStatus.ACTIVE)
            ReferenceCategory.DEGREE_LEVEL -> demographicsReferenceService.setDegreeLevelStatus(id, ReferenceDataStatus.ACTIVE)
        }
    }

    // === Hard Delete Endpoint ===

    @DeleteMapping("/{category}/{id}")
    fun deleteReference(
        @PathVariable category: ReferenceCategory,
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): ResponseEntity<Void> {
        checkAdmin(user)
        when (category) {
            ReferenceCategory.COLLEGE -> academicReferenceService.deleteCollege(id)
            ReferenceCategory.MAJOR -> academicReferenceService.deleteMajor(id)
            ReferenceCategory.SCHOOL_DEPARTMENT -> academicReferenceService.deleteSchoolDepartment(id)
            ReferenceCategory.SCHOOL -> academicReferenceService.deleteSchool(id)
            ReferenceCategory.HOSPITAL -> clinicalReferenceService.deleteHospital(id)
            ReferenceCategory.HOSPITAL_DEPARTMENT -> clinicalReferenceService.deleteHospitalDepartment(id)
            ReferenceCategory.ETHNICITY -> demographicsReferenceService.deleteEthnicity(id)
            ReferenceCategory.DEGREE_LEVEL -> demographicsReferenceService.deleteDegreeLevel(id)
        }
        return ResponseEntity.noContent().build()
    }
}
