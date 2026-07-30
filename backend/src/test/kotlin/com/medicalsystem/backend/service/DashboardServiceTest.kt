package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.repository.CollegeRepository
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.entity.HospitalEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class DashboardServiceTest {

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var collegeRepository: CollegeRepository

    @Mock
    private lateinit var hospitalRepository: HospitalRepository

    @Mock
    private lateinit var hospitalDepartmentRepository: com.medicalsystem.backend.repository.HospitalDepartmentRepository

    @Mock
    private lateinit var teacherRepository: com.medicalsystem.backend.repository.TeacherRepository

    @Mock
    private lateinit var doctorRepository: com.medicalsystem.backend.repository.DoctorRepository

    @Mock
    private lateinit var trialAdminRepository: com.medicalsystem.backend.repository.TrialAdminRepository

    @Mock
    private lateinit var headCounsellorRepository: com.medicalsystem.backend.repository.HeadCounsellorRepository

    @Mock
    private lateinit var schoolDepartmentRepository: com.medicalsystem.backend.repository.SchoolDepartmentRepository

    @InjectMocks
    private lateinit var dashboardService: DashboardService

    @Test
    fun `getStudentProfile maps domain model to dto correctly`() {
        val mockUser = com.medicalsystem.backend.model.User(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.STUDENT)
        
        val college = College(id = 10L, name = "Engineering")
        val major = Major(id = 100L, name = "Computer Science", college = college)
        val student = Student(
            id = 1L,
            studentNumber = "ST123",
            name = "John Doe",
            major = major,
            enrollmentDate = LocalDate.now(),
            riskStatus = RiskStatus.LOW
        )

        `when`(studentRepository.findById(1L)).thenReturn(Optional.of(student))

        val result = dashboardService.getStudentProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("John Doe", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.STUDENT, result.role)
        assertEquals("ST123", result.studentId)
        assertEquals("Engineering", result.school)
        assertEquals("Computer Science", result.department)
    }

    @Test
    fun `getTeacherProfile maps domain model to dto correctly`() {
        val mockUser = com.medicalsystem.backend.model.User(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.TEACHER)
        val teacherUser = com.medicalsystem.backend.model.User(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.TEACHER)
        val college = College(id = 50L, name = "Science")

        val teacherEntity = com.medicalsystem.backend.entity.TeacherEntity(userId = 2L, employeeNumber = "EMP-123", college = com.medicalsystem.backend.entity.CollegeEntity(id = 50L, name = "Science"))

        `when`(teacherRepository.findById(2L)).thenReturn(Optional.of(teacherEntity))
        `when`(collegeRepository.findById(50L)).thenReturn(Optional.of(college))

        val result = dashboardService.getTeacherProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Jane Smith", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.TEACHER, result.role)
        assertEquals("EMP-123", result.employeeId)
        assertEquals("Science", result.department)
    }

    @Test
    fun `getTrialAdminProfile maps domain model to dto correctly`() {
        val mockUser = com.medicalsystem.backend.model.User(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN)
        val hospital = HospitalEntity(id = 200L, name = "University Hospital")

        val trialAdminEntity = com.medicalsystem.backend.entity.TrialAdminEntity(userId = 3L, employeeNumber = "HOSP-001", hospital = HospitalEntity(id = 200L, name = "University Hospital"))

        `when`(trialAdminRepository.findById(3L)).thenReturn(Optional.of(trialAdminEntity))
        `when`(hospitalRepository.findById(200L)).thenReturn(Optional.of(hospital))

        val result = dashboardService.getTrialAdminProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Admin Wang", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN, result.role)
        assertEquals("HOSP-001", result.employeeId)
        assertEquals("University Hospital", result.hospital)
    }

    @Test
    fun `getHeadCounsellorProfile maps domain model to dto correctly`() {
        val mockUser = com.medicalsystem.backend.model.User(id = 4L, name = "Counsellor Li", email = EmailAddress("li@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.HEAD_COUNSELLOR)
        
        val headCounsellor = HeadCounsellor(userId = 4L, employeeNumber = SchoolEmployeeId("HC-004"), schoolId = 1L, departmentId = 7L)
        val department = SchoolDepartment(id = 7L, name = "Psychology Department", schoolId = 1L)

        `when`(headCounsellorRepository.findById(4L)).thenReturn(Optional.of(headCounsellor))
        `when`(schoolDepartmentRepository.findById(7L)).thenReturn(Optional.of(department))

        val result = dashboardService.getHeadCounsellorProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Counsellor Li", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.HEAD_COUNSELLOR, result.role)
        assertEquals("HC-004", result.employeeId)
        assertEquals("Psychology Department", result.department)
    }
}
