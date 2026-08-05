package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.mapper.AssessmentMapper.toCatalogItemDto
import com.medicalsystem.backend.mapper.AssessmentMapper.toDetailsDto
import com.medicalsystem.backend.mapper.AssessmentMapper.toListItemDto
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository
import com.medicalsystem.backend.repository.AssessmentCohortSpecification
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.LocalDateTime

@Service
@Transactional
class AssessmentService(
    private val assignmentRepository: AssessmentAssignmentRepository,
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val scaleRepository: AssessmentScaleRepository,
    private val clock: Clock
) {

    @Transactional(readOnly = true)
    fun getAssessmentsForUser(user: User): List<AssessmentListItemDto> {
        val assignments = when (user.role) {
            UserRole.STUDENT -> assignmentRepository.findByStudentId(user.id)
            UserRole.TEACHER -> assignmentRepository.findByAssignedByUserId(user.id)
            UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN -> assignmentRepository.findAll()
            else -> emptyList()
        }

        val assignerIds = assignments.map { it.assignedByUserId }.toSet()
        val assignerMap = userRepository.findAllById(assignerIds).associateBy { it.id }
        val scaleMap = scaleRepository.findAll().associateBy { it.scaleType }

        return assignments.map { assignment ->
            val scale = scaleMap[assignment.scaleType]
            val assignerName = assignerMap[assignment.assignedByUserId]?.name
            assignment.toListItemDto(scale, assignerName)
        }
    }

    @Transactional(readOnly = true)
    fun getAssessmentDetails(id: Long, user: User): AssessmentDetailsDto {
        val assignment = assignmentRepository.findById(id).orElseThrow {
            NotFoundException("Assessment assignment with id $id not found")
        }

        if (user.role == UserRole.STUDENT && assignment.studentUserId != user.id) {
            throw ForbiddenException("You are not authorized to view this assessment")
        }

        val scale = scaleRepository.findByScaleType(assignment.scaleType).orElseThrow {
            NotFoundException("Assessment scale definition not found for ${assignment.scaleType}")
        }
        val assignerName = userRepository.findById(assignment.assignedByUserId).orElse(null)?.name
        
        return scale.toDetailsDto(assignment, assignerName)
    }

    @Transactional(readOnly = true)
    fun getCatalog(): List<AssessmentCatalogItemDto> {
        return scaleRepository.findAll().map { scale ->
            scale.toCatalogItemDto()
        }
    }

    fun assignToStudent(request: AssignAssessmentRequest, assigner: User): BatchAssignResultDto {
        if (assigner.role !in listOf(UserRole.TEACHER, UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN)) {
            throw ForbiddenException("Only educators and administrators can assign assessments")
        }

        val student = studentRepository.findByIdAndVisibleTo(request.studentId, assigner).orElseThrow {
            NotFoundException("Student with id ${request.studentId} not found or not in your visibility scope")
        }

        var assignedCount = 0
        request.scaleTypes.forEach { scaleType ->
            val existingPending = assignmentRepository.findPendingByStudentIdAndScaleType(student.id, scaleType)
            if (existingPending.isEmpty) {
                val newAssignment = AssessmentAssignment(
                    studentId = student.id,
                    studentUserId = student.id,
                    assignedByUserId = assigner.id,
                    scaleType = scaleType,
                    status = AssessmentStatus.PENDING,
                    assignedAt = LocalDateTime.now(clock),
                    dueDate = request.dueDate
                )
                newAssignment.initAssignedEvent()
                assignmentRepository.save(newAssignment)
                assignedCount++
            }
        }

        return BatchAssignResultDto(
            assignedCount = assignedCount
        )
    }

    fun assignToCohort(request: AssignCohortAssessmentRequest, assigner: User): BatchAssignResultDto {
        if (assigner.role !in listOf(UserRole.TEACHER, UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN)) {
            throw ForbiddenException("Only educators and administrators can assign assessments")
        }

        val spec = AssessmentCohortSpecification.buildSpecification(
            request.majorId, request.collegeId, request.academicYear, assigner
        )
        val visibleStudents = studentRepository.findAll(spec)

        if (visibleStudents.isEmpty()) {
            return BatchAssignResultDto(
                assignedCount = 0
            )
        }

        var totalAssigned = 0
        val studentIds = visibleStudents.map { it.id }
        
        request.scaleTypes.forEach { scaleType ->
            val pendingAssignments = assignmentRepository.findPendingByStudentIdInAndScaleType(studentIds, scaleType)
            val studentsWithPending = pendingAssignments.map { it.studentId }.toSet()
            
            val toSave = visibleStudents.filter { !studentsWithPending.contains(it.id) }.map { student ->
                val assignment = AssessmentAssignment(
                    studentId = student.id,
                    studentUserId = student.id,
                    assignedByUserId = assigner.id,
                    scaleType = scaleType,
                    status = AssessmentStatus.PENDING,
                    assignedAt = LocalDateTime.now(clock),
                    dueDate = request.dueDate
                )
                assignment.initAssignedEvent()
                assignment
            }
            
            if (toSave.isNotEmpty()) {
                assignmentRepository.saveAll(toSave)
                totalAssigned += toSave.size
            }
        }

        return BatchAssignResultDto(
            assignedCount = totalAssigned
        )
    }

    fun submitAssessment(
        assignmentId: Long,
        request: SubmitAssessmentRequest,
        currentUser: User
    ): AssessmentSubmissionResponseDto {
        val assignment = assignmentRepository.findById(assignmentId).orElseThrow {
            NotFoundException("Assessment assignment with id $assignmentId not found")
        }

        if (assignment.studentUserId != currentUser.id) {
            throw ForbiddenException("You can only submit your own assigned assessments")
        }

        val scale = scaleRepository.findByScaleType(assignment.scaleType).orElse(null)
        val answersMap = request.answers.associate { it.questionId to it.selectedValue }
        val scoringResult = AssessmentScoringEngine.score(assignment.scaleType, answersMap, scale)

        assignment.complete(
            responses = answersMap,
            scoringResult = scoringResult
        )
        assignment.completedAt = LocalDateTime.now(clock) // override to use clock

        val savedAssignment = assignmentRepository.save(assignment)

        return AssessmentSubmissionResponseDto(
            success = true,
            assignmentId = savedAssignment.id ?: assignmentId,
            totalQuestionsAnswered = request.answers.size,
            completedAt = savedAssignment.completedAt ?: LocalDateTime.now(clock)
        )
    }
}
