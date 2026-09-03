package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class UserDetailAssemblerTest {

    @Mock
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Mock
    private lateinit var teacherJpaRepository: TeacherJpaRepository

    @Mock
    private lateinit var doctorRepository: DoctorRepository

    @Mock
    private lateinit var headCounsellorJpaRepository: HeadCounsellorJpaRepository

    @Mock
    private lateinit var trialAdminJpaRepository: TrialAdminJpaRepository

    @Mock
    private lateinit var schoolJpaRepository: SchoolJpaRepository

    @InjectMocks
    private lateinit var assembler: UserDetailAssembler

    @Test
    fun `assemble student user maps demographics and academic affiliation`() {
        val userEntity = UserEntity(
            id = 101L,
            name = "Student Alex",
            email = EmailAddress("alex@univ.edu.cn"),
            role = UserRole.STUDENT,
            status = AccountStatus.ACTIVE
        )

        val college = CollegeEntity(id = 1L, name = "College of Computer Science")
        val major = MajorEntity(id = 2L, name = "Software Engineering", college = college)
        val school = SchoolEntity(id = 3L, name = "Central University")
        val ethnicity = EthnicityEntity(id = 1L, name = "Han")

        val demographics = StudentDemographicsEntity(
            gender = Gender.MALE,
            dateOfBirth = LocalDate.of(2004, 5, 12),
            ethnicity = ethnicity,
            idCardNumber = "110101200405121234",
            contactNumber = "13800138000",
            email = "alex@univ.edu.cn",
            homeAddress = "Haidian District, Beijing",
            emergencyContactName = "John Alex",
            emergencyContactPhone = "13900139000",
            school = school
        )

        val studentEntity = StudentEntity(
            id = 101L,
            studentNumber = "STU-101",
            name = "Student Alex",
            major = major,
            enrollmentDate = LocalDate.of(2023, 9, 1),
            demographics = demographics
        )

        `when`(studentJpaRepository.findById(101L)).thenReturn(Optional.of(studentEntity))

        val result = assembler.assemble(userEntity)

        assertEquals(101L, result.id)
        assertEquals("Student Alex", result.name)
        assertEquals(UserRole.STUDENT, result.role)
        assertEquals("STU-101", result.employeeOrStudentId)
        assertEquals("Central University", result.affiliation.primaryOrganization)
        assertEquals("College of Computer Science / Software Engineering", result.affiliation.departmentOrMajor)
        assertEquals(2023, result.affiliation.enrollmentYear)

        assertNotNull(result.demographics)
        assertEquals("MALE", result.demographics?.gender)
        assertEquals("Han", result.demographics?.ethnicity)
        assertEquals("110101200405121234", result.demographics?.idCardNumber)
        assertEquals("13800138000", result.contactNumber)
        assertEquals("Haidian District, Beijing", result.homeAddress)
        assertEquals("John Alex", result.demographics?.emergencyContactName)
    }

    @Test
    fun `assemble doctor user maps hospital department and contact phone`() {
        val userEntity = UserEntity(
            id = 202L,
            name = "Dr. Liu",
            email = EmailAddress("liu@hospital.edu.cn"),
            role = UserRole.DOCTOR,
            status = AccountStatus.ACTIVE
        )

        val hospital = HospitalEntity(id = 1L, name = "Xiangya Hospital")
        val department = HospitalDepartmentEntity(id = 10L, name = "Psychiatry", hospital = hospital)
        val doctorEntity = DoctorEntity(
            userId = 202L,
            employeeNumber = "DOC-202",
            department = department,
            phone = "13700137000"
        )

        `when`(doctorRepository.findById(202L)).thenReturn(Optional.of(doctorEntity))

        val result = assembler.assemble(userEntity)

        assertEquals(202L, result.id)
        assertEquals("Dr. Liu", result.name)
        assertEquals("DOC-202", result.employeeOrStudentId)
        assertEquals("Xiangya Hospital", result.hospital)
        assertEquals("Psychiatry", result.departmentOrCollege)
        assertEquals("13700137000", result.contactNumber)
        assertEquals("DOCTOR", result.affiliation.titleOrDegree)
        assertNull(result.demographics)
    }
}
