package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.DoctorDto
import com.medicalsystem.backend.model.Doctor
import com.medicalsystem.backend.repository.DepartmentRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.service.DoctorService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/doctors")
class DoctorController(
    private val userRepository: UserRepository,
    private val departmentRepository: DepartmentRepository,
    private val doctorService: DoctorService
) {
    @GetMapping
    fun getAllDoctors(): List<DoctorDto> {
        val doctors = userRepository.findAll().filterIsInstance<Doctor>()
        
        // Use mocks if no real doctors found for easier testing per spec
        val finalDoctors = if (doctors.isEmpty()) {
            listOf(
                Doctor(id = 997L, name = "李医生", email = "li@univ.edu.cn", departmentId = 1L, phone = null),
                Doctor(id = 998L, name = "李娜", email = "lina@univ.edu.cn", departmentId = 2L, phone = null),
                Doctor(id = 999L, name = "王明", email = "wangming@univ.edu.cn", departmentId = 3L, phone = null)
            )
        } else {
            doctors
        }

        return finalDoctors.map { doctor ->
            val departmentName = departmentRepository.findById(doctor.departmentId)
                .map { it.name }
                .orElse(getMockDepartmentName(doctor.departmentId))
                
            DoctorDto(
                id = doctor.id,
                name = doctor.name,
                departmentName = departmentName
            )
        }
    }

    @GetMapping("/{id}/calendar")
    fun getDoctorCalendar(@PathVariable id: Long): ResponseEntity<Map<String, List<String>>> {
        val occupiedSlots = doctorService.getOccupiedSlotsForCurrentWeek(id)
        return ResponseEntity.ok(mapOf("occupiedSlots" to occupiedSlots))
    }

    private fun getMockDepartmentName(id: Long): String {
        return when (id) {
            1L -> "医学院"
            2L -> "工学院"
            3L -> "经济学院"
            else -> "未知部门"
        }
    }
}
