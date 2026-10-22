package com.medicalsystem.backend.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret:medical-system-intake-secret-key-must-be-long-enough-32bytes}")
    private val jwtSecret: String
) {
    private val key: SecretKey by lazy {
        val secretBytes = jwtSecret.toByteArray(StandardCharsets.UTF_8)
        val validBytes = if (secretBytes.size < 32) {
            secretBytes.copyOf(32)
        } else {
            secretBytes
        }
        Keys.hmacShaKeyFor(validBytes)
    }

    private val validityMs: Long = 7 * 24 * 60 * 60 * 1000L

    fun generateToken(userId: Long, studentNumber: String? = null, role: String = "STUDENT"): String {
        val now = Date()
        val expiry = Date(now.time + validityMs)
        val builder = Jwts.builder()
            .subject(userId.toString())
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)

        if (studentNumber != null) {
            builder.claim("studentNumber", studentNumber)
        }
        return builder.compact()
    }

    fun validateAndExtractUserId(token: String): Long? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
            claims.subject?.toLongOrNull()
        } catch (e: Exception) {
            null
        }
    }

    fun validateAndExtractStudentNumber(token: String): String? {
        return try {
            val claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
            claims["studentNumber"] as? String ?: claims.subject
        } catch (e: Exception) {
            null
        }
    }
}
