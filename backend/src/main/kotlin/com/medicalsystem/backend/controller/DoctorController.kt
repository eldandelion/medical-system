package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.DoctorDto
import com.medicalsystem.backend.service.DoctorService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/doctors")
class DoctorController(
    private val doctorService: DoctorService
) {
    @GetMapping
    fun getAllDoctors(): List<DoctorDto> = doctorService.getAllDoctors()

    @GetMapping("/{id}/calendar")
    fun getDoctorCalendar(@PathVariable id: Long): ResponseEntity<Map<String, List<String>>> =
        ResponseEntity.ok(mapOf("occupiedSlots" to doctorService.getOccupiedSlotsForCurrentWeek(id)))
}
