package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.StudentAssignedToTeacherEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.mapper.StudentMapper
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.College
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Major
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.TeacherRepository
import com.medicalsystem.backend.repository.TeacherStudentCountProjection
import com.medicalsystem.backend.repository.UserJpaRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class TeacherServiceTest {

    @Mock private lateinit var teacherRepository: TeacherRepository
    @Mock private lateinit var userJpaRepository: UserJpaRepository
    @Mock private lateinit var studentJpaRepository: StudentJpaRepository
    @Mock private lateinit var studentMapper: StudentMapper
    @Mock private lateinit var eventPublisher: DomainEventPublisher

    @InjectMocks
    private lateinit var teacherService: TeacherService

    private val college = CollegeEntity(id = 1L, name = "计算机学院")
    private val majorEntity = MajorEntity(id = 10L, name = "计算机科学", college = college)
    private val majorModel = Major(10L, "计算机科学", College(1L, "计算机学院"))

    private val assigner = User(
        id = 100L,
        name = "张主任",
        email = EmailAddress("hc@univ.edu.cn"),
        role = UserRole.HEAD_COUNSELLOR
    )

    private fun countProjection(teacherId: Long, count: Long) = object : TeacherStudentCountProjection {
        override fun getTeacherId(): Long = teacherId
        override fun getStudentCount(): Long = count
    }

    @Test
    fun `getTeachers excludes DELETED by default, merges caseload counts, and supports keyword and status filters`() {
        val t1 = TeacherEntity(userId = 201L, employeeNumber = "EMP-201", college = college)
        val t2 = TeacherEntity(userId = 202L, employeeNumber = "EMP-202", college = college)
        val t3 = TeacherEntity(userId = 203L, employeeNumber = "EMP-203", college = college)

        val u1 = UserEntity(id = 201L, name = "艾米丽·沃森", role = UserRole.TEACHER, email = EmailAddress("t201@univ.edu.cn"), status = AccountStatus.ACTIVE, phone = "13800000001")
        val u2 = UserEntity(id = 202L, name = "赵老师", role = UserRole.TEACHER, email = EmailAddress("t202@univ.edu.cn"), status = AccountStatus.PENDING_APPROVAL)
        val u3 = UserEntity(id = 203L, name = "已注销教师", role = UserRole.TEACHER, email = EmailAddress("t203@univ.edu.cn"), status = AccountStatus.DELETED)

        whenever(teacherRepository.findAll()).thenReturn(listOf(t1, t2, t3))
        whenever(userJpaRepository.findAllById(listOf(201L, 202L, 203L))).thenReturn(listOf(u1, u2, u3))
        whenever(studentJpaRepository.countAssignedStudentsGroupedByTeacher()).thenReturn(
            listOf(countProjection(201L, 3L))
        )

        val defaultList = teacherService.getTeachers(keyword = null, status = null)
        assertEquals(2, defaultList.size)
        assertEquals(3, defaultList.first { it.id == 201L }.assignedStudentCount)
        assertEquals(0, defaultList.first { it.id == 202L }.assignedStudentCount)

        val filteredByKeyword = teacherService.getTeachers(keyword = "emp-202", status = null)
        assertEquals(1, filteredByKeyword.size)
        assertEquals(202L, filteredByKeyword[0].id)

        val filteredByStatus = teacherService.getTeachers(keyword = null, status = AccountStatus.ACTIVE)
        assertEquals(1, filteredByStatus.size)
        assertEquals(201L, filteredByStatus[0].id)
    }

    @Test
    fun `getTeacherDetails throws ResourceNotFoundException when missing and returns caseload when found`() {
        whenever(teacherRepository.findById(999L)).thenReturn(Optional.empty())
        assertThrows(ResourceNotFoundException::class.java) {
            teacherService.getTeacherDetails(999L)
        }

        val t1 = TeacherEntity(userId = 201L, employeeNumber = "EMP-201", college = college)
        val u1 = UserEntity(id = 201L, name = "张老师", role = UserRole.TEACHER, email = EmailAddress("t201@univ.edu.cn"), status = AccountStatus.ACTIVE, phone = "13800000001")
        val s1Entity = StudentEntity(id = 1L, studentNumber = "S001", name = "林小夕", major = majorEntity, enrollmentDate = LocalDate.of(2025, 9, 1), assignedTeacher = t1)
        val s1Model = Student(1L, "S001", "林小夕", majorModel, LocalDate.of(2025, 9, 1), RiskStatus.LOW, null, assignedTeacherId = 201L)
        val s1Dto = StudentDto("1", "S001", "林小夕", 10L, "计算机科学", LocalDate.of(2025, 9, 1), riskLevel = RiskStatus.LOW, assignedTeacherId = 201L, assignedTeacherName = "张老师")

        whenever(teacherRepository.findById(201L)).thenReturn(Optional.of(t1))
        whenever(userJpaRepository.findById(201L)).thenReturn(Optional.of(u1))
        whenever(studentJpaRepository.findByAssignedTeacherUserId(201L)).thenReturn(listOf(s1Entity))
        whenever(studentMapper.toModel(s1Entity)).thenReturn(s1Model)
        whenever(studentMapper.toDto(s1Model, mapOf(201L to "张老师"))).thenReturn(s1Dto)

        val detail = teacherService.getTeacherDetails(201L)
        assertEquals(201L, detail.id)
        assertEquals("张老师", detail.name)
        assertEquals(1, detail.assignedStudentCount)
        assertEquals(1, detail.assignedStudents.size)
        assertEquals("林小夕", detail.assignedStudents[0].name)
    }

    @Test
    fun `getTeacherDetails falls back to empty caseload when teacher profile row is absent for pending TEACHER user`() {
        val uPending = UserEntity(
            id = 203L,
            name = "赵老师",
            role = UserRole.TEACHER,
            email = EmailAddress("zhao_pending@univ.edu.cn"),
            status = AccountStatus.PENDING_APPROVAL
        )
        whenever(teacherRepository.findById(203L)).thenReturn(Optional.empty())
        whenever(userJpaRepository.findById(203L)).thenReturn(Optional.of(uPending))

        val detail = teacherService.getTeacherDetails(203L)
        assertEquals(203L, detail.id)
        assertEquals("赵老师", detail.name)
        assertEquals(AccountStatus.PENDING_APPROVAL, detail.status)
        assertEquals(0, detail.assignedStudentCount)
        assertTrue(detail.assignedStudents.isEmpty())
    }

    @Test
    fun `assignStudents throws ConflictException when target teacher is not ACTIVE`() {
        val tPending = TeacherEntity(userId = 202L, employeeNumber = "EMP-202", college = college)
        val uPending = UserEntity(id = 202L, name = "赵老师", role = UserRole.TEACHER, email = EmailAddress("t202@univ.edu.cn"), status = AccountStatus.PENDING_APPROVAL)

        whenever(teacherRepository.findById(202L)).thenReturn(Optional.of(tPending))
        whenever(userJpaRepository.findById(202L)).thenReturn(Optional.of(uPending))

        assertThrows(ConflictException::class.java) {
            teacherService.assignStudents(202L, listOf(1L), assigner)
        }
        verify(studentJpaRepository, never()).saveAll(any<List<StudentEntity>>())
        verify(eventPublisher, never()).publish(any())
    }

    @Test
    fun `assignStudents throws ResourceNotFoundException when any studentId is missing`() {
        val t1 = TeacherEntity(userId = 201L, employeeNumber = "EMP-201", college = college)
        val u1 = UserEntity(id = 201L, name = "张老师", role = UserRole.TEACHER, email = EmailAddress("t201@univ.edu.cn"), status = AccountStatus.ACTIVE)

        whenever(teacherRepository.findById(201L)).thenReturn(Optional.of(t1))
        whenever(userJpaRepository.findById(201L)).thenReturn(Optional.of(u1))
        whenever(studentJpaRepository.findAllById(listOf(1L, 999L))).thenReturn(
            listOf(StudentEntity(1L, "S001", "林小夕", majorEntity, LocalDate.of(2025, 9, 1)))
        )

        assertThrows(ResourceNotFoundException::class.java) {
            teacherService.assignStudents(201L, listOf(1L, 999L), assigner)
        }
        verify(studentJpaRepository, never()).saveAll(any<List<StudentEntity>>())
        verify(eventPublisher, never()).publish(any())
    }

    @Test
    fun `assignStudents handles new assignment, reassignment, idempotent same-teacher no-op, and deduplication`() {
        val targetTeacher = TeacherEntity(userId = 201L, employeeNumber = "EMP-201", college = college)
        val otherTeacher = TeacherEntity(userId = 202L, employeeNumber = "EMP-202", college = college)
        val u1 = UserEntity(id = 201L, name = "张老师", role = UserRole.TEACHER, email = EmailAddress("t201@univ.edu.cn"), status = AccountStatus.ACTIVE)

        val unassigned = StudentEntity(id = 1L, studentNumber = "S001", name = "林小夕", major = majorEntity, enrollmentDate = LocalDate.of(2025, 9, 1), assignedTeacher = null)
        val fromOther = StudentEntity(id = 2L, studentNumber = "S002", name = "陈墨", major = majorEntity, enrollmentDate = LocalDate.of(2025, 9, 1), assignedTeacher = otherTeacher)
        val alreadySame = StudentEntity(id = 3L, studentNumber = "S003", name = "王磊", major = majorEntity, enrollmentDate = LocalDate.of(2025, 9, 1), assignedTeacher = targetTeacher)

        whenever(teacherRepository.findById(201L)).thenReturn(Optional.of(targetTeacher))
        whenever(userJpaRepository.findById(201L)).thenReturn(Optional.of(u1))
        whenever(studentJpaRepository.findAllById(listOf(1L, 2L, 3L))).thenReturn(listOf(unassigned, fromOther, alreadySame))
        whenever(studentJpaRepository.saveAll(any<List<StudentEntity>>())).thenAnswer { it.arguments[0] }

        val response = teacherService.assignStudents(201L, listOf(1L, 2L, 3L, 1L), assigner)

        assertEquals(1, response.assignedCount)
        assertEquals(1, response.reassignedCount)
        assertEquals(1, response.unchangedCount)
        assertEquals(listOf(1L, 2L), response.assignedStudentIds)
        assertEquals(targetTeacher, unassigned.assignedTeacher)
        assertEquals(targetTeacher, fromOther.assignedTeacher)

        val savedCaptor = argumentCaptor<List<StudentEntity>>()
        verify(studentJpaRepository).saveAll(savedCaptor.capture())
        assertEquals(listOf(1L, 2L), savedCaptor.firstValue.map { it.id })

        val eventCaptor = argumentCaptor<StudentAssignedToTeacherEvent>()
        verify(eventPublisher, times(2)).publish(eventCaptor.capture())
        assertEquals(listOf(1L, 2L), eventCaptor.allValues.map { it.studentId })
        assertNull(eventCaptor.allValues[0].previousTeacherId)
        assertEquals(202L, eventCaptor.allValues[1].previousTeacherId)
        assertTrue(eventCaptor.allValues.all { it.teacherId == 201L && it.assignerName == "张主任" })
    }

    @Test
    fun `unassignStudent clears assignedTeacher without event and throws ConflictException on mismatch`() {
        val targetTeacher = TeacherEntity(userId = 201L, employeeNumber = "EMP-201", college = college)
        val otherTeacher = TeacherEntity(userId = 202L, employeeNumber = "EMP-202", college = college)
        val assigned = StudentEntity(id = 1L, studentNumber = "S001", name = "林小夕", major = majorEntity, enrollmentDate = LocalDate.of(2025, 9, 1), assignedTeacher = targetTeacher)
        val assignedElsewhere = StudentEntity(id = 2L, studentNumber = "S002", name = "陈墨", major = majorEntity, enrollmentDate = LocalDate.of(2025, 9, 1), assignedTeacher = otherTeacher)

        whenever(teacherRepository.existsById(201L)).thenReturn(true)
        whenever(studentJpaRepository.findById(2L)).thenReturn(Optional.of(assignedElsewhere))

        assertThrows(ConflictException::class.java) {
            teacherService.unassignStudent(201L, 2L)
        }

        whenever(studentJpaRepository.findById(1L)).thenReturn(Optional.of(assigned))
        whenever(studentJpaRepository.save(assigned)).thenReturn(assigned)

        val result = teacherService.unassignStudent(201L, 1L)
        assertTrue(result.success)
        assertEquals(1L, result.unassignedStudentId)
        assertNull(assigned.assignedTeacher)
        verify(eventPublisher, never()).publish(any())
    }
}
