package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "scale_drafts",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_draft_student_scale", columnNames = ["student_id", "scale_code"])
    ],
    indexes = [
        Index(name = "idx_draft_student", columnList = "student_id")
    ]
)
class ScaleDraftEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "student_id", nullable = false)
    val studentId: Long,

    @Column(name = "scale_code", nullable = false, length = 64)
    val scaleCode: String,

    @Column(name = "answers_json", nullable = false, columnDefinition = "LONGTEXT")
    var answersJson: String,

    @Column(name = "client_updated_at", nullable = false)
    var clientUpdatedAt: Long,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
