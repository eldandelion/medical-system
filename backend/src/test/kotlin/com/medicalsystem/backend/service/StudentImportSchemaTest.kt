package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.Gender
import org.junit.jupiter.api.Assertions.assertArrayEquals
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class StudentImportSchemaTest {

    @Test
    fun `generateTemplateHeaderCsv produces exact 13 Chinese header columns`() {
        val headerCsv = StudentImportSchema.generateTemplateHeaderCsv()
        val expected = "学号,姓名,专业,入学日期,身份证号,性别,民族,联系电话,电子邮箱,家庭住址,紧急联系人,紧急联系电话,班主任/辅导员工号\n"
        assertEquals(expected, headerCsv)
    }

    @Test
    fun `HEADER_MAPPINGS contains all 13 canonical fields in order`() {
        val mappings = StudentImportSchema.HEADER_MAPPINGS
        assertEquals(13, mappings.size)
        assertEquals("studentNumber", mappings["学号"])
        assertEquals("name", mappings["姓名"])
        assertEquals("major", mappings["专业"])
        assertEquals("enrollmentDate", mappings["入学日期"])
        assertEquals("idCardNumber", mappings["身份证号"])
        assertEquals("gender", mappings["性别"])
        assertEquals("ethnicity", mappings["民族"])
        assertEquals("contactNumber", mappings["联系电话"])
        assertEquals("email", mappings["电子邮箱"])
        assertEquals("homeAddress", mappings["家庭住址"])
        assertEquals("emergencyContactName", mappings["紧急联系人"])
        assertEquals("emergencyContactPhone", mappings["紧急联系电话"])
        assertEquals("teacherEmployeeNumber", mappings["班主任/辅导员工号"])
    }

    @Test
    fun `parseGenderAlias correctly translates Chinese and English aliases`() {
        assertEquals(Gender.MALE, StudentImportSchema.parseGenderAlias("男"))
        assertEquals(Gender.MALE, StudentImportSchema.parseGenderAlias("male"))
        assertEquals(Gender.MALE, StudentImportSchema.parseGenderAlias("MALE"))
        assertEquals(Gender.MALE, StudentImportSchema.parseGenderAlias("M"))

        assertEquals(Gender.FEMALE, StudentImportSchema.parseGenderAlias("女"))
        assertEquals(Gender.FEMALE, StudentImportSchema.parseGenderAlias("female"))
        assertEquals(Gender.FEMALE, StudentImportSchema.parseGenderAlias("FEMALE"))
        assertEquals(Gender.FEMALE, StudentImportSchema.parseGenderAlias("F"))

        assertEquals(Gender.OTHER, StudentImportSchema.parseGenderAlias("其他"))
        assertEquals(Gender.OTHER, StudentImportSchema.parseGenderAlias("other"))
        assertEquals(Gender.OTHER, StudentImportSchema.parseGenderAlias("OTHER"))

        assertNull(StudentImportSchema.parseGenderAlias(null))
        assertNull(StudentImportSchema.parseGenderAlias(""))
        assertNull(StudentImportSchema.parseGenderAlias("未知"))
        assertNull(StudentImportSchema.parseGenderAlias("invalid"))
    }

    @Test
    fun `synthesizeEmail creates standard institutional email`() {
        val email = StudentImportSchema.synthesizeEmail("2026001")
        assertEquals("2026001@univ.edu.cn", email)
    }

    @Test
    fun `UTF8_BOM contains exact 3 standard bytes`() {
        val expected = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())
        assertArrayEquals(expected, StudentImportSchema.UTF8_BOM)
    }

    @Test
    fun `default ethnicity and row number are well-defined constants`() {
        assertEquals("汉族", StudentImportSchema.DEFAULT_ETHNICITY_NAME)
        assertEquals(2, StudentImportSchema.CSV_FIRST_DATA_ROW_NUMBER)
    }
}
