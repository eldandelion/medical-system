package com.medicalsystem.backend.util

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.nio.charset.Charset

class CsvStreamReaderTest {

    @Test
    fun `parse simple UTF-8 CSV returns correct row maps`() {
        val csv = "学号,姓名,专业\nS001,张三,计算机科学\nS002,李四,心理学\n"
        val bytes = csv.toByteArray(Charsets.UTF_8)

        val rows = CsvStreamReader.parse(bytes)

        assertEquals(2, rows.size)
        assertEquals("S001", rows[0]["学号"])
        assertEquals("张三", rows[0]["姓名"])
        assertEquals("计算机科学", rows[0]["专业"])
        assertEquals("S002", rows[1]["学号"])
        assertEquals("李四", rows[1]["姓名"])
    }

    @Test
    fun `parse UTF-8 BOM CSV strips BOM from first header`() {
        val bom = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())
        val content = "学号,姓名\nS001,张三\n".toByteArray(Charsets.UTF_8)
        val bytes = bom + content

        val rows = CsvStreamReader.parse(bytes)

        assertEquals(1, rows.size)
        // BOM should be stripped — header must be "学号", not "\uFEFF学号"
        assertTrue(rows[0].containsKey("学号"), "BOM should be stripped from first header")
        assertFalse(rows[0].keys.any { it.startsWith("\uFEFF") }, "No key should start with BOM character")
        assertEquals("S001", rows[0]["学号"])
        assertEquals("张三", rows[0]["姓名"])
    }

    @Test
    fun `parse GBK encoded CSV decodes Chinese characters correctly`() {
        val csv = "学号,姓名\nS001,张三\n"
        val bytes = csv.toByteArray(Charset.forName("GBK"))

        // GBK bytes are not valid UTF-8, so CsvStreamReader should fall back to GBK
        val rows = CsvStreamReader.parse(bytes)

        assertEquals(1, rows.size)
        assertEquals("S001", rows[0]["学号"])
        assertEquals("张三", rows[0]["姓名"])
    }

    @Test
    fun `parseLine handles quoted field containing comma`() {
        val line = "\"Smith, John\",25,Engineer"

        val cells = CsvStreamReader.parseLine(line)

        assertEquals(3, cells.size)
        assertEquals("Smith, John", cells[0])
        assertEquals("25", cells[1])
        assertEquals("Engineer", cells[2])
    }

    @Test
    fun `parseLine handles escaped double-quotes inside quoted field`() {
        val line = "\"He said \"\"Hello\"\"\",World"

        val cells = CsvStreamReader.parseLine(line)

        assertEquals(2, cells.size)
        assertEquals("He said \"Hello\"", cells[0])
        assertEquals("World", cells[1])
    }

    @Test
    fun `parse throws on empty file`() {
        assertThrows(IllegalArgumentException::class.java) {
            CsvStreamReader.parse(ByteArray(0))
        }
    }

    @Test
    fun `parse returns empty list on header-only file with no data rows`() {
        val csv = "学号,姓名,专业\n"
        val bytes = csv.toByteArray(Charsets.UTF_8)

        val rows = CsvStreamReader.parse(bytes)
        assertEquals(0, rows.size)
    }

    @Test
    fun `parse handles missing trailing cells gracefully`() {
        // Row has fewer cells than headers — missing cells default to empty string
        val csv = "学号,姓名,专业\nS001,张三\n"
        val bytes = csv.toByteArray(Charsets.UTF_8)

        val rows = CsvStreamReader.parse(bytes)

        assertEquals(1, rows.size)
        assertEquals("S001", rows[0]["学号"])
        assertEquals("张三", rows[0]["姓名"])
        assertEquals("", rows[0]["专业"])
    }

    @Test
    fun `parse correctly trims whitespace from headers and cell values`() {
        val csv = " 学号 , 姓名 \n S001 , 张 三 \n"
        val bytes = csv.toByteArray(Charsets.UTF_8)

        val rows = CsvStreamReader.parse(bytes)

        assertEquals(1, rows.size)
        assertTrue(rows[0].containsKey("学号"), "Header should be trimmed")
        assertEquals("S001", rows[0]["学号"])
        assertEquals("张 三", rows[0]["姓名"])
    }

    @Test
    fun `parse handles multiline quoted cell spanning multiple physical lines`() {
        val csv = "学号,姓名,备注\nS001,张三,\"第一行备注\n第二行备注\"\nS002,李四,普通学生\n"
        val bytes = csv.toByteArray(Charsets.UTF_8)

        val rows = CsvStreamReader.parse(bytes)

        assertEquals(2, rows.size)
        assertEquals("S001", rows[0]["学号"])
        assertEquals("第一行备注\n第二行备注", rows[0]["备注"])
        assertEquals("S002", rows[1]["学号"])
        assertEquals("李四", rows[1]["姓名"])
        assertEquals("普通学生", rows[1]["备注"])
    }

    @Test
    fun `parse handles CRLF line terminators seamlessly`() {
        val csv = "学号,姓名,专业\r\nS001,张三,计算机\r\nS002,李四,心理学\r\n"
        val bytes = csv.toByteArray(Charsets.UTF_8)

        val rows = CsvStreamReader.parse(bytes)

        assertEquals(2, rows.size)
        assertEquals("S001", rows[0]["学号"])
        assertEquals("张三", rows[0]["姓名"])
        assertEquals("S002", rows[1]["学号"])
        assertEquals("李四", rows[1]["姓名"])
    }

    @Test
    fun `parseLine handles leading, trailing, and consecutive empty cells`() {
        val line = ",value1,,value2,"
        val cells = CsvStreamReader.parseLine(line)

        assertEquals(5, cells.size)
        assertEquals("", cells[0])
        assertEquals("value1", cells[1])
        assertEquals("", cells[2])
        assertEquals("value2", cells[3])
        assertEquals("", cells[4])
    }

    @Test
    fun `parseLine handles multiple consecutive escaped quotes`() {
        val line = "\"\"\"Hello\"\"\",World"
        val cells = CsvStreamReader.parseLine(line)

        assertEquals(2, cells.size)
        assertEquals("\"Hello\"", cells[0])
        assertEquals("World", cells[1])
    }
}
