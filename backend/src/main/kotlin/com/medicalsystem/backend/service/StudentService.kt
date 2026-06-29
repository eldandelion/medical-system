package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.mapper.StudentMapper
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import org.slf4j.LoggerFactory
import com.medicalsystem.backend.repository.MajorRepository

@Service
@Transactional(readOnly = true)
class StudentService(
    private val studentRepository: StudentRepository,
    private val majorRepository: MajorRepository,
    private val studentMapper: StudentMapper
) {
    private val logger = LoggerFactory.getLogger(StudentService::class.java)

    fun getAllStudents(): List<StudentDto> {
        return studentRepository.findAll()
            .map { studentMapper.toModel(it) }
            .map { studentMapper.toDto(it) }
    }

    fun getStudentById(id: Long): StudentDto {
        val entity = studentRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Student with ID $id not found") }
        return studentMapper.toDto(studentMapper.toModel(entity))
    }

    @Transactional
    fun createStudent(dto: StudentDto): StudentDto {
        if (dto.majorId == null) {
            throw ValidationException("majorId must not be null")
        }

        if (studentRepository.existsByStudentNumber(dto.studentNumber)) {
            throw ConflictException("Student with number ${dto.studentNumber} already exists")
        }

        val major = majorRepository.findById(dto.majorId)
            .orElseThrow { ResourceNotFoundException("Major with ID ${dto.majorId} not found") }

        val entity = StudentEntity(
            studentNumber = dto.studentNumber,
            name = dto.name,
            major = major,
            enrollmentDate = dto.enrollmentDate,
            riskStatus = dto.riskLevel ?: RiskStatus.LOW
        )
        
        val savedEntity = studentRepository.save(entity)
        logger.info("Successfully created student with ID: ${savedEntity.id} and number: ${savedEntity.studentNumber}")
        
        return studentMapper.toDto(studentMapper.toModel(savedEntity))
    }
}

