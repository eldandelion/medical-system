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
    fun getAllStudents(): List<StudentDto> {
        return studentService.getAllStudents()
    }

    @GetMapping("/{id}/psychometrics")
    fun getPsychometrics(@PathVariable id: Long): PsychometricsSummaryDto {
        return studentService.getPsychometrics(id)
    }

    @GetMapping("/{id}")
    fun getStudentById(@PathVariable id: Long): StudentDto {
        return studentService.getStudentById(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createStudent(@Valid @RequestBody dto: StudentDto): StudentDto {
        return studentService.createStudent(dto)
    }
}
