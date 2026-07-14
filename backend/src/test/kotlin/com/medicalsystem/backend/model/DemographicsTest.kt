package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.LocalDate

class DemographicsTest {

    private fun createValidDemographics(
        dateOfBirth: LocalDate? = LocalDate.of(2000, 1, 1),
        idCardNumber: String? = "110105200001011234",
        email: String? = "test@example.com",
        contactNumber: String? = "13800138000",
        emergencyContactPhone: String? = "13900139000"
    ): Demographics {
        return Demographics(
            gender = Gender.MALE,
            dateOfBirth = dateOfBirth,
            ethnicity = Ethnicity(1L, "汉族"),
            idCardNumber = idCardNumber?.let { com.medicalsystem.backend.model.IdCardNumber(it) },
            contactNumber = contactNumber?.let { com.medicalsystem.backend.model.MobileNumber(it) },
            email = email?.let { com.medicalsystem.backend.model.EmailAddress(it) },
            homeAddress = "Beijing",
            emergencyContactName = "John Doe",
            emergencyContactPhone = emergencyContactPhone?.let { com.medicalsystem.backend.model.PhoneNumber(it) },
            school = School(1L, "Test School")
        )
    }

    @Test
    fun `should allow valid demographics`() {
        assertDoesNotThrow {
            createValidDemographics()
        }
    }

    @Test
    fun `should throw exception for future date of birth`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(dateOfBirth = LocalDate.now().plusDays(1))
        }
        assertTrue(ex.message!!.contains("future", ignoreCase = true))
    }

    @Test
    fun `should throw exception for invalid ID card length`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(idCardNumber = "1234") // too short
        }
        assertTrue(ex.message!!.contains("ID", ignoreCase = true))
    }
    
    @Test
    fun `should throw exception for invalid ID card format`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(idCardNumber = "11010520000101123Y") // Y is invalid checksum
        }
        assertTrue(ex.message!!.contains("ID", ignoreCase = true))
    }

    @Test
    fun `should throw exception for invalid email without @`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(email = "testexample.com")
        }
        assertTrue(ex.message!!.contains("email", ignoreCase = true))
    }
    
    @Test
    fun `should throw exception for invalid email with spaces`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(email = "test @example.com")
        }
        assertTrue(ex.message!!.contains("email", ignoreCase = true))
    }

    @Test
    fun `should throw exception for invalid contact number with letters`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(contactNumber = "13800138abc")
        }
        assertTrue(ex.message!!.contains("Contact number", ignoreCase = true))
    }

    @Test
    fun `should throw exception for invalid contact number length`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(contactNumber = "138") // too short for chinese mobile
        }
        assertTrue(ex.message!!.contains("Contact number", ignoreCase = true))
    }

    @Test
    fun `should throw exception for invalid emergency contact phone`() {
        val ex = assertThrows(IllegalArgumentException::class.java) {
            createValidDemographics(emergencyContactPhone = "phone")
        }
        assertTrue(ex.message!!.contains("phone number", ignoreCase = true))
    }
}
