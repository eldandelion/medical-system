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

        dto.demographics?.email?.let { email ->
            val emailRegex = "^[A-Za-z0-9+_.-]+@(.+)\$".toRegex()
            if (!emailRegex.matches(email)) {
                throw ValidationException("Invalid email format")
            }
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
        
        // Note: demographics are not mapped here yet as dto to entity mapper for student creation needs a complete model
        
        val savedEntity = studentRepository.save(entity)
        logger.info("Successfully created student with ID: ${savedEntity.id} and number: ${savedEntity.studentNumber}")
        
        return studentMapper.toDto(studentMapper.toModel(savedEntity))
    }

    @Transactional(readOnly = true)
    fun getPsychometrics(id: Long): com.medicalsystem.backend.dto.PsychometricsSummaryDto {
        val entity = studentRepository.findById(id)
            .orElseThrow {
                logger.error("Student with ID $id not found when fetching psychometrics.")
                ResourceNotFoundException("Student with ID $id not found")
            }
            
        // Map Risk Flags guaranteeing all 3 exist
        val existingFlags = entity.riskFlags.associateBy { it.name }
        val riskFlags = com.medicalsystem.backend.model.RiskFlagName.entries.map { flagName ->
            val entityFlag = existingFlags[flagName]
            com.medicalsystem.backend.dto.RiskFlagDto(
                label = flagName.displayName,
                value = entityFlag?.status == com.medicalsystem.backend.model.FlagStatus.POSITIVE
            )
        }
        
        // Map Raw Tests
        val tests = entity.psychometricTests.sortedByDescending { it.testDate }
        val testDtos = tests.map { test ->
            com.medicalsystem.backend.dto.PsychometricTestDto(
                name = test.testResultName.displayName,
                value = test.score,
                max = test.maxScore,
                level = test.level,
                date = test.testDate.toString()
            )
        }
        
        // Extract Trend (GAD-7 as an example)
        val gad7Tests = tests.filter { it.testResultName == com.medicalsystem.backend.model.TestResultName.GAD_7 }.sortedBy { it.testDate }
        val scores = gad7Tests.map { test ->
            com.medicalsystem.backend.dto.ScoreTrendDto(
                date = test.testDate.toString(),
                value = test.score
            )
        }
        
        // Compute Radar Data from latest unique tests
        val latestTests = tests.groupBy { it.testResultName }.mapValues { it.value.first() }
        val radarData = latestTests.values.map { test ->
            com.medicalsystem.backend.dto.RadarDataDto(
                subject = test.testResultName.displayName.substringBefore(" ("), // E.g. "PHQ-9"
                A = test.score,
                fullMark = test.maxScore
            )
        }
        
        return com.medicalsystem.backend.dto.PsychometricsSummaryDto(
            scidDiagnosis = entity.scidDiagnosis,
            riskFlags = riskFlags,
            scores = scores,
            radarData = radarData,
            tests = testDtos
        )
    }
}

