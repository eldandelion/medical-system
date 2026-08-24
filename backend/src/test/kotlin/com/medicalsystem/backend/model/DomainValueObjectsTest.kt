package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class DomainValueObjectsTest {

    @Test
    fun `IdCardNumber validates Chinese 18-digit ID format correctly`() {
        val validId = "110101200001011234"
        val validIdX = "11010120000101123X"
        val invalidShort = "123456"
        val invalidMonth = "110101200013011234"

        assertTrue(IdCardNumber.isValid(validId))
        assertTrue(IdCardNumber.isValid(validIdX))
        assertFalse(IdCardNumber.isValid(invalidShort))
        assertFalse(IdCardNumber.isValid(invalidMonth))
        assertFalse(IdCardNumber.isValid(null))

        assertNotNull(IdCardNumber.fromOrNull(validId))
        assertNull(IdCardNumber.fromOrNull(invalidShort))
        assertNull(IdCardNumber.fromOrNull(null))

        val vo = IdCardNumber(validId)
        assertEquals(validId, vo.value)

        assertThrows<IllegalArgumentException> {
            IdCardNumber(invalidShort)
        }
    }

    @Test
    fun `MobileNumber validates 11-digit mobile format correctly`() {
        val validMobile = "13800138000"
        val validMobile19 = "19912345678"
        val invalidShort = "12345"
        val invalidPrefix = "12800138000"

        assertTrue(MobileNumber.isValid(validMobile))
        assertTrue(MobileNumber.isValid(validMobile19))
        assertFalse(MobileNumber.isValid(invalidShort))
        assertFalse(MobileNumber.isValid(invalidPrefix))
        assertFalse(MobileNumber.isValid(null))

        assertNotNull(MobileNumber.fromOrNull(validMobile))
        assertNull(MobileNumber.fromOrNull(invalidShort))

        val vo = MobileNumber(validMobile)
        assertEquals(validMobile, vo.value)

        assertThrows<IllegalArgumentException> {
            MobileNumber(invalidShort)
        }
    }

    @Test
    fun `PhoneNumber validates landline and general telephone format`() {
        val validLandline = "010-12345678"
        val validMobile = "13800138000"
        val invalidLetters = "abc-12345"

        assertTrue(PhoneNumber.isValid(validLandline))
        assertTrue(PhoneNumber.isValid(validMobile))
        assertFalse(PhoneNumber.isValid(invalidLetters))
        assertFalse(PhoneNumber.isValid(null))

        assertNotNull(PhoneNumber.fromOrNull(validLandline))
        assertNull(PhoneNumber.fromOrNull(invalidLetters))

        val vo = PhoneNumber(validLandline)
        assertEquals(validLandline, vo.value)

        assertThrows<IllegalArgumentException> {
            PhoneNumber(invalidLetters)
        }
    }

    @Test
    fun `EmailAddress validates standard email format`() {
        val validEmail = "student@univ.edu.cn"
        val validComplex = "john.doe+tag@example.com"
        val invalidNoAt = "plainaddress"
        val invalidNoDomain = "user@"

        assertTrue(EmailAddress.isValid(validEmail))
        assertTrue(EmailAddress.isValid(validComplex))
        assertFalse(EmailAddress.isValid(invalidNoAt))
        assertFalse(EmailAddress.isValid(invalidNoDomain))
        assertFalse(EmailAddress.isValid(null))

        assertNotNull(EmailAddress.fromOrNull(validEmail))
        assertNull(EmailAddress.fromOrNull(invalidNoAt))

        val vo = EmailAddress(validEmail)
        assertEquals(validEmail, vo.value)

        assertThrows<IllegalArgumentException> {
            EmailAddress(invalidNoAt)
        }
    }

    @Test
    fun `SchoolEmployeeId and HospitalEmployeeId validate employee ID formats`() {
        val validSchoolEmp = "EMP-00001"
        val invalidSchoolEmp = "123" // too short

        assertTrue(SchoolEmployeeId.isValid(validSchoolEmp))
        assertFalse(SchoolEmployeeId.isValid(invalidSchoolEmp))
        assertNotNull(SchoolEmployeeId.fromOrNull(validSchoolEmp))
        assertNull(SchoolEmployeeId.fromOrNull(invalidSchoolEmp))

        val validHospEmp = "DOC-99881"
        val invalidHospEmp = "D"

        assertTrue(HospitalEmployeeId.isValid(validHospEmp))
        assertFalse(HospitalEmployeeId.isValid(invalidHospEmp))
        assertNotNull(HospitalEmployeeId.fromOrNull(validHospEmp))
        assertNull(HospitalEmployeeId.fromOrNull(invalidHospEmp))
    }
}
