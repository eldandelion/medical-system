package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.service.StudentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/students")
class StudentController(private val studentService: StudentService) {

    @GetMapping
    fun getAllStudents(): ResponseEntity<List<StudentDto>> {
        val students = studentService.getAllStudents()
        return ResponseEntity.ok(students)
    }

    @GetMapping("/{id}")
    fun getStudentById(@PathVariable id: Long): ResponseEntity<StudentDto> {
        val student = studentService.getStudentById(id)
        return if (student != null) {
            ResponseEntity.ok(student)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    fun createStudent(@RequestBody dto: StudentDto): ResponseEntity<StudentDto> {
        val createdStudent = studentService.createStudent(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent)
    }
}
