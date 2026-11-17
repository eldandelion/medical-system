package com.medicalsystem.backend.config

import com.medicalsystem.backend.model.NotificationMessageCode
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
 * Drops stale Hibernate-generated CHECK constraints on `notifications.message_code` in existing
 * MySQL schemas when new enum codes (e.g. STUDENT_ASSIGNED_TEACHER = 35) are introduced, because
 * `spring.jpa.hibernate.ddl-auto=update` does not alter existing CHECK constraints.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class NotificationSchemaMigration(
    private val jdbcTemplate: JdbcTemplate
) : ApplicationRunner {

    private val logger = LoggerFactory.getLogger(NotificationSchemaMigration::class.java)

    override fun run(args: ApplicationArguments) {
        try {
            val latestCode = NotificationMessageCode.entries.maxOf { it.code }.toString()
            val constraints = jdbcTemplate.queryForList(
                """
                SELECT tc.CONSTRAINT_NAME, cc.CHECK_CLAUSE
                FROM information_schema.TABLE_CONSTRAINTS tc
                JOIN information_schema.CHECK_CONSTRAINTS cc
                  ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA
                 AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
                WHERE tc.TABLE_SCHEMA = DATABASE()
                  AND tc.TABLE_NAME = 'notifications'
                  AND tc.CONSTRAINT_TYPE = 'CHECK'
                """.trimIndent()
            )

            for (row in constraints) {
                val name = row["CONSTRAINT_NAME"]?.toString() ?: continue
                val clause = row["CHECK_CLAUSE"]?.toString() ?: continue
                if (clause.contains("message_code") && !clause.contains(latestCode)) {
                    logger.info("Dropping stale MySQL CHECK constraint '{}' on notifications: {}", name, clause)
                    jdbcTemplate.execute("ALTER TABLE notifications DROP CHECK `$name`")
                }
            }
        } catch (e: Exception) {
            // H2 or databases without MySQL information_schema.CHECK_CONSTRAINTS are unaffected
            logger.debug("Skipping MySQL notification check-constraint migration: {}", e.message)
        }
    }
}
