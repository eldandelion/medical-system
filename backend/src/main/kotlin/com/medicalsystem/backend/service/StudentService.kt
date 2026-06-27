package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service

import com.medicalsystem.backend.repository.MajorRepository
import java.time.LocalDate

@Service
class StudentService(
    private val studentRepository: StudentRepository,
    private val majorRepository: MajorRepository
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
            year = calculateAcademicYear(entity.enrollmentDate),
            riskLevel = entity.riskStatus
        )
    }

    private fun calculateAcademicYear(enrollmentDate: LocalDate): String {
        val today = LocalDate.now()
        val yearDiff = today.year - enrollmentDate.year
        val academicYearIndex = if (today.monthValue >= 9) {
            yearDiff + 1
        } else {
            yearDiff
        }
        return when (academicYearIndex) {
            1 -> "大一"
            2 -> "大二"
            3 -> "大三"
            4 -> "大四"
            5 -> "大五"
            else -> if (academicYearIndex > 5) "毕业" else "新生"
        }
    }

    //TODO before adding a record to the database, student number must be checked against REGEX
}
