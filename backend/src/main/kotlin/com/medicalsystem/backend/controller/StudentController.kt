package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.service.StudentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.medicalsystem.backend.dto.PsychometricsSummaryDto

import jakarta.validation.Valid

@RestController
@RequestMapping("/api/students")
class StudentController(private val studentService: StudentService) {

    @GetMapping
    fun fetchAllStudents(): List<StudentDto> {
        return studentService.fetchAllStudents()
    }

    @GetMapping("/{id}")
    fun fetchStudentDetails(@PathVariable id: Long): StudentDto {
        return studentService.fetchStudentDetails(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun registerStudent(@Valid @RequestBody dto: StudentDto): StudentDto {
        return studentService.registerStudent(dto)
    }

    @GetMapping("/{id}/psychometrics")
    fun fetchPsychometricSummary(@PathVariable id: Long): com.medicalsystem.backend.dto.PsychometricsSummaryDto {
        return studentService.fetchPsychometricSummary(id)
    }
}
