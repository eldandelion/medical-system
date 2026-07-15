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
import com.medicalsystem.backend.repository.StudentHealthProfileRepository

@Service
@Transactional(readOnly = true)
class StudentService(
    private val studentRepository: StudentRepository,
    private val majorRepository: MajorRepository,
    private val studentMapper: StudentMapper,
    private val healthProfileRepository: StudentHealthProfileRepository,
    private val eventPublisher: com.medicalsystem.backend.event.DomainEventPublisher,
    private val psychometricSummaryMapper: com.medicalsystem.backend.mapper.PsychometricSummaryMapper
) {
    private val logger = LoggerFactory.getLogger(StudentService::class.java)

    fun fetchAllStudents(collegeId: Long? = null): List<StudentDto> {
        val students = if (collegeId != null) {
            studentRepository.findByMajorCollegeId(collegeId)
        } else {
            studentRepository.findAll()
        }
        
        return students.map { studentMapper.toDto(it) }
    }

    fun fetchStudentDetails(id: Long): StudentDto {
        val model = studentRepository.findById(id)
            .orElseThrow { com.medicalsystem.backend.exception.StudentNotFoundException(id) }
        return studentMapper.toDto(model)
    }

    @Transactional
    fun registerStudent(dto: StudentDto): StudentDto {
        if (dto.majorId == null) {
            throw ValidationException("majorId must not be null")
        }

        if (studentRepository.existsByStudentNumber(dto.studentNumber)) {
            throw com.medicalsystem.backend.exception.DuplicateStudentException(dto.studentNumber)
        }



        val major = majorRepository.findById(dto.majorId)
            .orElseThrow { ResourceNotFoundException("Major with ID ${dto.majorId} not found") }

        val model = com.medicalsystem.backend.model.Student(
            id = 0,
            studentNumber = dto.studentNumber,
            name = dto.name,
            major = major,
            enrollmentDate = dto.enrollmentDate,
            riskStatus = dto.riskLevel ?: RiskStatus.LOW,
            demographics = null
        )
        
        val savedModel = studentRepository.save(model)
        savedModel.register(dto.riskLevel?.name)
        savedModel.getDomainEvents().forEach { eventPublisher.publish(it) }
        savedModel.clearDomainEvents()
        
        val healthProfile = com.medicalsystem.backend.model.StudentHealthProfileFactory.createInitialProfile(
            studentId = savedModel.id,
            riskLevelStr = dto.riskLevel?.name
        )
        healthProfileRepository.save(healthProfile)
        
        logger.info("Successfully registered student with ID: ${savedModel.id} and number: ${savedModel.studentNumber}")
        
        return studentMapper.toDto(savedModel)
    }

    @Transactional(readOnly = true)
    fun fetchPsychometricSummary(id: Long): com.medicalsystem.backend.dto.PsychometricsSummaryDto {
        val entity = studentRepository.findById(id)
            .orElseThrow {
                logger.error("Student with ID $id not found when fetching psychometrics.")
                com.medicalsystem.backend.exception.StudentNotFoundException(id)
            }
            
        val profile = healthProfileRepository.findByStudentId(id).orElse(null)
            
        return psychometricSummaryMapper.toDto(entity, profile)
    }
}
