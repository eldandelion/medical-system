package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.mapper.StudentMapper

import com.medicalsystem.backend.repository.MajorRepository
import java.time.LocalDate

@Service
class StudentService(
    private val studentRepository: StudentRepository,
    private val majorRepository: MajorRepository,
    private val studentMapper: StudentMapper
) {

    fun getAllStudents(): List<StudentDto> {
        return studentRepository.findAll()
            .map { studentMapper.toModel(it) }
            .map { studentMapper.toDto(it) }
    }

    fun getStudentById(id: Long): StudentDto? {
        return studentRepository.findById(id).map { 
            studentMapper.toDto(studentMapper.toModel(it)) 
        }.orElse(null)
    }

    fun createStudent(dto: StudentDto): StudentDto {
        val major = majorRepository.findById(dto.majorId ?: -1)
            .orElseThrow { IllegalArgumentException("Major not found") }

        val entity = StudentEntity(
            studentNumber = dto.studentNumber,
            name = dto.name,
            major = major,
            enrollmentDate = dto.enrollmentDate,
            riskStatus = dto.riskLevel ?: RiskStatus.LOW
        )
        val savedEntity = studentRepository.save(entity)
        return studentMapper.toDto(studentMapper.toModel(savedEntity))
    }

    //TODO before adding a record to the database, student number must be checked against REGEX
}
