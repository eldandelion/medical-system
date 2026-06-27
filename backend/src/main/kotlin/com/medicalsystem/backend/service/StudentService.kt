package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service

import com.medicalsystem.backend.repository.MajorRepository
import java.time.LocalDate

import com.medicalsystem.backend.util.AcademicYearCalculator

@Service
class StudentService(
    private val studentRepository: StudentRepository,
    private val majorRepository: MajorRepository,
    private val academicYearCalculator: AcademicYearCalculator
) {

    fun getAllStudents(): List<StudentDto> {
        return studentRepository.findAll().map { toDto(it) }
    }

    fun getStudentById(id: Long): StudentDto? {
        return studentRepository.findById(id).map { toDto(it) }.orElse(null)
    }

    fun createStudent(dto: StudentDto): StudentDto {
        val major = dto.majorId?.let { majorRepository.findById(it).orElse(null) }
            ?: throw IllegalArgumentException("Major not found")

        val entity = StudentEntity(
            studentNumber = dto.studentNumber,
            name = dto.name,
            major = major,
            enrollmentDate = dto.enrollmentDate,
            riskStatus = dto.riskLevel ?: com.medicalsystem.backend.entity.RiskStatus.LOW
        )
        val savedEntity = studentRepository.save(entity)
        return toDto(savedEntity)
    }

    private fun toDto(entity: StudentEntity): StudentDto {
        return StudentDto(
            id = entity.id.toString(),
            studentNumber = entity.studentNumber,
            name = entity.name,
            majorId = entity.major.id,
            major = entity.major.name,
            enrollmentDate = entity.enrollmentDate,
            year = academicYearCalculator.calculate(entity.enrollmentDate),
            riskLevel = entity.riskStatus
        )
    }

    //TODO before adding a record to the database, student number must be checked against REGEX
}
