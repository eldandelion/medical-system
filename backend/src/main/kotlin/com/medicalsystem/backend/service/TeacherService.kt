package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.AssignTeacherStudentsResponse
import com.medicalsystem.backend.dto.TeacherDetailDto
import com.medicalsystem.backend.dto.TeacherSummaryDto
import com.medicalsystem.backend.dto.UnassignStudentResponse
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.StudentAssignedToTeacherEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.mapper.StudentMapper
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.TeacherRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TeacherService(
    private val teacherRepository: TeacherRepository,
    private val userJpaRepository: UserJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val studentMapper: StudentMapper,
    private val eventPublisher: DomainEventPublisher
) {
    private val logger = LoggerFactory.getLogger(TeacherService::class.java)

    fun getTeachers(keyword: String?, status: AccountStatus?): List<TeacherSummaryDto> {
        val teachers = teacherRepository.findAll()
        if (teachers.isEmpty()) return emptyList()

        val usersById = userJpaRepository.findAllById(teachers.map { it.userId }).associateBy { it.id }
        val countsByTeacherId = studentJpaRepository.countAssignedStudentsGroupedByTeacher()
            .associate { it.getTeacherId() to it.getStudentCount().toInt() }

        val normalizedKeyword = keyword?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }

        return teachers.mapNotNull { teacher ->
            val user = usersById[teacher.userId] ?: return@mapNotNull null
            val statusMatches = if (status != null) {
                user.status == status
            } else {
                user.status != AccountStatus.DELETED
            }
            if (!statusMatches) return@mapNotNull null

            val keywordMatches = if (normalizedKeyword == null) {
                true
            } else {
                user.name.lowercase().contains(normalizedKeyword) ||
                    teacher.employeeNumber.lowercase().contains(normalizedKeyword) ||
                    teacher.college.name.lowercase().contains(normalizedKeyword)
            }
            if (!keywordMatches) return@mapNotNull null

            toSummaryDto(teacher, user, countsByTeacherId[teacher.userId] ?: 0)
        }.sortedBy { it.id }
    }

    fun getTeacherDetails(teacherId: Long): TeacherDetailDto {
        val teacher = teacherRepository.findById(teacherId).orElse(null)
        val user = userJpaRepository.findById(teacherId).orElseThrow {
            ResourceNotFoundException("Teacher with ID $teacherId not found")
        }
        if (teacher == null && user.role != UserRole.TEACHER) {
            throw ResourceNotFoundException("Teacher with ID $teacherId not found")
        }

        val teacherNameLookup = mapOf(teacherId to user.name)
        val assignedStudents = if (teacher != null) {
            studentJpaRepository.findByAssignedTeacherUserId(teacherId)
                .map { entity -> studentMapper.toDto(studentMapper.toModel(entity), teacherNameLookup) }
        } else {
            emptyList()
        }

        return TeacherDetailDto(
            id = user.id,
            name = user.name,
            employeeNumber = teacher?.employeeNumber ?: "",
            collegeId = teacher?.college?.id ?: 0L,
            collegeName = teacher?.college?.name ?: "",
            status = user.status,
            phone = user.phone,
            email = user.email.value,
            assignedStudentCount = assignedStudents.size,
            assignedStudents = assignedStudents
        )
    }

    @Transactional
    fun assignStudents(
        teacherId: Long,
        studentIds: List<Long>,
        assigner: User
    ): AssignTeacherStudentsResponse {
        val (teacher, teacherUser) = loadTeacherAndUser(teacherId)
        if (teacherUser.status != AccountStatus.ACTIVE) {
            throw ConflictException("Target teacher account is not active")
        }

        val uniqueStudentIds = studentIds.distinct()
        val studentsById = studentJpaRepository.findAllById(uniqueStudentIds).associateBy { it.id }
        val missingId = uniqueStudentIds.firstOrNull { !studentsById.containsKey(it) }
        if (missingId != null) {
            throw ResourceNotFoundException("Student with ID $missingId not found")
        }

        var assignedCount = 0
        var reassignedCount = 0
        var unchangedCount = 0
        val toSave = mutableListOf<StudentEntity>()
        val assignedStudentIds = mutableListOf<Long>()
        val events = mutableListOf<StudentAssignedToTeacherEvent>()

        for (studentId in uniqueStudentIds) {
            val student = studentsById.getValue(studentId)
            val previousTeacherId = student.assignedTeacher?.userId
            if (previousTeacherId == teacherId) {
                unchangedCount++
                continue
            }

            if (previousTeacherId == null) {
                assignedCount++
            } else {
                reassignedCount++
            }

            student.assignedTeacher = teacher
            toSave.add(student)
            assignedStudentIds.add(student.id)
            events.add(
                StudentAssignedToTeacherEvent(
                    studentId = student.id,
                    studentName = student.name,
                    studentNumber = student.studentNumber,
                    teacherId = teacherId,
                    previousTeacherId = previousTeacherId,
                    assignerName = assigner.name
                )
            )
        }

        if (toSave.isNotEmpty()) {
            studentJpaRepository.saveAll(toSave)
            events.forEach { eventPublisher.publish(it) }
            logger.info(
                "Assigned ${toSave.size} students (new=$assignedCount, reassigned=$reassignedCount, unchanged=$unchangedCount) to teacher $teacherId by user ${assigner.id}"
            )
        }

        return AssignTeacherStudentsResponse(
            assignedCount = assignedCount,
            reassignedCount = reassignedCount,
            unchangedCount = unchangedCount,
            assignedStudentIds = assignedStudentIds
        )
    }

    @Transactional
    fun unassignStudent(teacherId: Long, studentId: Long): UnassignStudentResponse {
        if (!teacherRepository.existsById(teacherId)) {
            throw ResourceNotFoundException("Teacher with ID $teacherId not found")
        }
        val student = studentJpaRepository.findById(studentId).orElseThrow {
            ResourceNotFoundException("Student with ID $studentId not found")
        }

        if (student.assignedTeacher?.userId != teacherId) {
            throw ConflictException("Student $studentId is not assigned to teacher $teacherId")
        }

        student.assignedTeacher = null
        studentJpaRepository.save(student)
        logger.info("Unassigned student $studentId from teacher $teacherId")

        return UnassignStudentResponse(
            success = true,
            unassignedStudentId = studentId
        )
    }

    private fun loadTeacherAndUser(teacherId: Long): Pair<TeacherEntity, UserEntity> {
        val teacher = teacherRepository.findById(teacherId).orElseThrow {
            ResourceNotFoundException("Teacher with ID $teacherId not found")
        }
        val user = userJpaRepository.findById(teacherId).orElseThrow {
            ResourceNotFoundException("User with ID $teacherId not found")
        }
        return teacher to user
    }

    private fun toSummaryDto(
        teacher: TeacherEntity,
        user: UserEntity,
        assignedStudentCount: Int
    ): TeacherSummaryDto = TeacherSummaryDto(
        id = teacher.userId,
        name = user.name,
        employeeNumber = teacher.employeeNumber,
        collegeId = teacher.college.id ?: 0L,
        collegeName = teacher.college.name,
        status = user.status,
        phone = user.phone,
        email = user.email.value,
        assignedStudentCount = assignedStudentCount
    )
}
