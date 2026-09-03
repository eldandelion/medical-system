package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.service.DictionaryService
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/api/dictionaries")
class DictionaryController(
    private val dictionaryService: DictionaryService
) {

    @GetMapping("/ethnicities")
    fun getEthnicities(): ResponseEntity<List<EthnicityDto>> {
        val list = dictionaryService.getAllEthnicities()
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic().mustRevalidate())
            .body(list)
    }

    @GetMapping("/schools")
    fun getSchools(): ResponseEntity<List<SchoolDto>> {
        val list = dictionaryService.getAllSchools()
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic().mustRevalidate())
            .body(list)
    }

    @GetMapping("/school-departments")
    fun getSchoolDepartments(
        @RequestParam(required = false) schoolId: Long?
    ): ResponseEntity<List<SchoolDepartmentDto>> {
        val list = dictionaryService.getSchoolDepartments(schoolId)
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic().mustRevalidate())
            .body(list)
    }

    @GetMapping("/hospitals")
    fun getHospitals(): ResponseEntity<List<HospitalSummaryDto>> {
        val list = dictionaryService.getAllHospitals()
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic().mustRevalidate())
            .body(list)
    }

    @GetMapping("/hospital-departments")
    fun getHospitalDepartments(
        @RequestParam(required = false) hospitalId: Long?
    ): ResponseEntity<List<HospitalDepartmentDto>> {
        val list = dictionaryService.getHospitalDepartments(hospitalId)
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic().mustRevalidate())
            .body(list)
    }
}
