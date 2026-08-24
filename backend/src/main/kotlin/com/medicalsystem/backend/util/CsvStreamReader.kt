package com.medicalsystem.backend.util

import org.slf4j.LoggerFactory
import java.io.BufferedReader
import java.io.ByteArrayInputStream
import java.io.InputStreamReader
import java.nio.charset.Charset

/**
 * RFC-4180 compliant CSV parser with automatic character encoding detection.
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

    private val UTF8_BOM = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())

    /**
     * Parse CSV bytes, returning a list of maps from header name to cell value.
     * Throws [IllegalArgumentException] if the file is empty or has no data rows.
     */
    fun parse(bytes: ByteArray): List<Map<String, String>> {
        if (bytes.isEmpty()) {
            throw IllegalArgumentException("CSV file is empty.")
        }

        val (charset, contentBytes) = detectCharsetAndStrip(bytes)
        logger.info("CSV encoding detected: ${charset.name()}")

        val lines = readLines(contentBytes, charset)
        if (lines.isEmpty()) {
            throw IllegalArgumentException("CSV file contains no readable lines.")
        }

        val headers = parseLine(lines[0]).map { it.trim().removePrefix("\uFEFF") }
        if (headers.isEmpty()) {
            throw IllegalArgumentException("CSV file has no header row.")
        }

        return lines.drop(1)
            .filter { it.isNotBlank() }
            .map { line ->
                val cells = parseLine(line)
                headers.mapIndexed { index, header ->
                    header to (cells.getOrNull(index)?.trim()?.removePrefix("\uFEFF") ?: "")
                }.toMap()
            }
    }

    /**
     * Detect charset from leading BOM bytes, falling back to UTF-8 then GBK.
     * Returns the resolved [Charset] and the raw content bytes (BOM stripped if present).
     */
    private fun detectCharsetAndStrip(bytes: ByteArray): Pair<Charset, ByteArray> {
        // Check and strip any leading UTF-8 BOMs
        var offset = 0
        while (offset + 2 < bytes.size &&
            bytes[offset] == UTF8_BOM[0] &&
            bytes[offset + 1] == UTF8_BOM[1] &&
            bytes[offset + 2] == UTF8_BOM[2]
        ) {
            offset += 3
        }
        if (offset > 0) {
            return Charsets.UTF_8 to bytes.drop(offset).toByteArray()
        }

        // Attempt UTF-8 decoding: if it round-trips cleanly, use it
        val utf8Attempt = String(bytes, Charsets.UTF_8)
        if (utf8Attempt.toByteArray(Charsets.UTF_8).contentEquals(bytes)) {
            return Charsets.UTF_8 to bytes
        }

        // Fall back to GBK for common Chinese Excel exports
        logger.warn("CSV bytes are not valid UTF-8; attempting GBK decoding.")
        return Charset.forName("GBK") to bytes
    }

    /**
     * Split decoded bytes into logical lines, respecting RFC-4180 quoted fields
     * that may span multiple lines.
     */
    private fun readLines(bytes: ByteArray, charset: Charset): List<String> {
        val reader = BufferedReader(InputStreamReader(ByteArrayInputStream(bytes), charset))
        val lines = mutableListOf<String>()
        val current = StringBuilder()
        var inQuotes = false

        reader.forEachLine { raw ->
            if (inQuotes) {
                current.append("\n").append(raw)
            } else {
                if (current.isNotEmpty()) {
                    lines.add(current.toString())
                    current.clear()
                }
                current.append(raw)
            }
            // Count unescaped quotes to track open/close state
            var i = 0
            val s = if (inQuotes) raw else current.toString()
            while (i < s.length) {
                if (s[i] == '"') {
                    if (i + 1 < s.length && s[i + 1] == '"') {
                        i++ // escaped quote ""
                    } else {
                        inQuotes = !inQuotes
                    }
                }
                i++
            }
        }
        if (current.isNotEmpty()) lines.add(current.toString())
        return lines
    }

    /**
     * Parse a single CSV line into a list of cell strings, per RFC-4180.
     * Handles quoted fields containing commas, escaped double-quotes (""), and newlines.
     */
    fun parseLine(line: String): List<String> {
        val cells = mutableListOf<String>()
        val cell = StringBuilder()
        var inQuotes = false
        var i = 0

        while (i < line.length) {
            val ch = line[i]
            when {
                ch == '"' && !inQuotes -> {
                    inQuotes = true
                }
                ch == '"' && inQuotes -> {
                    if (i + 1 < line.length && line[i + 1] == '"') {
                        // Escaped double-quote ""
                        cell.append('"')
                        i++
                    } else {
                        inQuotes = false
                    }
                }
                ch == ',' && !inQuotes -> {
                    cells.add(cell.toString())
                    cell.clear()
                }
                else -> cell.append(ch)
            }
            i++
        }
        cells.add(cell.toString())
        return cells
    }
}
