package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service

@Service
class StudentService(private val studentRepository: StudentRepository) {

    fun getAllStudents(): List<StudentDto> {
        return studentRepository.findAll().map { toDto(it) }
    }

    fun getStudentById(id: Long): StudentDto? {
        return studentRepository.findById(id).map { toDto(it) }.orElse(null)
    }

    fun createStudent(dto: StudentDto): StudentDto {
        val entity = StudentEntity(
            studentNumber = dto.studentNumber,
            name = dto.name,
            major = dto.major,
            year = dto.year,
            status = dto.status
        )
        val savedEntity = studentRepository.save(entity)
        return toDto(savedEntity)
    }

    private fun toDto(entity: StudentEntity): StudentDto {
        return StudentDto(
            id = entity.id.toString(),
            studentNumber = entity.studentNumber,
            name = entity.name,
            major = entity.major,
            year = entity.year,
            status = entity.status
        )
    }
}
