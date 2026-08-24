package com.medicalsystem.backend.util

import org.slf4j.LoggerFactory
import java.io.BufferedReader
import java.io.ByteArrayInputStream
import java.io.InputStreamReader
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.Charset
import java.nio.charset.CodingErrorAction

/**
 * RFC-4180 compliant CSV parser with automatic character encoding detection (UTF-8 / UTF-8 BOM / GBK).
 *
 * Supports:
 * - UTF-8 with BOM (0xEF 0xBB 0xBF)
 * - UTF-8 without BOM
 * - GBK / GB2312 (common for Chinese Excel exports)
 *
 * Returns a List of row maps where each key is the normalized column header
 * and each value is the trimmed cell string (empty string if missing).
 */
object CsvStreamReader {

    private val logger = LoggerFactory.getLogger(CsvStreamReader::class.java)

    private const val DOUBLE_QUOTE = '"'
    private const val COMMA = ','
    private const val BOM_CHARACTER = '\uFEFF'
    private const val LINE_FEED = '\n'
    private const val BOM_HEADER_BYTE_COUNT = 3

    private val CHARSET_GBK: Charset by lazy { Charset.forName("GBK") }
    private val UTF8_BOM_BYTES = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())

    /**
     * Parses CSV bytes into a list of row maps keyed by column header names.
     *
     * @param bytes Raw CSV file payload.
     * @return List of row maps. Returns empty list if CSV contains only a header row.
     * @throws IllegalArgumentException if the byte array is empty or contains no valid lines.
     */
    fun parse(bytes: ByteArray): List<Map<String, String>> {
        require(bytes.isNotEmpty()) { "CSV file is empty." }

        val (charset, contentBytes) = detectCharsetAndStripBom(bytes)
        logger.info("CSV encoding detected: ${charset.name()}")

        val logicalLines = splitIntoLogicalLines(contentBytes, charset)
        require(logicalLines.isNotEmpty()) { "CSV file contains no readable lines." }

        val rawHeaders = parseLine(logicalLines.first())
        val headers = rawHeaders.map { it.trim().removePrefix(BOM_CHARACTER.toString()) }
        require(headers.isNotEmpty()) { "CSV file has no header row." }

        return logicalLines.drop(1)
            .filter { it.isNotBlank() }
            .map { logicalLine ->
                val cells = parseLine(logicalLine)
                headers.mapIndexed { index, header ->
                    header to (cells.getOrNull(index)?.trim() ?: "")
                }.toMap()
            }
    }

    /**
     * Detects character encoding by inspecting leading UTF-8 BOM bytes,
     * verifying UTF-8 validity via [CharsetDecoder], or falling back to GBK.
     */
    private fun detectCharsetAndStripBom(bytes: ByteArray): Pair<Charset, ByteArray> {
        if (hasLeadingUtf8Bom(bytes)) {
            val contentWithoutBom = bytes.copyOfRange(BOM_HEADER_BYTE_COUNT, bytes.size)
            return Charsets.UTF_8 to contentWithoutBom
        }

        return if (isValidUtf8(bytes)) {
            Charsets.UTF_8 to bytes
        } else {
            logger.warn("CSV bytes are not valid UTF-8; attempting GBK decoding.")
            CHARSET_GBK to bytes
        }
    }

    private fun hasLeadingUtf8Bom(bytes: ByteArray): Boolean {
        if (bytes.size < BOM_HEADER_BYTE_COUNT) return false
        return bytes[0] == UTF8_BOM_BYTES[0] &&
               bytes[1] == UTF8_BOM_BYTES[1] &&
               bytes[2] == UTF8_BOM_BYTES[2]
    }

    private fun isValidUtf8(bytes: ByteArray): Boolean {
        val decoder = Charsets.UTF_8.newDecoder()
            .onMalformedInput(CodingErrorAction.REPORT)
            .onUnmappableCharacter(CodingErrorAction.REPORT)
        return try {
            decoder.decode(ByteBuffer.wrap(bytes))
            true
        } catch (_: CharacterCodingException) {
            false
        }
    }

    /**
     * Aggregates physical text lines into RFC-4180 logical lines,
     * preserving multiline quoted fields across newline breaks.
     */
    private fun splitIntoLogicalLines(bytes: ByteArray, charset: Charset): List<String> {
        val reader = BufferedReader(InputStreamReader(ByteArrayInputStream(bytes), charset))
        val logicalLines = mutableListOf<String>()
        val currentRecord = StringBuilder()
        var insideQuotedField = false

        reader.forEachLine { physicalLine ->
            if (insideQuotedField) {
                currentRecord.append(LINE_FEED).append(physicalLine)
            } else {
                if (currentRecord.isNotEmpty()) {
                    logicalLines.add(currentRecord.toString())
                    currentRecord.clear()
                }
                currentRecord.append(physicalLine)
            }

            insideQuotedField = computeQuoteParity(physicalLine, insideQuotedField)
        }

        if (currentRecord.isNotEmpty()) {
            logicalLines.add(currentRecord.toString())
        }

        return logicalLines
    }

    private fun computeQuoteParity(lineChunk: String, initiallyInQuotes: Boolean): Boolean {
        var inQuotes = initiallyInQuotes
        var charIndex = 0
        while (charIndex < lineChunk.length) {
            if (lineChunk[charIndex] == DOUBLE_QUOTE) {
                if (charIndex + 1 < lineChunk.length && lineChunk[charIndex + 1] == DOUBLE_QUOTE) {
                    charIndex++ // Escaped quote pair ("")
                } else {
                    inQuotes = !inQuotes
                }
            }
            charIndex++
        }
        return inQuotes
    }

    /**
     * Parses a single logical CSV line into individual cell tokens per RFC-4180.
     */
    fun parseLine(line: String): List<String> {
        val cells = mutableListOf<String>()
        val currentCell = StringBuilder()
        var insideQuotes = false
        var charIndex = 0

        while (charIndex < line.length) {
            val character = line[charIndex]
            when {
                character == DOUBLE_QUOTE && !insideQuotes -> {
                    insideQuotes = true
                }
                character == DOUBLE_QUOTE && insideQuotes -> {
                    if (charIndex + 1 < line.length && line[charIndex + 1] == DOUBLE_QUOTE) {
                        currentCell.append(DOUBLE_QUOTE)
                        charIndex++ // Skip escaped quote pair
                    } else {
                        insideQuotes = false
                    }
                }
                character == COMMA && !insideQuotes -> {
                    cells.add(currentCell.toString())
                    currentCell.clear()
                }
                else -> currentCell.append(character)
            }
            charIndex++
        }

        cells.add(currentCell.toString())
        return cells
    }
}
