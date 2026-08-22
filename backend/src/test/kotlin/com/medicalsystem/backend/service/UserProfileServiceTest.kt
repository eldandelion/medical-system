package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.UpdateUserProfileRequest
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.util.*

@ExtendWith(MockitoExtension::class)
class UserProfileServiceTest {

    @Mock
    private lateinit var userJpaRepository: UserJpaRepository

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
    private lateinit var ethnicityJpaRepository: EthnicityJpaRepository

    @Mock
    private lateinit var schoolJpaRepository: SchoolJpaRepository

    @InjectMocks
    private lateinit var userProfileService: UserProfileService

    private val studentUser = User(
        id = 10L,
        name = "Student Zhang",
        email = EmailAddress("zhang@univ.edu.cn"),
        role = UserRole.STUDENT
    )

    private val studentEntity = StudentEntity(
        id = 10L,
        studentNumber = "STU-1001",
        name = "Student Zhang",
        major = MajorEntity(
            id = 1L,
            name = "Computer Science",
            college = CollegeEntity(
                id = 1L,
                name = "School of CS"
            )
        ),
        enrollmentDate = LocalDate.of(2023, 9, 1),
        demographics = StudentDemographicsEntity(
            gender = Gender.MALE,
            dateOfBirth = LocalDate.of(2003, 5, 10),
            contactNumber = "13800138000"
        )
    )

    private val userEntity = UserEntity(
        id = 10L,
        name = "Student Zhang",
        role = UserRole.STUDENT,
        email = EmailAddress("zhang@univ.edu.cn")
    )

    @Test
    fun `getProfile returns populated student details for Student user`() {
        `when`(userJpaRepository.findById(10L)).thenReturn(Optional.of(userEntity))
        `when`(studentJpaRepository.findById(10L)).thenReturn(Optional.of(studentEntity))

        val profile = userProfileService.getProfile(studentUser)

        assertNotNull(profile)
        assertEquals("Student Zhang", profile.name)
        assertEquals("STU-1001", profile.studentProfile?.studentNumber)
        assertEquals("Computer Science", profile.studentProfile?.major)
        assertEquals(Gender.MALE, profile.studentProfile?.gender)
        assertEquals("13800138000", profile.studentProfile?.contactNumber)
    }

    @Test
    fun `updateProfile updates name and mutable demographics fields`() {
        `when`(userJpaRepository.findById(10L)).thenReturn(Optional.of(userEntity))
        `when`(studentJpaRepository.findById(10L)).thenReturn(Optional.of(studentEntity))

        val request = UpdateUserProfileRequest(
            name = "Zhang San",
            contactNumber = "13911112222",
            homeAddress = "Haidian, Beijing"
        )

        val updated = userProfileService.updateProfile(studentUser, request)

        assertEquals("Zhang San", updated.name)
        assertEquals("13911112222", updated.studentProfile?.contactNumber)
        assertEquals("Haidian, Beijing", updated.studentProfile?.homeAddress)
        verify(studentJpaRepository).save(studentEntity)
        verify(userJpaRepository).save(userEntity)
    }
}
