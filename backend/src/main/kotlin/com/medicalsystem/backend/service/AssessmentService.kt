package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class AssessmentService(
    private val assignmentRepository: AssessmentAssignmentRepository,
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val studentHealthProfileRepository: StudentHealthProfileRepository,
    private val eventPublisher: DomainEventPublisher
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

        return assignments.map { assignment ->
            val scale = AssessmentScaleCatalog.getScale(assignment.scaleType)
            val assigner = assignerMap[assignment.assignedByUserId]
            val assignerName = assigner?.name ?: "心理中心"
            val initial = if (assignerName.isNotBlank()) assignerName.take(1) else "心"

            val percentage = if (assignment.status == AssessmentStatus.COMPLETED) 100 else 0

            AssessmentListItemDto(
                id = assignment.id ?: 0L,
                title = scale.title,
                subtitle = scale.subtitle,
                scaleType = assignment.scaleType,
                assignedBy = AssignedByDto(
                    name = assignerName,
                    initial = initial
                ),
                type = "测试",
                completionPercentage = percentage,
                duration = scale.duration,
                status = assignment.status,
                assignedAt = assignment.assignedAt,
                completedAt = assignment.completedAt,
                dueDate = assignment.dueDate
            )
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

        val scale = AssessmentScaleCatalog.getScale(assignment.scaleType)
        val assigner = userRepository.findById(assignment.assignedByUserId).orElse(null)
        val assignerName = assigner?.name ?: "心理中心"

        val sections = scale.sections.map { sec ->
            AssessmentSectionDto(
                id = sec.id,
                title = sec.title,
                subtitle = sec.subtitle,
                description = sec.description,
                questions = sec.questions.map { q ->
                    AssessmentQuestionDto(
                        id = q.id,
                        text = q.text,
                        options = q.options?.map { opt ->
                            AssessmentOptionDto(value = opt.value, label = opt.label)
                        }
                    )
                }
            )
        }

        return AssessmentDetailsDto(
            id = assignment.id ?: 0L,
            title = scale.title,
            subtitle = scale.subtitle,
            scaleType = assignment.scaleType,
            assignedBy = AssignedByDto(
                name = assignerName,
                initial = if (assignerName.isNotBlank()) assignerName.take(1) else "心"
            ),
            duration = scale.duration,
            status = assignment.status,
            sections = sections
        )
    }

    @Transactional(readOnly = true)
    fun getCatalog(): List<AssessmentCatalogItemDto> {
        return AssessmentScaleCatalog.getAllScales().map { scale ->
            AssessmentCatalogItemDto(
                scaleType = scale.scaleType,
                title = scale.title,
                subtitle = scale.subtitle,
                description = scale.description,
                duration = scale.duration,
                questionCount = scale.totalQuestions,
                sections = scale.sections.map { sec ->
                    AssessmentSectionDto(
                        id = sec.id,
                        title = sec.title,
                        subtitle = sec.subtitle,
                        description = sec.description,
                        questions = sec.questions.map { q ->
                            AssessmentQuestionDto(
                                id = q.id,
                                text = q.text,
                                options = q.options?.map { opt ->
                                    AssessmentOptionDto(value = opt.value, label = opt.label)
                                }
                            )
                        }
                    )
                }
            )
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
                    assignedAt = LocalDateTime.now(),
                    dueDate = request.dueDate
                )
                val saved = assignmentRepository.save(newAssignment)
                saved.initAssignedEvent()
                saved.getDomainEvents().forEach { eventPublisher.publish(it) }
                saved.clearDomainEvents()
                assignedCount++
            }
        }

        return BatchAssignResultDto(
            assignedCount = assignedCount,
            message = "Successfully assigned $assignedCount assessment(s) to student ${student.name}"
        )
    }

    fun assignToCohort(request: AssignCohortAssessmentRequest, assigner: User): BatchAssignResultDto {
        if (assigner.role !in listOf(UserRole.TEACHER, UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN)) {
            throw ForbiddenException("Only educators and administrators can assign assessments")
        }

        val visibleStudents = studentRepository.findVisibleStudentsFor(assigner).filter { s ->
            val matchMajor = request.majorId == null || s.major.id == request.majorId
            val matchCollege = request.collegeId == null || s.major.college?.id == request.collegeId
            val matchYear = request.academicYear == null || s.enrollmentDate.year == request.academicYear
            matchMajor && matchCollege && matchYear
        }

        if (visibleStudents.isEmpty()) {
            return BatchAssignResultDto(
                assignedCount = 0,
                message = "No matching students found in your scope"
            )
        }

        var totalAssigned = 0
        visibleStudents.forEach { student ->
            request.scaleTypes.forEach { scaleType ->
                val existingPending = assignmentRepository.findPendingByStudentIdAndScaleType(student.id, scaleType)
                if (existingPending.isEmpty) {
                    val assignment = AssessmentAssignment(
                        studentId = student.id,
                        studentUserId = student.id,
                        assignedByUserId = assigner.id,
                        scaleType = scaleType,
                        status = AssessmentStatus.PENDING,
                        assignedAt = LocalDateTime.now(),
                        dueDate = request.dueDate
                    )
                    val saved = assignmentRepository.save(assignment)
                    saved.initAssignedEvent()
                    saved.getDomainEvents().forEach { eventPublisher.publish(it) }
                    saved.clearDomainEvents()
                    totalAssigned++
                }
            }
        }

        return BatchAssignResultDto(
            assignedCount = totalAssigned,
            message = "Successfully assigned assessments to ${visibleStudents.size} student(s) (total $totalAssigned assignments created)"
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

        // 1. Scoring & Validation
        val scoringResult = AssessmentScoringEngine.score(assignment.scaleType, request.answers)

        // 2. Atomic health profile recording
        val profile = studentHealthProfileRepository.findByStudentId(assignment.studentId).orElseGet {
            StudentHealthProfileFactory.createInitialProfile(
                studentId = assignment.studentId,
                riskLevelStr = "LOW"
            )
        }
        val recordedTest = profile.recordAssessmentResult(scoringResult)
        studentHealthProfileRepository.save(profile)

        // 3. Complete assignment aggregate root & register domain event
        assignment.complete(
            responses = request.answers,
            scoringResult = scoringResult,
            createdPsychometricTestId = recordedTest.id
        )

        val savedAssignment = assignmentRepository.save(assignment)

        // 4. Publish domain events (dispatches transactional notifications AFTER_COMMIT)
        savedAssignment.getDomainEvents().forEach { eventPublisher.publish(it) }
        savedAssignment.clearDomainEvents()

        return AssessmentSubmissionResponseDto(
            success = true,
            message = "问卷测评提交成功",
            assignmentId = savedAssignment.id ?: assignmentId,
            totalQuestionsAnswered = request.answers.size,
            completedAt = savedAssignment.completedAt ?: LocalDateTime.now()
        )
    }
}
