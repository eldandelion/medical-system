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
    private val healthProfileRepository: StudentHealthProfileRepository
) {
    private val logger = LoggerFactory.getLogger(StudentService::class.java)

    fun fetchAllStudents(token: String? = null): List<StudentDto> {
        val students = if (token?.contains("teacher_token_zhang") == true) {
            // Mock: Teacher Zhang is assigned to College 1
            studentRepository.findByMajorCollegeId(1L)
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

        dto.demographics?.email?.let { email ->
            val emailRegex = "^[A-Za-z0-9+_.-]+@(.+)\$".toRegex()
            if (!emailRegex.matches(email)) {
                throw ValidationException("Invalid email format")
            }
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
            
        // Map Risk Flags guaranteeing all 3 exist
        val existingFlags = profile?.riskFlags?.associateBy { it.name } ?: emptyMap()
        val riskFlags = com.medicalsystem.backend.model.RiskFlagName.entries.map { flagName ->
            val entityFlag = existingFlags[flagName]
            com.medicalsystem.backend.dto.RiskFlagDto(
                label = flagName.displayName,
                value = entityFlag?.status == com.medicalsystem.backend.model.FlagStatus.POSITIVE
            )
        }
        
        // Map Raw Tests
        val tests = profile?.getLatestTests() ?: emptyList()
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
        val latestTests = profile?.getUniqueLatestTests() ?: emptyMap()
        val radarData = latestTests.values.map { test ->
            com.medicalsystem.backend.dto.RadarDataDto(
                subject = test.testResultName.displayName.substringBefore(" ("), // E.g. "PHQ-9"
                A = test.score,
                fullMark = test.maxScore
            )
        }
        
        return com.medicalsystem.backend.dto.PsychometricsSummaryDto(
            scidDiagnosis = profile?.scidDiagnosis,
            riskFlags = riskFlags,
            scores = scores,
            radarData = radarData,
            tests = testDtos
        )
    }
}
