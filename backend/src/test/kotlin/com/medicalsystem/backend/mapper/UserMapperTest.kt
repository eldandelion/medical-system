package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class UserMapperTest {

    private val mapper = UserMapper()

    @Test
    fun `toModel should correctly map DoctorEntity`() {
        val hospital = HospitalEntity(id = 1L, name = "General Hospital")
        val department = DepartmentEntity(id = 10L, name = "Cardiology", hospital = hospital)
        val entity = DoctorEntity(
            id = 1L,
            name = "Dr. Smith",
            email = EmailAddress("smith@hospital.com"),
            department = department,
            phone = "123-456-7890"
        )

        val model = mapper.toModel(entity)

        assertTrue(model is Doctor)
        val doctor = model as Doctor
        assertEquals(1L, doctor.id)
        assertEquals("Dr. Smith", doctor.name)
        assertEquals("smith@hospital.com", doctor.email.value)
        assertEquals(10L, doctor.departmentId)
        assertEquals("123-456-7890", doctor.phone?.value)
        assertEquals(UserRole.DOCTOR, doctor.role)
    }

    @Test
    fun `toEntity should correctly map Doctor model without relationships`() {
        val model = Doctor(
            id = 1L,
            name = "Dr. Smith",
            email = EmailAddress("smith@hospital.com"),
            departmentId = 10L,
            phone = PhoneNumber("123-456-7890")
        )

        val entity = mapper.toEntity(model)

        assertTrue(entity is DoctorEntity)
        val doctorEntity = entity as DoctorEntity
        assertEquals(1L, doctorEntity.id)
        assertEquals("Dr. Smith", doctorEntity.name)
        assertEquals(EmailAddress("smith@hospital.com"), doctorEntity.email)
        assertEquals("123-456-7890", doctorEntity.phone)
        assertNull(doctorEntity.department)
    }

    @Test
    fun `toModel should correctly map TeacherEntity`() {
        val college = CollegeEntity(id = 20L, name = "Engineering")
        val entity = TeacherEntity(
            id = 2L,
            name = "Prof. Doe",
            email = EmailAddress("doe@college.edu"),
            employeeNumber = "EMP-123",
            college = college
        )

        val model = mapper.toModel(entity)

        assertTrue(model is Teacher)
        val teacher = model as Teacher
        assertEquals(2L, teacher.id)
        assertEquals("Prof. Doe", teacher.name)
        assertEquals("doe@college.edu", teacher.email.value)
        assertEquals(20L, teacher.collegeId)
        assertEquals(UserRole.TEACHER, teacher.role)
    }

    @Test
    fun `toEntity should correctly map Teacher model without relationships`() {
        val model = Teacher(
            id = 2L,
            name = "Prof. Doe",
            email = EmailAddress("doe@college.edu"),
            employeeNumber = SchoolEmployeeId("EMP-123"),
            collegeId = 20L
        )

        val entity = mapper.toEntity(model)

        assertTrue(entity is TeacherEntity)
        val teacherEntity = entity as TeacherEntity
        assertEquals(2L, teacherEntity.id)
        assertEquals("Prof. Doe", teacherEntity.name)
        assertEquals(EmailAddress("doe@college.edu"), teacherEntity.email)
        assertEquals("EMP-123", teacherEntity.employeeNumber)
        assertNotNull(teacherEntity.college)
        assertEquals(20L, teacherEntity.college.id)
    }
}
