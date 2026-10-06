package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
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
    private lateinit var hospitalDepartmentRepository: HospitalDepartmentRepository

    @Mock
    private lateinit var teacherRepository: TeacherRepository

    @Mock
    private lateinit var doctorRepository: DoctorRepository

    @Mock
    private lateinit var trialAdminRepository: TrialAdminRepository

    @Mock
    private lateinit var headCounsellorRepository: HeadCounsellorRepository

    @Mock
    private lateinit var schoolDepartmentRepository: SchoolDepartmentRepository

    @Mock
    private lateinit var notificationRepository: NotificationRepository

    @Mock
    private lateinit var referralRepository: ReferralRepository

    @Mock
    private lateinit var userJpaRepository: com.medicalsystem.backend.repository.UserJpaRepository

    @Mock
    private lateinit var assessmentAssignmentRepository: com.medicalsystem.backend.repository.AssessmentAssignmentJpaRepository

    @Mock
    private lateinit var referralJpaRepository: com.medicalsystem.backend.repository.ReferralJpaRepository

    @Mock
    private lateinit var notificationJpaRepository: com.medicalsystem.backend.repository.NotificationJpaRepository

    @Mock
    private lateinit var entityManager: jakarta.persistence.EntityManager

    private lateinit var dashboardService: DashboardService

    @org.junit.jupiter.api.BeforeEach
    fun setup() {
        dashboardService = DashboardService(
            studentRepository,
            userRepository,
            collegeRepository,
            hospitalRepository,
            hospitalDepartmentRepository,
            teacherRepository,
            doctorRepository,
            trialAdminRepository,
            headCounsellorRepository,
            schoolDepartmentRepository,
            notificationRepository,
            referralRepository,
            userJpaRepository,
            assessmentAssignmentRepository,
            referralJpaRepository,
            notificationJpaRepository,
            entityManager
        )
    }

    @Test
    fun `getStudentProfile maps domain model to dto correctly`() {
        val mockUser = User(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"), role = UserRole.STUDENT)
        
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
        assertEquals(UserRole.STUDENT, result.role)
        assertEquals("ST123", result.studentId)
        assertEquals("Engineering", result.school)
        assertEquals("Computer Science", result.department)
    }

    @Test
    fun `getTeacherProfile maps domain model to dto correctly`() {
        val mockUser = User(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), role = UserRole.TEACHER)
        val college = College(id = 50L, name = "Science")

        val teacherEntity = com.medicalsystem.backend.entity.TeacherEntity(userId = 2L, employeeNumber = "EMP-123", college = com.medicalsystem.backend.entity.CollegeEntity(id = 50L, name = "Science"))

        `when`(teacherRepository.findById(2L)).thenReturn(Optional.of(teacherEntity))
        `when`(collegeRepository.findById(50L)).thenReturn(Optional.of(college))

        val result = dashboardService.getTeacherProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Jane Smith", result.name)
        assertEquals(UserRole.TEACHER, result.role)
        assertEquals("EMP-123", result.employeeId)
        assertEquals("Science", result.department)
    }

    @Test
    fun `getTrialAdminProfile maps domain model to dto correctly`() {
        val mockUser = User(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        val hospital = HospitalEntity(id = 200L, name = "University Hospital")

        val trialAdminEntity = TrialAdminEntity(userId = 3L, employeeNumber = "HOSP-001", hospital = HospitalEntity(id = 200L, name = "University Hospital"))

        `when`(trialAdminRepository.findById(3L)).thenReturn(Optional.of(trialAdminEntity))
        `when`(hospitalRepository.findById(200L)).thenReturn(Optional.of(hospital))

        val result = dashboardService.getTrialAdminProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Admin Wang", result.name)
        assertEquals(UserRole.TRIAL_ADMIN, result.role)
        assertEquals("HOSP-001", result.employeeId)
        assertEquals("University Hospital", result.hospital)
    }

    @Test
    fun `getHeadCounsellorProfile maps domain model to dto correctly`() {
        val mockUser = User(id = 4L, name = "Counsellor Li", email = EmailAddress("li@univ.edu.cn"), role = UserRole.HEAD_COUNSELLOR)
        
        val headCounsellor = HeadCounsellor(userId = 4L, employeeNumber = SchoolEmployeeId("HC-004"), schoolId = 1L, departmentId = 7L)
        val department = SchoolDepartment(id = 7L, name = "Psychology Department", schoolId = 1L)

        `when`(headCounsellorRepository.findById(4L)).thenReturn(Optional.of(headCounsellor))
        `when`(schoolDepartmentRepository.findById(7L)).thenReturn(Optional.of(department))

        val result = dashboardService.getHeadCounsellorProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Counsellor Li", result.name)
        assertEquals(UserRole.HEAD_COUNSELLOR, result.role)
        assertEquals("HC-004", result.employeeId)
        assertEquals("Psychology Department", result.department)
    }

    @Test
    fun `getStudentDashboard returns student metrics`() {
        val mockUser = User(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"), role = UserRole.STUDENT)
        `when`(notificationRepository.countUnreadByUserId(1L)).thenReturn(4L)

        val result = dashboardService.getStudentDashboard(mockUser)

        assertEquals(0L, result.metrics.assessmentsCount)
        assertEquals(4L, result.metrics.notificationsCount)
    }

    @Test
    fun `getStudentDashboard throws ForbiddenException for mismatched role`() {
        val wrongUser = User(id = 2L, name = "Jane", email = EmailAddress("jane@univ.edu.cn"), role = UserRole.TEACHER)
        assertThrows(ForbiddenException::class.java) {
            dashboardService.getStudentDashboard(wrongUser)
        }
    }

    @Test
    fun `getTeacherDashboard returns teacher metrics`() {
        val mockUser = User(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), role = UserRole.TEACHER)
        `when`(studentRepository.countVisibleStudentsFor(mockUser)).thenReturn(42L)
        `when`(notificationRepository.countUnreadByUserId(2L)).thenReturn(3L)

        val result = dashboardService.getTeacherDashboard(mockUser)

        assertEquals(42L, result.metrics.studentsCount)
        assertEquals(3L, result.metrics.notificationsCount)
    }

    @Test
    fun `getHeadCounsellorDashboard returns head counsellor metrics`() {
        val mockUser = User(id = 4L, name = "Counsellor Li", email = EmailAddress("li@univ.edu.cn"), role = UserRole.HEAD_COUNSELLOR)
        `when`(studentRepository.countVisibleStudentsFor(mockUser)).thenReturn(150L)
        `when`(referralRepository.countActionableReferralsFor(mockUser)).thenReturn(5L)

        val result = dashboardService.getHeadCounsellorDashboard(mockUser)

        assertEquals(150L, result.metrics.studentsCount)
        assertEquals(5L, result.metrics.referralsCount)
    }

    @Test
    fun `getTrialAdminDashboard returns trial admin metrics`() {
        val mockUser = User(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        val trialAdminEntity = TrialAdminEntity(userId = 3L, employeeNumber = "TA-01", hospital = HospitalEntity(id = 10L, name = "First Hospital"))
        `when`(trialAdminRepository.findById(3L)).thenReturn(Optional.of(trialAdminEntity))
        `when`(doctorRepository.countByDepartmentHospitalId(10L)).thenReturn(12L)
        `when`(referralRepository.countActionableReferralsFor(mockUser)).thenReturn(7L)

        val result = dashboardService.getTrialAdminDashboard(mockUser)

        assertEquals(12L, result.metrics.staffCount)
        assertEquals(7L, result.metrics.referralsCount)
    }

    @Test
    fun `getDoctorDashboard returns doctor metrics`() {
        val mockUser = User(id = 5L, name = "Dr. House", email = EmailAddress("house@univ.edu.cn"), role = UserRole.DOCTOR)
        `when`(referralRepository.countActionableReferralsFor(mockUser)).thenReturn(8L)
        `when`(notificationRepository.countUnreadByUserId(5L)).thenReturn(2L)

        val result = dashboardService.getDoctorDashboard(mockUser)

        assertEquals(8L, result.metrics.referralsCount)
        assertEquals(2L, result.metrics.notificationsCount)
    }

    @Test
    fun `getAdminProfile returns admin profile correctly`() {
        val mockUser = User(id = 99L, name = "System Administrator", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.SYSTEM_ADMIN)
        val result = dashboardService.getAdminProfile(mockUser)

        assertEquals("System Administrator", result.name)
        assertEquals(UserRole.SYSTEM_ADMIN, result.role)
        assertEquals("SYS-ADMIN", result.employeeId)
        assertEquals("系统管理部", result.department)
    }

    @Test
    fun `getAdminDashboard returns admin metrics`() {
        val mockUser = User(id = 99L, name = "System Administrator", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.SYSTEM_ADMIN)
        val u1 = com.medicalsystem.backend.entity.UserEntity(id = 1L, name = "U1", email = EmailAddress("u1@a.com"), role = UserRole.STUDENT, status = AccountStatus.ACTIVE)
        val u2 = com.medicalsystem.backend.entity.UserEntity(id = 2L, name = "U2", email = EmailAddress("u2@a.com"), role = UserRole.TEACHER, status = AccountStatus.PENDING_APPROVAL)
        val u3 = com.medicalsystem.backend.entity.UserEntity(id = 3L, name = "U3", email = EmailAddress("u3@a.com"), role = UserRole.DOCTOR, status = AccountStatus.DELETED)

        `when`(userJpaRepository.findAll()).thenReturn(listOf(u1, u2, u3))
        `when`(referralRepository.countActionableReferralsFor(mockUser)).thenReturn(4L)
        `when`(assessmentAssignmentRepository.countByStatus(AssessmentStatus.COMPLETED)).thenReturn(25L)

        val result = dashboardService.getAdminDashboard(mockUser)

        assertEquals(2L, result.metrics.totalUsersCount)
        assertEquals(1L, result.metrics.pendingApprovalsCount)
        assertEquals(4L, result.metrics.activeReferralsCount)
        assertEquals(25L, result.metrics.completedAssessmentsCount)
    }

    @Test
    fun `getRecentActivity for STUDENT returns pending assessments and referrals`() {
        val mockUser = User(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"), role = UserRole.STUDENT)
        
        val spec = org.mockito.kotlin.any<org.springframework.data.jpa.domain.Specification<com.medicalsystem.backend.entity.ReferralEntity>>()
        val pageable = org.mockito.kotlin.any<org.springframework.data.domain.Pageable>()
        val page = org.springframework.data.domain.PageImpl<com.medicalsystem.backend.entity.ReferralEntity>(emptyList())
        
        `when`(referralJpaRepository.findAll(spec, pageable)).thenReturn(page)
        `when`(assessmentAssignmentRepository.findTop5ByStudentIdAndStatusOrderByAssignedAtDesc(1L, com.medicalsystem.backend.model.AssessmentStatus.PENDING)).thenReturn(emptyList())

        val result = dashboardService.getRecentActivity(mockUser)
        assertEquals(0, result.activities.size)
    }

    @Test
    fun `getRecentActivity for TEACHER returns notifications and referrals`() {
        val mockUser = User(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), role = UserRole.TEACHER)
        
        val spec = org.mockito.kotlin.any<org.springframework.data.jpa.domain.Specification<com.medicalsystem.backend.entity.ReferralEntity>>()
        val pageable = org.mockito.kotlin.any<org.springframework.data.domain.Pageable>()
        val page = org.springframework.data.domain.PageImpl<com.medicalsystem.backend.entity.ReferralEntity>(emptyList())
        
        `when`(referralJpaRepository.findAll(spec, pageable)).thenReturn(page)
        
        val query = org.mockito.Mockito.mock(jakarta.persistence.TypedQuery::class.java) as jakarta.persistence.TypedQuery<com.medicalsystem.backend.entity.NotificationEntity>
        `when`(entityManager.createQuery(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.eq(com.medicalsystem.backend.entity.NotificationEntity::class.java))).thenReturn(query)
        `when`(query.setParameter(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any())).thenReturn(query)
        `when`(query.setMaxResults(org.mockito.ArgumentMatchers.anyInt())).thenReturn(query)
        `when`(query.resultList).thenReturn(emptyList())

        val result = dashboardService.getRecentActivity(mockUser)
        assertEquals(0, result.activities.size)
    }
}
