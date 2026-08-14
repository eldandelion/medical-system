package com.medicalsystem.backend.storage.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class FileValidationServiceTest {

    private val service = FileValidationService()

    @Test
    fun `validateHeader should succeed for valid PDF magic bytes`() {
        val pdfHeader = "%PDF-1.5 some binary content".toByteArray()
        assertTrue(service.validateHeader(pdfHeader, "application/pdf"))
    }

    @Test
    fun `validateHeader should succeed for valid PNG magic bytes`() {
        val pngHeader = byteArrayOf(0x89.toByte(), 0x50.toByte(), 0x4E.toByte(), 0x47.toByte(), 0x0D.toByte(), 0x0A.toByte(), 0x1A.toByte(), 0x0A.toByte(), 0x00, 0x00)
        assertTrue(service.validateHeader(pngHeader, "image/png"))
    }

    @Test
    fun `validateHeader should succeed for valid JPEG magic bytes`() {
        val jpegHeader = byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0xE0.toByte(), 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46)
        assertTrue(service.validateHeader(jpegHeader, "image/jpeg"))
    }

    @Test
    fun `validateHeader should fail for executable disguised as PDF`() {
        val exeHeader = "MZ\u0090\u0000\u0003\u0000\u0000\u0000\u0004\u0000".toByteArray()
        assertFalse(service.validateHeader(exeHeader, "application/pdf"))
    }

    @Test
    fun `validateHeader should fail for empty bytes`() {
        assertFalse(service.validateHeader(ByteArray(0), "application/pdf"))
    }

    @Test
    fun `validateHeader should fail for disallowed MIME type`() {
        val scriptBytes = "echo 'hello world'".toByteArray()
        assertFalse(service.validateHeader(scriptBytes, "application/x-sh"))
    }
}
