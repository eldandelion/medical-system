package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.HospitalDto
import com.medicalsystem.backend.service.HospitalService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/hospitals")
class HospitalController(
    private val hospitalService: HospitalService
) {
    @GetMapping
    fun getAllHospitals(): List<HospitalDto> {
        return hospitalService.getAllHospitals()
    }
}
